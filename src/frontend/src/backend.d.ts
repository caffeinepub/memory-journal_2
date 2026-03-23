import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NewMemoryInput {
    title: string;
    date: string;
    photoIds: Array<string>;
    narrative: string;
    location: string;
}
export interface MemoryEntry {
    id: bigint;
    title: string;
    date: string;
    createdAt: bigint;
    photoIds: Array<string>;
    narrative: string;
    location: string;
}
export interface UserProfile {
    name: string;
    email: string;
    profilePicture?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMemory(input: NewMemoryInput): Promise<bigint>;
    deleteMemory(id: bigint): Promise<void>;
    getAllMemories(): Promise<Array<MemoryEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMemoriesByLocation(location: string): Promise<Array<MemoryEntry>>;
    getMemoriesByYear(year: bigint): Promise<Array<MemoryEntry>>;
    getMemoriesCount(): Promise<bigint>;
    getMemory(id: bigint): Promise<MemoryEntry>;
    getOnThisDayMemories(month: bigint, day: bigint): Promise<Array<MemoryEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isMemoryStoreEmpty(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchMemories(searchTerm: string): Promise<Array<MemoryEntry>>;
    updateMemory(id: bigint, input: NewMemoryInput): Promise<void>;
}
