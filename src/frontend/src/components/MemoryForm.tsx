import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { MemoryEntry, NewMemoryInput } from "../backend";
import { useUploadPhoto } from "../hooks/useBlobStorage";

interface MemoryFormProps {
  initialData?: MemoryEntry;
  onSubmit: (input: NewMemoryInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export default function MemoryForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
}: MemoryFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [date, setDate] = useState(
    initialData?.date ?? new Date().toISOString().split("T")[0],
  );
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [narrative, setNarrative] = useState(initialData?.narrative ?? "");
  const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>(
    initialData?.photoIds ?? [],
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, uploading, progress } = useUploadPhoto();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingPhoto = (idx: number) => {
    setExistingPhotoIds((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }
    try {
      const uploadedIds = await Promise.all(
        newFiles.map((f) => uploadPhoto(f)),
      );
      const photoIds = [...existingPhotoIds, ...uploadedIds];
      await onSubmit({
        title: title.trim(),
        date,
        location: location.trim(),
        narrative: narrative.trim(),
        photoIds,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save memory");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label
          htmlFor="mem-title"
          className="text-xs uppercase tracking-widest"
        >
          Title *
        </Label>
        <Input
          id="mem-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this memory a title…"
          required
          data-ocid="memory_form.input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="mem-date"
            className="text-xs uppercase tracking-widest"
          >
            Date *
          </Label>
          <Input
            id="mem-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            data-ocid="memory_form.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="mem-loc"
            className="text-xs uppercase tracking-widest"
          >
            Location
          </Label>
          <Input
            id="mem-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where were you?"
            data-ocid="memory_form.input"
          />
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest">Photos</Label>
        <div className="flex flex-wrap gap-2">
          {existingPhotoIds.map((pid, i) => (
            <div
              key={pid}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
            >
              <img
                src={`https://picsum.photos/seed/existing-${i}/160/160`}
                className="w-full h-full object-cover"
                alt=""
              />
              <button
                type="button"
                onClick={() => removeExistingPhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div
              key={src}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
            >
              <img src={src} className="w-full h-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            data-ocid="memory_form.upload_button"
          >
            <ImageIcon size={20} />
            <span className="text-[10px]">Add</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {uploading && (
          <div
            className="text-xs text-muted-foreground"
            data-ocid="memory_form.loading_state"
          >
            Uploading photos… {progress}%
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="mem-narrative"
          className="text-xs uppercase tracking-widest"
        >
          Narrative
        </Label>
        <Textarea
          id="mem-narrative"
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder="Tell the story of this memory…"
          rows={6}
          className="resize-none"
          data-ocid="memory_form.textarea"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-full uppercase tracking-widest text-xs flex-1 sm:flex-none sm:px-8"
          data-ocid="memory_form.submit_button"
        >
          {submitting || uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />{" "}
              {initialData ? "Update Memory" : "Save Memory"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-full uppercase tracking-widest text-xs"
          data-ocid="memory_form.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
