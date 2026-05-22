"use client";

import React, { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { history } from "@tiptap/pm/history";
import { 
  Loader2, 
  Check, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Calendar, 
  Code, 
  CheckSquare, 
  AlertCircle, 
  FileText,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Quote,
  Minus,
  Undo,
  Redo,
  Terminal,
  ChevronLeft
} from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toasts";
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

type NoteEditorProps = {
  note: Note | null;
  onSave?: (noteId: number, title: string, content: string) => Promise<void>;
  onBack?: () => void;
};

// Define extensions outside the component to prevent duplicate registration warnings on re-render.
const EDITOR_EXTENSIONS = [
  StarterKit.configure({
    heading: {
      levels: [1, 2],
    },
  }),
  Underline,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Placeholder.configure({
    placeholder: "Write something premium here...",
    emptyEditorClass: "is-editor-empty before:text-textDisabled before:content-[attr(data-placeholder)] before:float-left before:h-0 before:pointer-events-none",
  }),
];

export function NoteEditor({ note, onSave, onBack }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Refs for tracking drafts and status
  const titleRef = useRef("");
  const isDirtyRef = useRef(false);
  const noteIdRef = useRef<number | null>(null);
  const prevNoteRef = useRef<Note | null>(null);

  // Refs for dirty checking
  const lastSavedTitleRef = useRef("");
  const lastSavedContentRef = useRef("");

  // Programmatic content set flag
  const isProgrammaticUpdateRef = useRef(false);

  // Race-condition sequence/version tracking
  const saveCountRef = useRef(0);
  const lastSuccessfulVersionRef = useRef(0);

  // Debounced auto-save timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    immediatelyRender: false,
    editorProps: {
      handleKeyDown: (view, event) => {
        // Intercept Backspace inside an empty list item to cleanly toggle off the list formatting
        if (event.key === "Backspace") {
          const { state } = view;
          const { selection } = state;
          
          if (selection.empty) {
            const $from = selection.$from;
            
            // Check if cursor is at the very beginning of the paragraph block
            if ($from.parentOffset === 0) {
              const parent = $from.parent;
              const isParagraphEmpty = parent.content.size === 0;
              
              let insideList = false;
              let listType: "bullet" | "ordered" | "task" | null = null;
              
              // Climb depth of the document node tree to identify if inside lists
              for (let i = $from.depth; i > 0; i--) {
                const nodeType = $from.node(i).type.name;
                if (nodeType === "bulletList") {
                  insideList = true;
                  listType = "bullet";
                  break;
                } else if (nodeType === "orderedList") {
                  insideList = true;
                  listType = "ordered";
                  break;
                } else if (nodeType === "taskList") {
                  insideList = true;
                  listType = "task";
                  break;
                }
              }

              // If it's a completely empty list item line, pressing backspace untoggles the list formatting 
              // turning the line back to a normal root paragraph at the exact same vertical cursor position!
              if (insideList && isParagraphEmpty) {
                if (listType === "bullet") {
                  editor?.commands.toggleBulletList();
                } else if (listType === "ordered") {
                  editor?.commands.toggleOrderedList();
                } else if (listType === "task") {
                  editor?.commands.toggleTaskList();
                }
                return true; // Return true to indicate we intercepted the event and prevent merging list nodes
              }
            }
          }
        }
        return false;
      },
      attributes: {
        class: "outline-none focus:outline-none border-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none min-h-full",
      },
    },
    content: "",
    onUpdate: ({ editor }) => {
      // Skip updates if programmatic setContent is active
      if (isProgrammaticUpdateRef.current) {
        return;
      }
      queueAutosave();
    },
  });

  // Save execution helper
  const executeSave = async (id: number, saveTitle: string, saveContent: string) => {
    const version = ++saveCountRef.current;
    setIsSaving(true);
    setSaveError(null);

    try {
      if (onSave) {
        await onSave(id, saveTitle, saveContent);
      }

      // Version protection: Only apply updates if this save completed after the last successful save
      if (version > lastSuccessfulVersionRef.current) {
        lastSuccessfulVersionRef.current = version;

        // Update last saved references
        lastSavedTitleRef.current = saveTitle;
        lastSavedContentRef.current = saveContent;

        // Recheck dirty status in case user typed more in the meantime
        const currentTitle = titleRef.current;
        const currentContent = editor ? editor.getHTML() : "";
        const stillDirty = currentTitle !== saveTitle || currentContent !== saveContent;

        isDirtyRef.current = stillDirty;
        setIsDirty(stillDirty);
        setLastSavedAt(new Date());
      }
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save");
      toastError(err, `Failed to autosave "${saveTitle}"`);
    } finally {
      // Only set isSaving to false if this was the latest save request
      if (version === saveCountRef.current) {
        setIsSaving(false);
      }
    }
  };

  // Debounced auto-save queue
  const queueAutosave = () => {
    if (!note) return;

    // Immediately mark draft as dirty
    isDirtyRef.current = true;
    setIsDirty(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (noteIdRef.current !== null) {
        const currentTitle = titleRef.current;
        const currentContent = editor ? editor.getHTML() : "";
        executeSave(noteIdRef.current, currentTitle, currentContent);
      }
    }, 1500); // Debounce delay 1.5s
  };

  // Immediate save flush
  const flushSave = (id: number, saveTitle: string, saveContent: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    executeSave(id, saveTitle, saveContent);
  };

  // Handle active note switching and props changes
  useEffect(() => {
    if (!editor) return;

    const isDifferentNote = !note || note.id !== noteIdRef.current;

    if (isDifferentNote) {
      // NOTE SWITCHING FLOW
      // 1. Flush/save previous note if dirty
      if (noteIdRef.current !== null && isDirtyRef.current) {
        const prevId = noteIdRef.current;
        const prevTitle = titleRef.current;
        const prevContent = editor.getHTML();
        flushSave(prevId, prevTitle, prevContent);
      }

      // 2. Load the new note
      if (note) {
        noteIdRef.current = note.id;
        prevNoteRef.current = note;
        setTitle(note.title);
        titleRef.current = note.title;

        // Set content programmatically (skipping dirty flag trigger)
        isProgrammaticUpdateRef.current = true;
        editor.commands.setContent(note.content ?? "");
        isProgrammaticUpdateRef.current = false;

        // Reset undo/redo history stack to prevent leaking actions from the previous note
        try {
          editor.unregisterPlugin("history");
          editor.registerPlugin(history());
        } catch (e) {
          console.error("Failed to reset editor history plugin", e);
        }

        // Set last saved values based on what was actually rendered
        lastSavedTitleRef.current = note.title;
        lastSavedContentRef.current = editor.getHTML();

        isDirtyRef.current = false;
        setIsDirty(false);
        setLastSavedAt(null);
        setSaveError(null);
        setIsSaving(false);
      } else {
        noteIdRef.current = null;
        prevNoteRef.current = null;
        setTitle("");
        titleRef.current = "";

        isProgrammaticUpdateRef.current = true;
        editor.commands.setContent("");
        isProgrammaticUpdateRef.current = false;

        // Reset undo/redo history stack on content clear
        try {
          editor.unregisterPlugin("history");
          editor.registerPlugin(history());
        } catch (e) {
          console.error("Failed to reset editor history plugin", e);
        }

        lastSavedTitleRef.current = "";
        lastSavedContentRef.current = "";

        isDirtyRef.current = false;
        setIsDirty(false);
        setLastSavedAt(null);
        setSaveError(null);
        setIsSaving(false);
      }
    } else {
      // SAME NOTE, but props updated (e.g. background refetch or mutation response)
      // Only reload and overwrite from note prop if the editor is NOT focused and NOT dirty!
      const isFocused = editor.isFocused || document.activeElement === titleInputRef.current;
      const isDirtyVal = isDirtyRef.current;

      if (!isFocused && !isDirtyVal && note) {
        setTitle(note.title);
        titleRef.current = note.title;

        isProgrammaticUpdateRef.current = true;
        editor.commands.setContent(note.content ?? "");
        isProgrammaticUpdateRef.current = false;

        lastSavedTitleRef.current = note.title;
        lastSavedContentRef.current = editor.getHTML();
      }

      if (note) {
        prevNoteRef.current = note;
      }
    }
  }, [note, editor]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Sync isDirty state to window
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).isNoteEditorDirty = isDirty;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).isNoteEditorDirty;
      }
    };
  }, [isDirty]);

  // Support tab close/refresh browser confirmation prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Expose flush function globally on window
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).flushNoteEditorSave = async (): Promise<boolean> => {
        if (noteIdRef.current === null) return true;
        if (!isDirtyRef.current) return true;

        const currentTitle = titleRef.current;
        const currentContent = editor ? editor.getHTML() : "";

        // Cancel pending debounce timer
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }

        // Execute save immediately
        try {
          await executeSave(noteIdRef.current, currentTitle, currentContent);
        } catch (err) {
          // Error is caught by executeSave internally, we check isDirtyRef below
        }

        // If it was saved successfully, isDirtyRef.current will be false
        if (!isDirtyRef.current) {
          return true;
        }

        // If save failed, prompt retry or discard option
        const discard = window.confirm(
          "We could not save your latest note changes to the cloud. Would you like to discard these changes and navigate anyway?"
        );

        if (discard) {
          isDirtyRef.current = false;
          setIsDirty(false);
          setSaveError(null);
          return true; // Allow navigation
        }

        return false; // Block navigation to retry
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).flushNoteEditorSave;
      }
    };
  }, [editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    titleRef.current = newTitle;
    queueAutosave();
  };

  const renderStatus = () => {
    if (isSaving) {
      return (
        <div className="flex items-center text-textSecondary animate-pulse" title="Saving changes...">
          <Loader2 className="size-4 animate-spin text-primary" />
        </div>
      );
    }
    if (saveError) {
      return (
        <div className="flex items-center text-danger animate-in fade-in duration-200" title={`Failed to save: ${saveError}`}>
          <AlertCircle className="size-4" />
        </div>
      );
    }
    if (isDirty) {
      return (
        <div className="flex items-center text-amber-500 animate-in fade-in duration-200" title="Unsaved changes">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
        </div>
      );
    }
    // Default / Saved state
    return (
      <div className="flex items-center text-green-500 animate-in fade-in duration-200" title="All changes saved">
        <Check className="size-4" />
      </div>
    );
  };

  if (!note) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-bgPanel/30 border border-dashed border-borderSubtle rounded-xl h-full min-h-0">
        <FileText className="size-12 text-textDisabled mb-3" />
        <h4 className="font-medium text-textSecondary">No active note</h4>
        <p className="text-sm text-textMuted max-w-xs mt-1">
          Select an existing note from the sidebar list or create a new one to start writing.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="relative flex flex-1 flex-col bg-bgPanel/50 border border-borderSubtle rounded-xl overflow-hidden h-full min-h-0"
      ref={editorContainerRef}
    >
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-borderSubtle bg-bgElevated/50 shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden flex items-center text-textSecondary hover:text-textPrimary transition-colors duration-150 cursor-pointer bg-transparent border-none p-1.5 outline-none -ml-2 rounded-lg hover:bg-bgHover"
              title="Back to notes"
              aria-label="Back to notes"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Undo */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor || !editor.can().undo()}
            className={cn(
              "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer",
              "text-textSecondary"
            )}
            title="Undo"
          >
            <Undo className="size-4" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor || !editor.can().redo()}
            className={cn(
              "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer",
              "text-textSecondary"
            )}
            title="Redo"
          >
            <Redo className="size-4" />
          </button>

          <div className="w-px h-4 bg-borderSubtle mx-1 self-center" />

          {renderStatus()}
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-borderSubtle bg-bgElevated/25 overflow-x-auto flex-nowrap scrollbar-none select-none shrink-0">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("bold") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Bold"
        >
          <Bold className="size-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("italic") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Italic"
        >
          <Italic className="size-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("underline") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Underline"
        >
          <UnderlineIcon className="size-4" />
        </button>

        <div className="w-px h-5 bg-borderSubtle mx-1 self-center" />

        {/* Heading 1 */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("heading", { level: 1 }) ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Heading 1"
        >
          <Heading1 className="size-4" />
        </button>

        {/* Heading 2 */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("heading", { level: 2 }) ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </button>

        <div className="w-px h-5 bg-borderSubtle mx-1 self-center" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("bulletList") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Bullet List"
        >
          <List className="size-4" />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("orderedList") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </button>

        {/* Checklist */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("taskList") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Checklist"
        >
          <CheckSquare className="size-4" />
        </button>

        <div className="w-px h-5 bg-borderSubtle mx-1 self-center" />

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("blockquote") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Quote"
        >
          <Quote className="size-4" />
        </button>

        {/* Inline Code */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCode().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("code") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Inline Code"
        >
          <Code className="size-4" />
        </button>

        {/* Code Block */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          disabled={!editor}
          className={cn(
            "p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary cursor-pointer focus:outline-none",
            editor?.isActive("codeBlock") ? "bg-bgActive text-accent-emerald border border-accent-emerald/20" : "text-textSecondary"
          )}
          title="Code Block"
        >
          <Terminal className="size-4" />
        </button>

        {/* Divider */}
        <button
          type="button"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          disabled={!editor}
          className="p-1.5 rounded-lg transition-premium hover:bg-bgHover hover:text-textPrimary text-textSecondary cursor-pointer focus:outline-none"
          title="Divider"
        >
          <Minus className="size-4" />
        </button>


      </div>

      {/* Title Area */}
      <div className="px-8 pt-6 pb-2 shrink-0">
        <input
          ref={titleInputRef}
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="w-full text-2xl font-semibold tracking-tight text-textPrimary bg-transparent border-none outline-none focus:ring-0 placeholder-textDisabled"
        />
      </div>

      {/* Editor Area */}
      <div 
        onClick={() => editor?.commands.focus()}
        className="flex-1 px-8 pb-8 overflow-y-auto prose prose-invert max-w-none text-textSecondary focus-within:outline-none cursor-text min-h-0"
      >
        <EditorContent editor={editor} className="outline-none min-h-full" />
      </div>
    </div>
  );
}
