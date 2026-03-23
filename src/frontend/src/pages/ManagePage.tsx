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
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Calendar, Edit2, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { MemoryEntry, NewMemoryInput } from "../backend";
import MemoryForm from "../components/MemoryForm";
import PhotoImage from "../components/PhotoImage";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateMemory,
  useDeleteMemory,
  useGetAllMemories,
  useIsAdmin,
  useUpdateMemory,
} from "../hooks/useQueries";

export default function ManagePage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: memories = [], isLoading } = useGetAllMemories();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MemoryEntry | null>(null);
  const createMemory = useCreateMemory();
  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();

  const isAuthenticated = !!identity;

  const handleCreate = async (input: NewMemoryInput) => {
    await createMemory.mutateAsync(input);
    setAddOpen(false);
    toast.success("Memory added!");
  };

  const handleUpdate = async (input: NewMemoryInput) => {
    if (!editTarget) return;
    await updateMemory.mutateAsync({ id: editTarget.id, input });
    setEditTarget(null);
    toast.success("Memory updated!");
  };

  const handleDelete = async (id: bigint, title: string) => {
    await deleteMemory.mutateAsync(id);
    toast.success(`"${title}" deleted`);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-4">
          Sign In Required
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          You need to sign in to manage memories.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="rounded-full uppercase tracking-widest text-xs px-8"
          data-ocid="manage.button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-10"
        data-ocid="manage.loading_state"
      >
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-4">
          Access Denied
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Only administrators can manage memories.
        </p>
        <Link to="/" className="text-primary underline text-sm">
          Return home
        </Link>
      </div>
    );
  }

  const sorted = [...memories].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Manage Memories
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {memories.length} {memories.length === 1 ? "memory" : "memories"}{" "}
              in your journal
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="rounded-full uppercase tracking-widest text-xs"
            data-ocid="manage.add_button"
          >
            <Plus size={15} className="mr-1.5" /> Add Memory
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="manage.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="text-center py-20 border-2 border-dashed border-border rounded-2xl text-muted-foreground"
            data-ocid="manage.empty_state"
          >
            <p className="font-serif text-xl mb-3">No memories yet</p>
            <p className="text-sm mb-5">Start building your journal.</p>
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-full text-xs uppercase tracking-widest"
              data-ocid="manage.primary_button"
            >
              <Plus size={14} className="mr-1" /> Add Your First Memory
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((memory, i) => (
              <motion.div
                key={memory.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-xs transition-shadow"
                data-ocid={`manage.item.${i + 1}`}
              >
                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-border">
                  <PhotoImage
                    photoId={memory.photoIds[0]}
                    fallbackSeed={`manage-${memory.id.toString()}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to="/memory/$id"
                    params={{ id: memory.id.toString() }}
                    className="block font-serif font-semibold text-foreground hover:text-primary transition-colors truncate text-base"
                  >
                    {memory.title}
                  </Link>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
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
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditTarget(memory)}
                    className="rounded-full text-xs h-8 px-3"
                    data-ocid={`manage.edit_button.${i + 1}`}
                  >
                    <Edit2 size={12} className="mr-1" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs h-8 px-3 text-destructive border-destructive/30 hover:bg-destructive/10"
                        data-ocid={`manage.delete_button.${i + 1}`}
                      >
                        <Trash2 size={12} className="mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="manage.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete memory?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &ldquo;{memory.title}
                          &rdquo;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="manage.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(memory.id, memory.title)}
                          className="bg-destructive hover:bg-destructive/90"
                          data-ocid="manage.confirm_button"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="manage.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Add New Memory
            </DialogTitle>
          </DialogHeader>
          <MemoryForm
            onSubmit={handleCreate}
            onCancel={() => setAddOpen(false)}
            submitting={createMemory.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="manage.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Edit Memory
            </DialogTitle>
          </DialogHeader>
          {editTarget && (
            <MemoryForm
              initialData={editTarget}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
              submitting={updateMemory.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
