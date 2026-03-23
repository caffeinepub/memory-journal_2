import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { MemoryEntry } from "../backend";
import PhotoImage from "./PhotoImage";

interface HeroCarouselProps {
  memories: MemoryEntry[];
}

export default function HeroCarousel({ memories }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (memories.length === 0) return null;

  const prev = () =>
    setCurrent((c) => (c - 1 + memories.length) % memories.length);
  const next = () => setCurrent((c) => (c + 1) % memories.length);

  const memory = memories[current];
  const seedId = `hero-${memory.id.toString()}`;
  const imgSrc = memory.photoIds[0];

  return (
    <section className="relative overflow-hidden rounded-2xl shadow-book">
      <div className="text-center mb-3">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Featured Memory
        </span>
      </div>

      <div className="relative h-[420px] sm:h-[520px] rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <PhotoImage
              photoId={imgSrc}
              fallbackSeed={seedId}
              className="w-full h-full object-cover"
              alt={memory.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
              <div className="flex items-center gap-4 mb-3 text-white/75 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {(() => {
                    try {
                      return format(parseISO(memory.date), "MMMM d, yyyy");
                    } catch {
                      return memory.date;
                    }
                  })()}
                </span>
                {memory.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {memory.location}
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-3 leading-tight">
                {memory.title}
              </h2>
              <p className="text-white/85 text-sm sm:text-base line-clamp-2 max-w-2xl mb-4">
                {memory.narrative}
              </p>
              <Link
                to="/memory/$id"
                params={{ id: memory.id.toString() }}
                className="inline-block px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium uppercase tracking-widest hover:opacity-90 transition-opacity"
                data-ocid="hero.button"
              >
                Read More
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/35 transition-colors"
          aria-label="Previous"
          data-ocid="hero.pagination_prev"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/35 transition-colors"
          aria-label="Next"
          data-ocid="hero.pagination_next"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {memories.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {memories.map((mem, i) => (
            <button
              key={mem.id.toString()}
              type="button"
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current
                  ? "bg-primary w-5"
                  : "bg-border hover:bg-muted-foreground"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
