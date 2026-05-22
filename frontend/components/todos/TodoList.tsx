"use client";

import React, { useState, useEffect } from "react";
import { Plus, Loader2, Sparkles, Filter, CheckCircle2, Circle } from "lucide-react";
import { TaskRow } from "@/components/todos/TaskRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodos } from "@/hooks/useTodos";
import { toastError, toastSuccess } from "@/lib/toasts";
import { cn } from "@/lib/utils";
import type { Todo } from "@/types";

export function TodoList() {
  const {
    todos,
    isLoading,
    isError,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    isCreating,
    pendingUpdateId,
    pendingDeleteId,
  } = useTodos();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Viewport detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Command palette and keyboard hooks
  useEffect(() => {
    const handleNewTask = () => setShowQuickAdd(true);
    window.addEventListener("app:new-task", handleNewTask);
    return () => window.removeEventListener("app:new-task", handleNewTask);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Quick Add input on 'Q' pressed when not focusing inputs
      if (e.key === "q" && document.activeElement === document.body) {
        e.preventDefault();
        setShowQuickAdd((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    try {
      await createTodo({
        title: trimmedTitle,
        description: description.trim() || null,
      });
      setTitle("");
      setDescription("");
      toastSuccess("Todo created");
    } catch (err) {
      toastError(err, "Failed to create todo");
    }
  }

  async function toggleComplete(todo: Todo) {
    try {
      await updateTodo({
        id: todo.id,
        data: { completed: !todo.completed },
      });
      toastSuccess(todo.completed ? "Task set to active" : "Task completed");
    } catch (err) {
      toastError(err, "Failed to update todo");
    }
  }

  async function handleUpdate(todoId: number, updatedTitle: string, updatedDesc?: string) {
    try {
      await updateTodo({
        id: todoId,
        data: {
          title: updatedTitle,
          description: updatedDesc || null,
        },
      });
      toastSuccess("Todo updated");
    } catch (err) {
      toastError(err, "Failed to update todo");
      throw err;
    }
  }

  async function handleDelete(todoId: number) {
    try {
      await deleteTodo(todoId);
      toastSuccess("Todo deleted");
    } catch (err) {
      toastError(err, "Failed to delete todo");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
        {error instanceof Error ? error.message : "Failed to load todos"}
      </p>
    );
  }

  // Filter logic
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Row (No header text) */}
      <div className="flex flex-row justify-between items-center gap-2 pb-2 border-b border-borderSubtle/10 w-full">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-bgPanel/40 border border-borderSubtle rounded-xl flex-1 md:flex-initial">
          {[
            { id: "all", label: isMobile ? "All" : "All Tasks", count: todos.length },
            { id: "active", label: "Active", count: todos.filter((t) => !t.completed).length },
            { id: "completed", label: "Completed", count: todos.filter((t) => t.completed).length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={cn(
                "flex-1 md:flex-initial px-2 md:px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 whitespace-nowrap",
                filter === item.id
                  ? "bg-bgActive text-primary border border-borderSubtle/60 shadow-sm"
                  : "text-textMuted hover:text-textSecondary border border-transparent"
              )}
            >
              <span>{item.label}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full shrink-0",
                filter === item.id ? "bg-primary/10 text-primary" : "bg-bgPanel text-textDisabled"
              )}>
                {item.count}
              </span>
            </button>
          ))}
        </div>
        
        {/* Quick actions & toggle (Styled exactly like Notes new note button) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowQuickAdd((prev) => !prev)}
          className={cn(
            "shrink-0 bg-bgPanel hover:bg-bgHover border-borderSubtle hover:text-primary transition-all duration-150 h-10 w-10",
            showQuickAdd && "text-primary border-primary/30 bg-bgActive"
          )}
          aria-label="New Task"
        >
          {isCreating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
        </Button>
      </div>

      {/* Quick Add Form Section */}
      {showQuickAdd && (
        <Card className="bg-bgPanel/40 border-borderStrong shadow-lg overflow-hidden animate-in fade-in-0 slide-in-from-top-3 duration-200">
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                placeholder="What needs to be done? (Press Enter to add)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-bgBase border-borderSubtle text-sm focus-visible:ring-primary h-10"
                autoFocus
              />
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-bgBase border-borderSubtle text-xs focus-visible:ring-primary h-8"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-textMuted font-mono">
                  Press Enter to Save • Esc to close
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickAdd(false)}
                    className="h-8 text-xs text-textMuted hover:text-textPrimary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="h-8 text-xs bg-primary hover:bg-primary/95 text-bgBase font-semibold px-3"
                  >
                    {isCreating ? (
                      <Loader2 className="size-3 animate-spin mr-1" />
                    ) : (
                      "Add Task"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Task List Surface */}
      {filteredTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 py-16 text-center bg-bgPanel/10 border border-dashed border-borderSubtle rounded-2xl">
          <CheckCircle2 className="size-10 text-textDisabled mb-3.5 stroke-[1.2]" />
          <h4 className="font-medium text-textSecondary text-sm">Nothing due right now</h4>
          <p className="text-xs text-textMuted mt-1">Enjoy your clean Slate! ✨</p>
          <Button
            variant="ghost"
            onClick={() => setShowQuickAdd(true)}
            className="mt-4 text-xs font-semibold text-primary hover:text-primary hover:bg-bgPanel/30 h-8 border border-borderSubtle/30"
          >
            Create first task
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredTodos.map((todo) => {
            const isPendingUpdate = pendingUpdateId === todo.id;
            const isPendingDelete = pendingDeleteId === todo.id;
            const isPending = isPendingDelete || isPendingUpdate || todo.id < 0;

            return (
              <li key={todo.id}>
                <TaskRow
                  todo={todo}
                  onToggleComplete={() => toggleComplete(todo)}
                  onDelete={() => handleDelete(todo.id)}
                  onUpdate={(t, d) => handleUpdate(todo.id, t, d)}
                  isPending={isPending}
                  isPendingDelete={isPendingDelete}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
