"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Plus, Trash2, FileText, ChevronLeft, Calendar, Search, ArrowUpDown, Check } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toastError, toastSuccess } from "@/lib/toasts";
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

export function NoteList() {
  const {
    notes,
    isLoading,
    isError,
    error,
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    pendingDeleteId,
  } = useNotes();

  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Multi-select Selection States (Samsung Notes style)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [hasLongPressed, setHasLongPressed] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Long press event handlers for selection mode
  const handlePressStart = (id: number) => {
    setHasLongPressed(false);
    if (isSelectionMode) return;
    
    touchTimerRef.current = setTimeout(() => {
      setHasLongPressed(true);
      setIsSelectionMode(true);
      setSelectedNoteIds([id]);
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 600); // 600ms hold
  };

  const handlePressEnd = (id: number) => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handlePressCancel = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleCardClick = (id: number) => {
    if (hasLongPressed) {
      setHasLongPressed(false);
      return; // Skip click immediately following the long-press activation
    }
    
    if (isSelectionMode) {
      setSelectedNoteIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      handleSelectNote(id);
    }
  };

  async function handleSelectNote(id: number | null) {
    if (activeNoteId === id) return;
    if (typeof window !== "undefined") {
      const isDirty = (window as any).isNoteEditorDirty;
      const flushSaveFn = (window as any).flushNoteEditorSave;
      if (isDirty && typeof flushSaveFn === "function") {
        const canNavigate = await flushSaveFn();
        if (!canNavigate) return; // Block note switch
      }
    }
    setActiveNoteId(id);
  }

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



  // Command palette and navigation events
  useEffect(() => {
    const handleNewNote = () => handleCreate();
    window.addEventListener("app:new-note", handleNewNote);
    
    const handleNavNotes = (e: Event) => {
      const customEvent = e as CustomEvent<{ id?: number }>;
      const targetId = customEvent.detail?.id || null;
      if (targetId) {
        handleSelectNote(targetId);
      } else {
        // Reset to grid landing only on mobile viewports
        if (window.innerWidth < 768) {
          handleSelectNote(null);
        }
      }
    };
    window.addEventListener("app:nav-notes", handleNavNotes);

    return () => {
      window.removeEventListener("app:new-note", handleNewNote);
      window.removeEventListener("app:nav-notes", handleNavNotes);
    };
  }, [notes, activeNoteId]);

  async function handleCreate() {
    if (typeof window !== "undefined") {
      const isDirty = (window as any).isNoteEditorDirty;
      const flushSaveFn = (window as any).flushNoteEditorSave;
      if (isDirty && typeof flushSaveFn === "function") {
        const canNavigate = await flushSaveFn();
        if (!canNavigate) return; // Block note creation/switch
      }
    }
    try {
      const newNote = await createNote({
        title: "Untitled Note",
        content: "",
      });
      toastSuccess("Note created");
      if (newNote?.id) {
        setActiveNoteId(newNote.id);
      }
    } catch (err) {
      toastError(err, "Failed to create note");
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteNote(id);
      toastSuccess("Note deleted");
      if (activeNoteId === id) {
        setActiveNoteId(null);
      }
    } catch (err) {
      toastError(err, "Failed to delete note");
    }
  }

  async function handleBulkDelete() {
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedNoteIds.map((id) => deleteNote(id)));
      toastSuccess(
        `${selectedNoteIds.length} ${selectedNoteIds.length === 1 ? "note" : "notes"} deleted`
      );
      if (activeNoteId && selectedNoteIds.includes(activeNoteId)) {
        setActiveNoteId(null);
      }
      setIsSelectionMode(false);
      setSelectedNoteIds([]);
      setIsDeleteModalOpen(false);
    } catch (err) {
      toastError(err, "Failed to delete notes");
    } finally {
      setIsBulkDeleting(false);
    }
  }

  async function handleAutoSave(id: number, title: string, content: string) {
    await updateNote({
      id,
      data: {
        title,
        content: content || null,
      },
    });
  }

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // Filter notes locally
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      note.title.toLowerCase().includes(query) ||
      (note.content && note.content.toLowerCase().includes(query))
    );
  });

  // Sort notes by date (updated_at)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const timeA = new Date(a.updated_at).getTime();
    const timeB = new Date(b.updated_at).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  if (isLoading) {
    if (isMobile) {
      return (
        <div className="space-y-6 w-full animate-pulse">
          <div className="flex items-center justify-between pb-2 border-b border-borderSubtle/10 gap-4">
            <Skeleton className="h-8 w-24 rounded-md" />
            <div className="flex items-center gap-2 w-full max-w-[200px] sm:max-w-xs md:max-w-md">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md shrink-0 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-bgPanel/30 border-borderSubtle p-2.5 rounded-xl h-[135px] flex flex-col justify-between">
                <Skeleton className="h-16 w-full rounded-lg animate-pulse" />
                <div className="mt-2 space-y-1.5">
                  <Skeleton className="h-2.5 w-2/3 rounded animate-pulse" />
                  <Skeleton className="h-2 w-1/3 rounded animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-6 h-[500px] w-full animate-pulse">
        <div className="space-y-3 col-span-1">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md shrink-0 animate-pulse" />
          </div>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-bgPanel/30 border-borderSubtle p-3 rounded-xl h-[130px] flex flex-col justify-between">
              <Skeleton className="h-14 w-full rounded-lg animate-pulse" />
              <div className="mt-2 space-y-1">
                <Skeleton className="h-3 w-2/3 rounded animate-pulse" />
                <Skeleton className="h-2 w-1/3 rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
        <div className="col-span-2">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
        {error instanceof Error ? error.message : "Failed to load notes"}
      </p>
    );
  }

  const selectedNoteAttr = activeNote ? { "data-selected-note": activeNote.id } : {};

  // ==========================================
  // MOBILE VIEWPORT FLOWS (< 768px)
  // ==========================================
  if (isMobile) {
    if (activeNoteId !== null) {
      return (
        <div className="w-full h-full flex flex-col min-h-0" {...selectedNoteAttr}>
          <NoteEditor 
            note={activeNote} 
            onSave={handleAutoSave} 
            onBack={() => handleSelectNote(null)}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4 w-full h-full flex flex-col min-h-0 relative" {...selectedNoteAttr}>
        {/* Header Bar */}
        {isSelectionMode ? (
          <div className="flex items-center justify-between w-full pb-2 border-b border-borderSubtle/10 shrink-0 h-10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedNoteIds([]);
                }}
                className="h-9 w-9 text-textSecondary hover:text-textPrimary rounded-lg"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <span className="text-sm font-semibold text-textPrimary">
                {selectedNoteIds.length} selected
              </span>
            </div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedNoteIds.length === sortedNotes.length) {
                    setSelectedNoteIds([]);
                  } else {
                    setSelectedNoteIds(sortedNotes.map((n) => n.id));
                  }
                }}
                className="text-xs text-primary font-semibold hover:bg-transparent"
              >
                {selectedNoteIds.length === sortedNotes.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full pb-2 border-b border-borderSubtle/10 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-textMuted" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bgPanel border-borderSubtle focus-visible:ring-primary text-sm pl-9 h-10 w-full"
              />
            </div>
            
            {/* Sort Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
              className={cn(
                "shrink-0 bg-bgPanel hover:bg-bgHover border-borderSubtle transition-all duration-150 h-10 w-10",
                sortOrder === "asc" && "text-primary border-primary/30"
              )}
              title={sortOrder === "desc" ? "Sort: Newest First" : "Sort: Oldest First"}
              aria-label="Sort Notes"
            >
              <ArrowUpDown className="size-4" />
            </Button>

            {/* New Note Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleCreate}
              disabled={isCreating}
              className="shrink-0 bg-bgPanel hover:bg-bgHover border-borderSubtle hover:text-primary transition-all duration-150 h-10 w-10"
              aria-label="New Note"
            >
              {isCreating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
            </Button>
          </div>
        )}

        {sortedNotes.length === 0 ? (
          <div className="flex-1 min-h-0">
            <Card className="bg-bgPanel/30 border-borderSubtle h-full flex items-center justify-center">
              <CardContent className="py-8 text-center">
                <FileText className="size-12 text-textDisabled mx-auto mb-3" />
                <h4 className="font-medium text-textSecondary mb-1">No notes found</h4>
                <p className="text-sm text-textMuted">
                  {searchQuery ? "Try a different search query or" : "Jot down your first brilliant idea!"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="mt-4 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 animate-in fade-in zoom-in-95 duration-200"
                  >
                    Create Note
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-3 gap-2 pr-1 pb-4">
            {sortedNotes.map((note) => {
              const isPendingDelete = pendingDeleteId === note.id;
              const isSelected = selectedNoteIds.includes(note.id);
              const snippet = note.content 
                ? note.content.replace(/<[^>]*>/g, "").trim()
                : "";

              return (
                <Card
                  key={note.id}
                  onTouchStart={() => handlePressStart(note.id)}
                  onTouchEnd={() => handlePressEnd(note.id)}
                  onTouchMove={handlePressCancel}
                  onMouseDown={() => handlePressStart(note.id)}
                  onMouseUp={() => handlePressEnd(note.id)}
                  onMouseLeave={handlePressCancel}
                  onClick={() => handleCardClick(note.id)}
                  className={cn(
                    "group cursor-pointer border bg-bgPanel/40 border-borderSubtle hover:border-borderStrong hover:bg-bgHover/40 transition-all duration-200 relative overflow-hidden active:scale-[0.98] h-[135px] flex flex-col justify-between p-2.5 rounded-xl shadow-sm hover:shadow-md select-none",
                    isSelectionMode && "pl-8.5",
                    isSelected && "border-primary/50 bg-primary/5 hover:bg-primary/5 shadow-primary/5 shadow-lg",
                    isPendingDelete && "opacity-50 pointer-events-none"
                  )}
                >
                  {/* Tick Circle Icon (Samsung Notes style) */}
                  {isSelectionMode && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      {isSelected ? (
                        <div className="size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground border border-primary animate-in zoom-in-50 duration-150">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="size-5 rounded-full border border-borderStrong bg-bgPanel/80" />
                      )}
                    </div>
                  )}

                  <div className="flex flex-col h-full justify-between w-full">
                    <div className="space-y-1">
                      {/* Title */}
                      <h4 className="text-[11px] font-semibold text-textPrimary leading-snug truncate group-hover:text-primary transition-colors duration-150">
                        {note.title || "Untitled Note"}
                      </h4>
                      {/* Snippet (No Inner Box!) */}
                      {snippet ? (
                        <p className="text-[9px] text-textSecondary line-clamp-3 leading-relaxed font-normal break-words">
                          {snippet}
                        </p>
                      ) : (
                        <p className="text-[9px] text-textDisabled italic leading-relaxed font-normal">
                          Empty note
                        </p>
                      )}
                    </div>

                    {/* Footer Info Container */}
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-borderSubtle/5">
                      <div className="flex items-center gap-1 text-[8px] text-textMuted min-w-0 flex-1">
                        <Calendar className="size-2.5 shrink-0" />
                        <span className="truncate">
                          {new Date(note.updated_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Floating Delete Button for Selection Mode */}
        {isSelectionMode && selectedNoteIds.length > 0 && (
          <div className="fixed bottom-[88px] right-6 z-40 animate-in fade-in slide-in-from-bottom-6 duration-200">
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-danger hover:bg-danger/95 text-white shadow-xl hover:shadow-danger/10 hover:shadow-2xl rounded-full flex items-center justify-center gap-2 h-12 px-5 border border-danger/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              <Trash2 className="size-4 stroke-[2.5]" />
              <span className="text-xs font-bold tracking-wide">DELETE ({selectedNoteIds.length})</span>
            </Button>
          </div>
        )}

        {/* Premium Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-bgPanel border border-borderSubtle/60 rounded-2xl w-full max-w-xs p-5 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="size-12 rounded-full bg-danger/10 text-danger flex items-center justify-center border border-danger/25">
                <Trash2 className="size-5 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5 w-full">
                <h3 className="text-sm font-bold text-textPrimary">Delete {selectedNoteIds.length} {selectedNoteIds.length === 1 ? 'note' : 'notes'}?</h3>
                <p className="text-[11px] text-textMuted leading-relaxed">
                  This action cannot be undone. Selected notes will be permanently deleted.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full pt-1">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isBulkDeleting}
                  className="flex-1 bg-bgBase hover:bg-bgHover border-borderSubtle h-9 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex-1 bg-danger hover:bg-danger/90 text-white border-0 h-9 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  {isBulkDeleting ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // DESKTOP PERSISTENT 3-ZONE LAYOUT (>= 768px)
  // ==========================================
  return (
    <div className="grid grid-cols-3 gap-6 items-stretch flex-1 min-h-0 w-full h-full" {...selectedNoteAttr}>
      {/* Middle Pane: Vertical Note List Stack (1/3 Width) */}
      <div className="space-y-4 col-span-1 flex flex-col h-full min-h-0">
        {/* Search and Action Row */}
        <div className="flex gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-textMuted" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bgPanel border-borderSubtle focus-visible:ring-primary text-sm pl-9 h-10 w-full"
            />
          </div>
          
          {/* Sort Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className={cn(
              "shrink-0 bg-bgPanel hover:bg-bgHover border-borderSubtle transition-all duration-150 h-10 w-10",
              sortOrder === "asc" && "text-primary border-primary/30"
            )}
            title={sortOrder === "desc" ? "Sort: Newest First" : "Sort: Oldest First"}
            aria-label="Sort Notes"
          >
            <ArrowUpDown className="size-4" />
          </Button>

          {/* New Note Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleCreate}
            disabled={isCreating}
            className="shrink-0 bg-bgPanel hover:bg-bgHover border-borderSubtle hover:text-primary transition-all duration-150 h-10 w-10"
            aria-label="New Note"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </div>

        {/* Vertical Scrollable Stack (Cards reflect Mobile Card Structure) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
          {sortedNotes.length === 0 ? (
            <Card className="bg-bgPanel/30 border-borderSubtle">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-textMuted">
                  {searchQuery ? "No matches found." : "No notes yet. Click + to add one."}
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedNotes.map((note) => {
              const isPendingDelete = pendingDeleteId === note.id;
              const isActive = note.id === activeNoteId;
              const snippet = note.content 
                ? note.content.replace(/<[^>]*>/g, "").trim()
                : "";

              return (
                <Card
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className={cn(
                    "group cursor-pointer border transition-all duration-150 relative overflow-hidden active:scale-[0.98] md:active:scale-100 rounded-xl flex flex-col justify-between p-3.5",
                    isActive 
                      ? "bg-bgHover border-primary/45 shadow-sm" 
                      : "bg-bgPanel/50 border-borderSubtle hover:border-borderStrong hover:bg-bgHover/40",
                    isPendingDelete && "opacity-50 pointer-events-none"
                  )}
                >
                  <div className="flex flex-col h-full justify-between w-full">
                    <div className="space-y-1">
                      {/* Title */}
                      <h4 className={cn(
                        "text-xs font-semibold leading-snug truncate transition-colors duration-150",
                        isActive ? "text-primary" : "text-textPrimary group-hover:text-primary"
                      )}>
                        {note.title || "Untitled Note"}
                      </h4>
                      {/* Snippet (No Inner Box!) */}
                      {snippet ? (
                        <p className="text-[10px] text-textSecondary line-clamp-3 leading-relaxed font-normal break-words">
                          {snippet}
                        </p>
                      ) : (
                        <p className="text-[10px] text-textDisabled italic leading-relaxed font-normal">
                          Empty note
                        </p>
                      )}
                    </div>

                    {/* Footer Info Container */}
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-borderSubtle/5">
                      <div className="flex items-center gap-1 text-[9px] text-textMuted min-w-0 flex-1">
                        <Calendar className="size-3 shrink-0" />
                        <span className="truncate">
                          {new Date(note.updated_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => handleDelete(note.id, e)}
                        disabled={isPendingDelete}
                        className="self-start opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 hover:text-danger text-textMuted transition-all duration-150 size-6 shrink-0 -mr-1"
                        aria-label="Delete Note"
                      >
                        {isPendingDelete ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Main Editor Slate (2/3 Width) */}
      <div className="col-span-2 flex flex-col h-full min-h-0">
        <NoteEditor note={activeNote} onSave={handleAutoSave} />
      </div>
    </div>
  );
}
