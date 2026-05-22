"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { createTodoApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Todo, TodoCreate, TodoUpdate } from "@/types";

type UpdateVars = { id: number; data: TodoUpdate };

export function useTodos() {
  const { user, getIdToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createTodoApi(getIdToken);

  const query = useQuery({
    queryKey: queryKeys.todos.all,
    queryFn: () => api.list(),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationKey: ["todos", "create"],
    mutationFn: async ({ data }: { data: TodoCreate }) => api.create(data),
    onMutate: async ({ data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.all });
      const previous = queryClient.getQueryData<Todo[]>(queryKeys.todos.all) ?? [];
      const tempId = -Date.now();
      const optimisticTodo: Todo = {
        id: tempId,
        user_id: user?.uid ?? "temp-user",
        title: data.title,
        description: data.description ?? null,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Todo[]>(queryKeys.todos.all, [optimisticTodo, ...previous]);
      return { previous, tempId };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.todos.all, context.previous);
      }
    },
    onSuccess: (createdTodo, _vars, context) => {
      queryClient.setQueryData<Todo[]>(queryKeys.todos.all, (current = []) =>
        current.map((todo) => (todo.id === context?.tempId ? createdTodo : todo)),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });

  const updateMutation = useMutation({
    mutationKey: ["todos", "update"],
    mutationFn: ({ id, data }: UpdateVars) => api.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.all });
      const previous = queryClient.getQueryData<Todo[]>(queryKeys.todos.all) ?? [];
      queryClient.setQueryData<Todo[]>(queryKeys.todos.all, (current = []) =>
        current.map((todo) =>
          todo.id === id ? { ...todo, ...data, updated_at: new Date().toISOString() } : todo,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.todos.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["todos", "delete"],
    mutationFn: ({ id }: { id: number }) => api.delete(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.all });
      const previous = queryClient.getQueryData<Todo[]>(queryKeys.todos.all) ?? [];
      queryClient.setQueryData<Todo[]>(queryKeys.todos.all, (current = []) =>
        current.filter((todo) => todo.id !== id),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.todos.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createTodo: (data: TodoCreate) => createMutation.mutateAsync({ data }),
    updateTodo: (args: UpdateVars) => updateMutation.mutateAsync(args),
    deleteTodo: (id: number) => deleteMutation.mutateAsync({ id }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    pendingUpdateId: updateMutation.variables?.id ?? null,
    pendingDeleteId: deleteMutation.variables?.id ?? null,
  };
}
