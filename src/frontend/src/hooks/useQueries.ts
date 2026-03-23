import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MemoryEntry, NewMemoryInput } from "../backend";
import { useActor } from "./useActor";

export function useGetAllMemories() {
  const { actor, isFetching } = useActor();
  return useQuery<MemoryEntry[]>({
    queryKey: ["memories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMemories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMemory(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<MemoryEntry>({
    queryKey: ["memory", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getMemory(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchMemories(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MemoryEntry[]>({
    queryKey: ["memories", "search", searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchMemories(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

export function useGetOnThisDayMemories() {
  const { actor, isFetching } = useActor();
  const today = new Date();
  const month = BigInt(today.getMonth() + 1);
  const day = BigInt(today.getDate());
  return useQuery<MemoryEntry[]>({
    queryKey: ["memories", "onthisday", month.toString(), day.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOnThisDayMemories(month, day);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewMemoryInput) => {
      if (!actor) throw new Error("No actor");
      return actor.createMemory(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
}

export function useUpdateMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: NewMemoryInput }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateMemory(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
}

export function useDeleteMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMemory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
}
