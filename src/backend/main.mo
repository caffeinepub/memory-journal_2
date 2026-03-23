import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  module MemoryEntry {
    public func compare(a : MemoryEntry, b : MemoryEntry) : Order.Order {
      Nat.compare(b.id, a.id); // Sort by descending id (newest first)
    };

    public func compareByDate(a : MemoryEntry, b : MemoryEntry) : Order.Order {
      Text.compare(b.date, a.date); // Sort newest date first
    };

    public func compareByIdAsc(a : MemoryEntry, b : MemoryEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type MemoryEntry = {
    id : Nat;
    title : Text;
    date : Text; // ISO date string (YYYY-MM-DD)
    location : Text;
    photoIds : [Text];
    narrative : Text;
    createdAt : Int; // timestamp
  };

  type NewMemoryInput = {
    title : Text;
    date : Text;
    location : Text;
    photoIds : [Text];
    narrative : Text;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    profilePicture : ?Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data stores
  let memories = Map.empty<Nat, MemoryEntry>();
  var nextId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper to get memory or trap
  func findMemoryOrTrap(id : Nat) : MemoryEntry {
    switch (memories.get(id)) {
      case (null) { Runtime.trap("Memory entry not found") };
      case (?memory) { memory };
    };
  };

  // Memory CRUD
  public shared ({ caller }) func createMemory(input : NewMemoryInput) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create memories");
    };
    let id = nextId;
    let memory : MemoryEntry = {
      id;
      title = input.title;
      date = input.date;
      location = input.location;
      photoIds = input.photoIds;
      narrative = input.narrative;
      createdAt = Time.now();
    };
    memories.add(id, memory);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func updateMemory(id : Nat, input : NewMemoryInput) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update memories");
    };
    let existing = findMemoryOrTrap(id);
    let updated : MemoryEntry = {
      existing with
      title = input.title;
      date = input.date;
      location = input.location;
      photoIds = input.photoIds;
      narrative = input.narrative;
    };
    memories.add(id, updated);
  };

  public shared ({ caller }) func deleteMemory(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete memories");
    };
    ignore findMemoryOrTrap(id);
    memories.remove(id);
  };

  public query ({ caller }) func getMemory(id : Nat) : async MemoryEntry {
    findMemoryOrTrap(id);
  };

  public query ({ caller }) func getAllMemories() : async [MemoryEntry] {
    memories.values().toArray().sort(MemoryEntry.compareByDate);
  };

  public query ({ caller }) func searchMemories(searchTerm : Text) : async [MemoryEntry] {
    memories.values().toArray().filter(
      func(memory) {
        memory.title.contains(#text searchTerm) or memory.location.contains(#text searchTerm) or memory.date.contains(#text searchTerm);
      }
    ).sort(MemoryEntry.compareByDate);
  };

  public query ({ caller }) func getMemoriesByLocation(location : Text) : async [MemoryEntry] {
    memories.values().toArray().filter(
      func(memory) {
        memory.location.toLower().contains(#text (location.toLower()));
      }
    ).sort(MemoryEntry.compareByDate);
  };

  // "On This Day" - returns memories from previous years matching the same month/day
  public query ({ caller }) func getOnThisDayMemories(month : Nat, day : Nat) : async [MemoryEntry] {
    memories.values().toArray().filter(
      func(memory) {
        let parts = memory.date.split(#char '-').toArray();
        if (parts.size() >= 3) {
          let monthPart = Int.fromText(parts[1]);
          let dayPart = Int.fromText(parts[2]);

          switch (monthPart, dayPart) {
            case (?monthInt, ?dayInt) {
              if (monthInt >= 0 and dayInt >= 0) {
                month == monthInt.toNat() and day == dayInt.toNat();
              } else { false };
            };
            case (_) { false };
          };
        } else {
          false;
        };
      }
    ).sort(MemoryEntry.compareByIdAsc);
  };

  public query ({ caller }) func getMemoriesByYear(year : Nat) : async [MemoryEntry] {
    memories.values().toArray().filter(
      func(memory) {
        let parts = memory.date.split(#char '-').toArray();
        if (parts.size() >= 1) {
          let yearPart = Int.fromText(parts[0]);
          switch (yearPart) {
            case (?yearInt) {
              if (yearInt >= 0) { year == yearInt.toNat() } else { false };
            };
            case (_) { false };
          };
        } else {
          false;
        };
      }
    ).sort(MemoryEntry.compareByDate);
  };

  // User profile (for personalized experience)
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Seed memories if empty
  func seedMemoriesIfNeeded() {
    if (memories.isEmpty()) {
      let sampleMemories = [
        (
          {
            title = "Eiffel Tower Sunset";
            date = "2020-06-15";
            location = "Paris, France";
            photoIds = [];
            narrative = "Magical evening watching the sunset from the Eiffel Tower. Unforgettable view!";
          },
        ),
        (
          {
            title = "Cherry Blossoms in Kyoto";
            date = "2019-04-05";
            location = "Kyoto, Japan";
            photoIds = [];
            narrative = "Springtime stroll through breathtaking cherry blossom gardens. Pure serenity.";
          },
        ),
        (
          {
            title = "Broadway Night Out";
            date = "2021-09-20";
            location = "New York, USA";
            photoIds = [];
            narrative = "Saw my first Broadway show! The energy and talent were incredible.";
          },
        ),
        (
          {
            title = "Santorini Sunsets";
            date = "2018-08-10";
            location = "Santorini, Greece";
            photoIds = [];
            narrative = "Mesmerizing blue rooftops, delicious food, and the best sunsets I've ever seen!";
          },
        ),
        (
          {
            title = "Sydney Opera House Tour";
            date = "2017-02-28";
            location = "Sydney, Australia";
            photoIds = [];
            narrative = "Learned about amazing architecture and attended a live concert. So inspiring!";
          },
        ),
        (
          {
            title = "Amazon Rainforest Adventure";
            date = "2022-11-12";
            location = "Manaus, Brazil";
            photoIds = [];
            narrative = "Boat trip through the Amazon River, saw incredible wildlife and nature.";
          },
        ),
      ];
      let currentTime = Time.now();
      if (not memories.isEmpty()) { return };
      for (sample in sampleMemories.values()) {
        let id = nextId;
        let memory : MemoryEntry = {
          id;
          title = sample.title;
          date = sample.date;
          location = sample.location;
          photoIds = sample.photoIds;
          narrative = sample.narrative;
          createdAt = currentTime;
        };
        memories.add(id, memory);
        nextId += 1;
      };
    };
  };

  system func preupgrade() { seedMemoriesIfNeeded() };

  public query ({ caller }) func isMemoryStoreEmpty() : async Bool {
    memories.isEmpty();
  };

  public query ({ caller }) func getMemoriesCount() : async Nat {
    memories.size();
  };
};
