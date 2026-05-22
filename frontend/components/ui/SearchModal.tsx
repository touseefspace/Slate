"use client";

import React, { useEffect, useState } from "react";
import { Search, CheckSquare, FileText, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTodos } from "@/hooks/useTodos";
import { useNotes } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";
import type { Todo, Note } from "@/types";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { todos } = useTodos();
  const { notes } = useNotes();

  useEffect(() => {
    const handleTrigger = () => setOpen(true);
    window.addEventListener("app:global-search", handleTrigger);
    return () => window.removeEventListener("app:global-search", handleTrigger);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Trigger search if '/' is pressed and no input/textarea is focused
      if (e.key === "/" && 
          document.activeElement === document.body && 
          !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const cleanQuery = query.toLowerCase().trim();

  const matchedTodos = cleanQuery
    ? todos.filter((t) => t.title.toLowerCase().includes(cleanQuery))
    : [];

  const matchedNotes = cleanQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(cleanQuery) ||
          (n.content && n.content.toLowerCase().includes(cleanQuery))
      )
    : [];

  const hasResults = matchedTodos.length > 0 || matchedNotes.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-bgElevated border border-borderSubtle shadow-2xl rounded-xl">
        <div className="flex items-center px-4 border-b border-borderSubtle bg-bgBase/50">
          <Search className="size-4 text-textSecondary mr-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, notes, documents..."
            className="w-full h-12 bg-transparent text-textPrimary placeholder-textMuted text-sm outline-none border-none py-3"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-textMuted hover:text-textPrimary transition-colors px-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-6 text-center text-sm text-textMuted">
              Type something to search globally...
            </div>
          )}

          {query && !hasResults && (
            <div className="py-6 text-center text-sm text-textMuted">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {matchedTodos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-textMuted uppercase tracking-wider px-2">
                Tasks ({matchedTodos.length})
              </h4>
              <div className="space-y-1">
                {matchedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bgBase/30 hover:bg-bgHover border border-transparent hover:border-borderSubtle transition-all cursor-pointer group"
                    onClick={() => {
                      setOpen(false);
                      // Custom navigation event
                      window.dispatchEvent(new CustomEvent("app:nav-inbox"));
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckSquare className={cn("size-4 shrink-0", todo.completed ? "text-primary" : "text-textMuted")} />
                      <span className={cn("text-sm truncate text-textSecondary group-hover:text-textPrimary", todo.completed && "line-through opacity-60")}>
                        {todo.title}
                      </span>
                    </div>
                    <ArrowRight className="size-3 text-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-textMuted uppercase tracking-wider px-2">
                Notes ({matchedNotes.length})
              </h4>
              <div className="space-y-1">
                {matchedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bgBase/30 hover:bg-bgHover border border-transparent hover:border-borderSubtle transition-all cursor-pointer group"
                    onClick={() => {
                      setOpen(false);
                      // Navigate to note tab and set active note
                      window.dispatchEvent(new CustomEvent("app:nav-notes", { detail: { id: note.id } }));
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="size-4 text-textMuted shrink-0 group-hover:text-primary transition-colors" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm truncate block text-textSecondary group-hover:text-textPrimary font-medium">
                          {note.title}
                        </span>
                        {note.content && (
                          <span className="text-xs text-textMuted truncate block mt-0.5">
                            {note.content}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="size-3 text-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
