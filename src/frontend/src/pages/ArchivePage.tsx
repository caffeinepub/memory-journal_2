import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { MemoryEntry } from "../backend";
import PhotoImage from "../components/PhotoImage";
import { useGetAllMemories } from "../hooks/useQueries";

type Mode = "date" | "place";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"];

function MemoryGridItem({
  memory,
  index,
}: { memory: MemoryEntry; index: number }) {
  const seedId = `arch-${memory.id.toString()}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      data-ocid={`archive.item.${index + 1}`}
    >
      <Link
        to="/memory/$id"
        params={{ id: memory.id.toString() }}
        className="group block rounded-xl overflow-hidden border border-border shadow-xs hover:shadow-warm transition-shadow bg-card"
      >
        <div className="relative h-44 overflow-hidden">
          <PhotoImage
            photoId={memory.photoIds[0]}
            fallbackSeed={seedId}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif font-semibold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {memory.title}
          </h3>
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {(() => {
                try {
                  return format(parseISO(memory.date), "MMM d, yyyy");
                } catch {
                  return memory.date;
                }
              })()}
            </span>
            {memory.location && (
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {memory.location}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function groupByDate(memories: MemoryEntry[]) {
  const groups: Record<string, Record<string, MemoryEntry[]>> = {};
  const sorted = [...memories].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  for (const m of sorted) {
    try {
      const d = parseISO(m.date);
      const year = format(d, "yyyy");
      const month = format(d, "MMMM");
      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];
      groups[year][month].push(m);
    } catch {
      if (!groups.Unknown) groups.Unknown = {};
      if (!groups.Unknown.Unknown) groups.Unknown.Unknown = [];
      groups.Unknown.Unknown.push(m);
    }
  }
  return groups;
}

function groupByPlace(memories: MemoryEntry[]) {
  const groups: Record<string, MemoryEntry[]> = {};
  for (const m of memories) {
    const key = m.location?.trim() || "Unspecified Location";
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return groups;
}

export default function ArchivePage() {
  const [mode, setMode] = useState<Mode>("date");
  const { data: memories = [], isLoading } = useGetAllMemories();

  const dateGroups = groupByDate(memories);
  const placeGroups = groupByPlace(memories);
  let itemIndex = 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Archive
        </h1>
        <p className="text-muted-foreground text-sm">
          {memories.length} {memories.length === 1 ? "memory" : "memories"}{" "}
          preserved
        </p>
      </motion.div>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        className="mb-8"
      >
        <TabsList
          className="bg-secondary border border-border"
          data-ocid="archive.tab"
        >
          <TabsTrigger
            value="date"
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest"
            data-ocid="archive.tab"
          >
            <Calendar size={13} /> By Date
          </TabsTrigger>
          <TabsTrigger
            value="place"
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest"
            data-ocid="archive.tab"
          >
            <MapPin size={13} /> By Place
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="archive.loading_state"
        >
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="archive.empty_state"
        >
          <p className="font-serif text-xl mb-2">No memories yet</p>
          <Link to="/manage" className="text-primary underline text-sm">
            Add your first memory →
          </Link>
        </div>
      ) : mode === "date" ? (
        <div className="space-y-12">
          {Object.entries(dateGroups).map(([year, months]) => (
            <section key={year}>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                {year}
                <span className="w-px h-6 bg-border" />
                <span className="text-sm font-normal text-muted-foreground font-sans">
                  {Object.values(months).flat().length} memories
                </span>
              </h2>
              {Object.entries(months).map(([month, mems]) => (
                <div key={month} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      {month}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {mems.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mems.map((m) => {
                      const idx = itemIndex++;
                      return (
                        <MemoryGridItem
                          key={m.id.toString()}
                          memory={m}
                          index={idx}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(placeGroups)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([place, mems]) => (
              <section key={place}>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <MapPin size={20} className="text-primary" />
                  {place}
                  <span className="w-px h-6 bg-border" />
                  <span className="text-sm font-normal text-muted-foreground font-sans">
                    {mems.length} {mems.length === 1 ? "memory" : "memories"}
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mems.map((m) => {
                    const idx = itemIndex++;
                    return (
                      <MemoryGridItem
                        key={m.id.toString()}
                        memory={m}
                        index={idx}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
