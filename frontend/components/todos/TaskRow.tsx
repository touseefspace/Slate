"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, Trash2, Check } from "lucide-react";
import { MotionBox } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Todo } from "@/types";

type TaskRowProps = {
  todo: Todo;
  onToggleComplete: () => Promise<void>;
  onDelete: () => Promise<void>;
  onUpdate: (title: string, description?: string) => Promise<void>;
  isPending: boolean;
  isPendingDelete: boolean;
  compact?: boolean;
};

export function TaskRow({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
  isPending,
  isPendingDelete,
  compact = false,
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description ?? "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    
    setIsSaving(true);
    try {
      await onUpdate(trimmedTitle, editDesc.trim() || undefined);
      setIsEditing(false);
    } catch {
      // Keep editor open on failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      whileHover={{ scale: 1.002 }}
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl border border-borderSubtle bg-bgPanel/30 hover:bg-bgHover/40 hover:border-borderStrong transition-all duration-150 relative",
        compact ? "py-2.5 px-3.5 gap-3" : "py-4 px-5",
        todo.completed && "opacity-75",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Premium Circular Checkbox */}
      <div className="flex items-center shrink-0 mt-0.5 relative cursor-pointer" onClick={onToggleComplete}>
        <div
          className={cn(
            "size-5 rounded-full border flex items-center justify-center transition-all duration-150",
            todo.completed
              ? "bg-primary border-primary text-bgBase scale-100"
              : "border-textDisabled hover:border-primary group-hover:scale-105"
          )}
        >
          {todo.completed && <Check className="size-3.5 stroke-[3.5]" />}
        </div>
      </div>

      {/* Task Content / Inline Editor */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2 mt-0.5">
            <input
              ref={editInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-bgBase border border-borderStrong rounded px-2.5 py-1 text-sm text-textPrimary outline-none focus:ring-1 focus:ring-primary"
              placeholder="Task title..."
              disabled={isSaving}
            />
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-bgBase border border-borderSubtle rounded px-2.5 py-1 text-xs text-textSecondary outline-none focus:ring-1 focus:ring-primary"
              placeholder="Description (optional)..."
              disabled={isSaving}
            />
            <div className="flex items-center gap-1.5 pt-1">
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-7 text-xs px-2.5">
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isSaving} className="h-7 text-xs px-2.5 text-textMuted hover:text-textPrimary bg-bgPanel">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div onClick={handleStartEdit} className="cursor-pointer w-full py-0.5">
            <p
              className={cn(
                "text-sm font-medium leading-snug break-words text-textPrimary select-none transition-all duration-150",
                todo.completed && "text-textMuted line-through"
              )}
            >
              {todo.title}
            </p>
            {todo.description && (
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed text-textSecondary select-none transition-all duration-150",
                  todo.completed && "opacity-60"
                )}
              >
                {todo.description}
              </p>
            )}
            {todo.id < 0 && (
              <span className="inline-block mt-1 text-[10px] text-textDisabled animate-pulse font-mono">
                Syncing...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Touch friendly & Hover State */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity duration-150 ml-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            disabled={isPending}
            className="size-7 text-textMuted hover:text-danger hover:bg-bgPanel transition-all duration-150"
            aria-label="Delete task"
          >
            {isPendingDelete ? (
              <Loader2 className="size-3.5 animate-spin text-textMuted" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        </div>
      )}
    </MotionBox>
  );
}
