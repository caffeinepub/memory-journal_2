import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { differenceInCalendarYears, format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { MemoryEntry } from "../backend";
import BookSpreadCard from "../components/BookSpreadCard";
import HeroCarousel from "../components/HeroCarousel";
import PhotoImage from "../components/PhotoImage";
import {
  useGetAllMemories,
  useGetOnThisDayMemories,
} from "../hooks/useQueries";

function OnThisDayItem({
  memory,
  index,
}: { memory: MemoryEntry; index: number }) {
  const seedId = `otd-${memory.id.toString()}`;
  const years = differenceInCalendarYears(new Date(), new Date(memory.date));
  return (
    <Link
      to="/memory/$id"
      params={{ id: memory.id.toString() }}
      className="flex items-center gap-3 group"
      data-ocid={`onthisday.item.${index + 1}`}
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border">
        <PhotoImage
          photoId={memory.photoIds[0]}
          fallbackSeed={seedId}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <span className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-0.5">
          {years > 0 ? `${years} year${years > 1 ? "s" : ""} ago` : "This year"}
        </span>
        <span className="block text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {memory.title}
        </span>
        {memory.location && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
            <MapPin size={10} />
            {memory.location}
          </span>
        )}
      </div>
    </Link>
  );
}

function ArchiveThumb({ memory }: { memory: MemoryEntry }) {
  const seedId = `arch-${memory.id.toString()}`;
  return (
    <Link
      to="/memory/$id"
      params={{ id: memory.id.toString() }}
      className="shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border hover:border-primary transition-colors shadow-xs group"
    >
      <div className="relative w-full h-full">
        <PhotoImage
          photoId={memory.photoIds[0]}
          fallbackSeed={seedId}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { data: memories = [], isLoading } = useGetAllMemories();
  const { data: onThisDay = [] } = useGetOnThisDayMemories();

  const sorted = [...memories].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const heroMemories = sorted.slice(0, 5);
  const feedMemories = sorted.slice(0, 8);
  const archiveMemories = sorted.slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        {isLoading ? (
          <Skeleton
            className="h-[520px] w-full rounded-2xl"
            data-ocid="hero.loading_state"
          />
        ) : (
          <HeroCarousel memories={heroMemories} />
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Memory Journal
            </h2>
            <Link
              to="/archive"
              className="text-xs font-medium uppercase tracking-widest text-primary hover:opacity-75"
            >
              View All →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-6" data-ocid="feed.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          ) : feedMemories.length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground"
              data-ocid="feed.empty_state"
            >
              <p className="font-serif text-xl mb-2">No memories yet</p>
              <p className="text-sm">Start by adding your first memory.</p>
              <Link
                to="/manage"
                className="inline-block mt-4 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-widest"
              >
                Add Memory
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {feedMemories.map((memory, i) => (
                <BookSpreadCard
                  key={memory.id.toString()}
                  memory={memory}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-8">
          {onThisDay.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-5 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} className="text-primary" />
                <h3 className="font-serif text-base font-semibold text-foreground">
                  On This Day
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
                {format(new Date(), "MMMM d")}
              </p>
              <div className="space-y-4">
                {onThisDay.slice(0, 4).map((m, i) => (
                  <OnThisDayItem key={m.id.toString()} memory={m} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {memories.length > 0 &&
            (() => {
              const locationCounts: Record<string, number> = {};
              for (const m of memories) {
                if (m.location) {
                  locationCounts[m.location] =
                    (locationCounts[m.location] ?? 0) + 1;
                }
              }
              const locations = Object.entries(locationCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8);
              if (!locations.length) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-card rounded-xl border border-border p-5 shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={15} className="text-primary" />
                    <h3 className="font-serif text-base font-semibold">
                      Places
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {locations.map(([loc, count]) => (
                      <Link
                        key={loc}
                        to="/archive"
                        search={{ mode: "place" }}
                        className="px-3 py-1 rounded-full text-xs border border-border bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        {loc} ({count})
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })()}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="bg-card rounded-xl border border-border p-5 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={15} className="text-primary" />
              <h3 className="font-serif text-base font-semibold">
                Recent Dates
              </h3>
            </div>
            <div className="space-y-2">
              {sorted.slice(0, 5).map((m) => (
                <Link
                  key={m.id.toString()}
                  to="/memory/$id"
                  params={{ id: m.id.toString() }}
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-24 shrink-0">
                    {(() => {
                      try {
                        return format(parseISO(m.date), "MMM d, yyyy");
                      } catch {
                        return m.date;
                      }
                    })()}
                  </span>
                  <span className="text-foreground truncate">{m.title}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </aside>
      </div>

      {archiveMemories.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              From the Archives
            </h2>
            <Link
              to="/archive"
              className="text-xs font-medium uppercase tracking-widest text-primary hover:opacity-75"
            >
              Browse All →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3">
            {archiveMemories.map((m) => (
              <ArchiveThumb key={m.id.toString()} memory={m} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
