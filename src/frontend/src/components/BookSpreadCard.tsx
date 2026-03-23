import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { MemoryEntry } from "../backend";
import PhotoImage from "./PhotoImage";

interface BookSpreadCardProps {
  memory: MemoryEntry;
  index: number;
}

export default function BookSpreadCard({ memory, index }: BookSpreadCardProps) {
  const isOdd = index % 2 === 0;
  const seedId = `feed-${memory.id.toString()}`;
  const imgSrc = memory.photoIds[0];

  const formattedDate = (() => {
    try {
      return format(parseISO(memory.date), "MMMM d, yyyy");
    } catch {
      return memory.date;
    }
  })();

  const ImagePage = (
    <div
      className={`relative w-full h-full min-h-[280px] overflow-hidden ${
        isOdd ? "page-shadow-left" : "page-shadow-right"
      }`}
    >
      <PhotoImage
        photoId={imgSrc}
        fallbackSeed={seedId}
        className="w-full h-full object-cover"
        alt={memory.title}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30" />
    </div>
  );

  const TextPage = (
    <div
      className={`flex flex-col justify-center p-6 sm:p-8 bg-card ${
        isOdd ? "page-shadow-right" : "page-shadow-left"
      }`}
    >
      <div className="flex items-center gap-3 mb-3 text-muted-foreground text-xs font-medium uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formattedDate}
        </span>
        {memory.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {memory.location}
          </span>
        )}
      </div>
      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-4 leading-tight">
        {memory.title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-5 mb-5">
        {memory.narrative}
      </p>
      <Link
        to="/memory/$id"
        params={{ id: memory.id.toString() }}
        className="self-start text-xs font-medium uppercase tracking-widest text-primary border-b border-primary pb-0.5 hover:opacity-75 transition-opacity"
      >
        Continue Reading →
      </Link>
    </div>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex rounded-xl overflow-hidden shadow-book border border-border"
      data-ocid={`feed.item.${index + 1}`}
    >
      {isOdd ? (
        <>
          <div className="w-1/2 sm:w-5/12 shrink-0">{ImagePage}</div>
          <div className="book-spine" />
          <div className="flex-1">{TextPage}</div>
        </>
      ) : (
        <>
          <div className="flex-1">{TextPage}</div>
          <div className="book-spine" />
          <div className="w-1/2 sm:w-5/12 shrink-0">{ImagePage}</div>
        </>
      )}
    </motion.article>
  );
}
