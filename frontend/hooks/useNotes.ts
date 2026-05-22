"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { createNoteApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Note, NoteCreate, NoteUpdate } from "@/types";

type UpdateVars = { id: number; data: NoteUpdate };

export function useNotes() {
  const { user, getIdToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createNoteApi(getIdToken);

  const query = useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: () => api.list(),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationKey: ["notes", "create"],
    mutationFn: async ({ data }: { data: NoteCreate }) => api.create(data),
    onMutate: async ({ data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });
      const previous = queryClient.getQueryData<Note[]>(queryKeys.notes.all) ?? [];
      const tempId = -Date.now();
      const optimisticNote: Note = {
        id: tempId,
        user_id: user?.uid ?? "temp-user",
        title: data.title,
        content: data.content ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Note[]>(queryKeys.notes.all, [optimisticNote, ...previous]);
      return { previous, tempId };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notes.all, context.previous);
      }
    },
    onSuccess: (createdNote, _vars, context) => {
      queryClient.setQueryData<Note[]>(queryKeys.notes.all, (current = []) =>
        current.map((note) => (note.id === context?.tempId ? createdNote : note)),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });

  const updateMutation = useMutation({
    mutationKey: ["notes", "update"],
    mutationFn: ({ id, data }: UpdateVars) => api.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });
      const previous = queryClient.getQueryData<Note[]>(queryKeys.notes.all) ?? [];
      queryClient.setQueryData<Note[]>(queryKeys.notes.all, (current = []) =>
        current.map((note) =>
          note.id === id ? { ...note, ...data, updated_at: new Date().toISOString() } : note,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notes.all, context.previous);
      }
    },
    onSuccess: (updatedNote) => {
      queryClient.setQueryData<Note[]>(queryKeys.notes.all, (current = []) =>
        current.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["notes", "delete"],
    mutationFn: ({ id }: { id: number }) => api.delete(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });
      const previous = queryClient.getQueryData<Note[]>(queryKeys.notes.all) ?? [];
      queryClient.setQueryData<Note[]>(queryKeys.notes.all, (current = []) =>
        current.filter((note) => note.id !== id),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notes.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createNote: (data: NoteCreate) => createMutation.mutateAsync({ data }),
    updateNote: (args: UpdateVars) => updateMutation.mutateAsync(args),
    deleteNote: (id: number) => deleteMutation.mutateAsync({ id }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    pendingUpdateId: updateMutation.variables?.id ?? null,
    pendingDeleteId: deleteMutation.variables?.id ?? null,
  };
}
