import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearch } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { MemoryEntry } from "../backend";
import PhotoImage from "../components/PhotoImage";
import { useSearchMemories } from "../hooks/useQueries";

function SearchResultItem({
  memory,
  index,
}: { memory: MemoryEntry; index: number }) {
  const seedId = `search-${memory.id.toString()}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      data-ocid={`search.item.${index + 1}`}
    >
      <Link
        to="/memory/$id"
        params={{ id: memory.id.toString() }}
        className="group flex gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-warm transition-shadow"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden border border-border">
          <PhotoImage
            photoId={memory.photoIds[0]}
            fallbackSeed={seedId}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {memory.title}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
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
                <MapPin size={11} />
                {memory.location}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {memory.narrative}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function SearchPage() {
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [query, setQuery] = useState(searchParams.q ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const {
    data: results = [],
    isLoading,
    isFetching,
  } = useSearchMemories(debouncedQuery);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
          Search Memories
        </h1>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, location, or date…"
            className="pl-10 rounded-full border-border text-base"
            autoFocus
            data-ocid="search.search_input"
          />
        </div>
      </motion.div>

      {query.trim() === "" ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-serif text-xl">Start typing to search</p>
          <p className="text-sm mt-2">
            Search through titles, places, and dates
          </p>
        </div>
      ) : isLoading || isFetching ? (
        <div className="space-y-4" data-ocid="search.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="search.empty_state"
        >
          <p className="font-serif text-xl mb-2">No memories found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          {results.map((m, i) => (
            <SearchResultItem key={m.id.toString()} memory={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
