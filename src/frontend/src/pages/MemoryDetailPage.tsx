import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  MapPin,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { NewMemoryInput } from "../backend";
import MemoryForm from "../components/MemoryForm";
import PhotoImage from "../components/PhotoImage";
import {
  useDeleteMemory,
  useGetMemory,
  useIsAdmin,
  useUpdateMemory,
} from "../hooks/useQueries";

function NarrativeParagraphs({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let charOffset = 0;
  for (const line of lines) {
    const key = `offset-${charOffset}`;
    if (line) {
      nodes.push(
        <p
          key={key}
          className="text-foreground leading-[1.9] text-base sm:text-lg mb-5 font-serif"
        >
          {line}
        </p>,
      );
    } else {
      nodes.push(<br key={key} />);
    }
    charOffset += line.length + 1;
  }
  return <div className="prose prose-stone max-w-none">{nodes}</div>;
}

export default function MemoryDetailPage() {
  const params = useParams({ strict: false });
  const id = BigInt(params.id ?? "0");
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  const { data: memory, isLoading } = useGetMemory(id);
  const { data: isAdmin } = useIsAdmin();
  const deleteMemory = useDeleteMemory();
  const updateMemory = useUpdateMemory();

  const photos = memory?.photoIds ?? [];
  const photoCount = Math.max(photos.length, 1);
  const seedId = `detail-${id.toString()}`;
  const currentPhotoId = photos[photoIdx];

  const prevPhoto = () => setPhotoIdx((i) => (i - 1 + photoCount) % photoCount);
  const nextPhoto = () => setPhotoIdx((i) => (i + 1) % photoCount);

  const handleDelete = async () => {
    try {
      await deleteMemory.mutateAsync(id);
      toast.success("Memory deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete memory");
    }
  };

  const handleUpdate = async (input: NewMemoryInput) => {
    await updateMemory.mutateAsync({ id, input });
    setEditOpen(false);
    toast.success("Memory updated");
  };

  if (isLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-12 space-y-6"
        data-ocid="memory.loading_state"
      >
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!memory) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-20 text-center"
        data-ocid="memory.error_state"
      >
        <p className="font-serif text-2xl text-muted-foreground mb-4">
          Memory not found
        </p>
        <Link to="/" className="text-primary underline">
          Return home
        </Link>
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      return format(parseISO(memory.date), "EEEE, MMMM d, yyyy");
    } catch {
      return memory.date;
    }
  })();

  return (
    <article className="min-h-screen bg-background">
      <div className="relative h-[50vh] sm:h-[65vh] bg-foreground overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={photoIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <PhotoImage
              photoId={currentPhotoId}
              fallbackSeed={`${seedId}-${photoIdx}`}
              className="w-full h-full object-cover"
              alt={memory.title}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />
          </motion.div>
        </AnimatePresence>

        <Link
          to="/"
          className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/35 transition-colors"
          data-ocid="memory.link"
        >
          <ArrowLeft size={18} />
        </Link>

        {isAdmin && (
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditOpen(true)}
              className="rounded-full bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/35 text-xs"
              data-ocid="memory.edit_button"
            >
              <Edit2 size={14} className="mr-1" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-full bg-destructive/80 backdrop-blur-sm text-xs"
                  data-ocid="memory.delete_button"
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="memory.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove &ldquo;{memory.title}&rdquo;
                    and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="memory.cancel_button">
                    Keep it
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    data-ocid="memory.confirm_button"
                  >
                    Delete forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/35 transition-colors"
              aria-label="Previous photo"
              data-ocid="memory.pagination_prev"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/35 transition-colors"
              aria-label="Next photo"
              data-ocid="memory.pagination_next"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-5 right-5 bg-black/40 text-white text-xs rounded-full px-3 py-1">
              {photoIdx + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((pid, i) => (
              <button
                key={pid || `thumb-pos-${i}`}
                type="button"
                onClick={() => setPhotoIdx(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === photoIdx ? "border-primary" : "border-transparent"
                }`}
              >
                <PhotoImage
                  photoId={pid}
                  fallbackSeed={`${seedId}-thumb-${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              {formattedDate}
            </span>
            {memory.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                {memory.location}
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mb-8 leading-tight">
            {memory.title}
          </h1>

          <NarrativeParagraphs text={memory.narrative} />
        </motion.div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="memory.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Edit Memory
            </DialogTitle>
          </DialogHeader>
          <MemoryForm
            initialData={memory}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
            submitting={updateMemory.isPending}
          />
        </DialogContent>
      </Dialog>
    </article>
  );
}
