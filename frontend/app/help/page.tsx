"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  ChevronRight, 
  HelpCircle, 
  ChevronDown, 
  FileText, 
  CheckSquare, 
  Zap, 
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Info,
  Lightbulb,
  ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Article documentation content structure
const DOCUMENT_ARTICLES = [
  {
    id: "getting-started",
    category: "Getting Started",
    icon: Sparkles,
    title: "Welcome to Slate",
    subtitle: "A quick-start guide to clear your mind and streamline your productivity.",
    content: (
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-textSecondary">
          Slate is a premium, distraction-free digital mind palace designed to manage your daily tasks and refine your written notes. By merging structured checklists with a responsive WYSIWYG note editor, Slate provides the ultimate workspace to capture, expand, and finalize your thoughts.
        </p>
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex gap-3">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-textPrimary">Slate Core Concept</h5>
            <p className="text-xs text-textMuted leading-relaxed">
              We believe tools should be fast and invisible. Slate operates completely on-screen with zero complex slash shortcuts, relying on a beautiful persistent formatting bar and silent background cloud synchronization.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-textPrimary">Quick Setup in 3 Steps:</h4>
          <ol className="list-decimal pl-5 text-xs text-textSecondary space-y-2.5">
            <li>
              <strong className="text-textPrimary">Create your Account:</strong> Sign up in 5 seconds under our dedicated <Link href="/login" className="text-primary hover:underline">Authentication Portal</Link>.
            </li>
            <li>
              <strong className="text-textPrimary">Log your Tasks:</strong> Head to the Tasks tab, click <strong className="text-textPrimary">Create first task</strong>, and jot down what needs your attention today.
            </li>
            <li>
              <strong className="text-textPrimary">Draft your Notes:</strong> Switch to the Notes tab, click the plus icon to spawn a clean note, and let your ideas flow on our digital Slate.
            </li>
          </ol>
        </div>
      </div>
    )
  },
  {
    id: "tasks-todos",
    category: "Tasks & Todos",
    icon: CheckSquare,
    title: "Calm Task Management",
    subtitle: "Create, schedule, and complete todos in a clean grid workspace.",
    content: (
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-textSecondary">
          Slate's task management is built around simplicity. Instead of overwhelming you with complex nested columns and subtask workflows, tasks are rendered as clean, high-contrast rows that help you focus on execution.
        </p>
        <div className="space-y-4">
          <div className="border border-borderSubtle bg-bgPanel/30 rounded-xl p-4 space-y-3">
            <h5 className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
              <CheckSquare className="size-4 text-primary" />
              <span>Inbox & Quick Add Features</span>
            </h5>
            <ul className="list-disc pl-5 text-xs text-textSecondary space-y-2">
              <li>Type directly in the quick add input box at the top of your Task List to instantly queue ideas.</li>
              <li>Toggle checked states instantly with real-time fade animations.</li>
              <li>Filter completed tasks out of sight automatically to enjoy your clean Slate.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "note-editing",
    category: "Rich Note Editor",
    icon: FileText,
    title: "Advanced WYSIWYG Formatting",
    subtitle: "A deeper look at the robust, standard-driven Tiptap note writing canvas.",
    content: (
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-textSecondary">
          The Slate note editor is built on the industry-standard ProseMirror and Tiptap framework. It replaces erratic keyboard menu modals with a reliable horizontal toolbar positioned securely at the top of the editor.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-borderSubtle bg-bgPanel/20 space-y-2">
              <h5 className="text-xs font-bold text-textPrimary flex items-center gap-1">
                <span className="size-2 rounded-full bg-accent-emerald" />
                <span>Active Style Indicators</span>
              </h5>
              <p className="text-xs text-textMuted leading-relaxed">
                As your text cursor moves through your note, the toolbar buttons automatically light up in an emerald highlight matching the active element style (bold, bullet, etc.).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-borderSubtle bg-bgPanel/20 space-y-2">
              <h5 className="text-xs font-bold text-textPrimary flex items-center gap-1">
                <span className="size-2 rounded-full bg-primary" />
                <span>Smart Backspace exit</span>
              </h5>
              <p className="text-xs text-textMuted leading-relaxed">
                Pressing Backspace on an empty list item line will cleanly toggle off list formatting, converting the line to a root paragraph immediately instead of deleting paragraphs.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-3">
            <Lightbulb className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-textPrimary">Haptic Mobile Multi-Select</h5>
              <p className="text-xs text-textMuted leading-relaxed">
                Need to delete multiple notes? On mobile viewports, hold your thumb on any note card for 600ms. Your phone will trigger a haptic pulse, card layouts will slide right, and check ticks will display so you can tap-to-select and batch delete.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "sync-autosave",
    category: "Autosave & Sync",
    icon: Zap,
    title: "Cloud Sync & Safeguards",
    subtitle: "How Slate guarantees your thoughts are saved securely with zero input loss.",
    content: (
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-textSecondary">
          Slate runs a high-performance background worker that monitors edits to your note title and writing canvas. You never need to search for a save button.
        </p>
        <div className="border border-borderSubtle bg-bgPanel/30 rounded-xl p-5 space-y-4">
          <h5 className="text-xs font-bold text-textPrimary">Core Sync Architectures:</h5>
          <div className="space-y-3.5 text-xs text-textSecondary">
            <div className="flex gap-2.5">
              <span className="font-bold text-primary shrink-0">1.</span>
              <p><strong className="text-textPrimary">Debounced Save:</strong> Once you stop typing for exactly 1.5 seconds, an asynchronous request is queued and executed to update the server.</p>
            </div>
            <div className="flex gap-2.5">
              <span className="font-bold text-primary shrink-0">2.</span>
              <p><strong className="text-textPrimary">Sequence Matching:</strong> Slate tracks version sequence counters (`saveCountRef`). If a slower, earlier request resolves after a newer save, Slate automatically discards the obsolete response to protect newer inputs.</p>
            </div>
            <div className="flex gap-2.5">
              <span className="font-bold text-primary shrink-0">3.</span>
              <p><strong className="text-textPrimary">Synchronous Exit Flush:</strong> Switching notes, signing out, or leaving the workspace triggers an immediate, synchronous save flush. Unsaved debounced timers are cancelled and saved instantly before transition.</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-destructive/20 bg-danger/5 flex gap-3">
          <ShieldAlert className="size-5 text-danger shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-textPrimary">Tab Close Protection</h5>
            <p className="text-xs text-textMuted leading-relaxed">
              If your internet goes offline while edits are pending, standard web navigations are blocked, and a prompt is shown warning you of unsaved changes, ensuring no data is ever lost.
            </p>
          </div>
        </div>
      </div>
    )
  }
];

export default function HelpPage() {
  const [activeArticleId, setActiveArticleId] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Standard FAQs
  const faqList = [
    {
      q: "Where is my data stored?",
      a: "All your notes and tasks are synced securely to Slate's PostgreSQL cloud database database. Authentication is securely managed by Firebase Auth protocols."
    },
    {
      q: "How do I trigger mobile selection mode?",
      a: "Just hold your finger down on any note card in your list for about 600ms. You will feel a minor vibration, indicating selection mode is active. You can then tap to add other notes to your selection."
    },
    {
      q: "Why do my Undo/Redo buttons light up or fade?",
      a: "Slate monitors Tiptap's active state history stack. If you haven't made any edits, the Undo button is faded. The buttons are reactive, shifting automatically as you compose."
    },
    {
      q: "Can I use Markdown formatting shortcuts?",
      a: "Yes! Tiptap has native markdown input rules. For instance, typing '# ' at the beginning of a line instantly formats it as a Heading 1 block, and typing '- ' or '* ' begins a bullet list."
    }
  ];

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery) return DOCUMENT_ARTICLES;
    const lowerQuery = searchQuery.toLowerCase();
    return DOCUMENT_ARTICLES.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.category.toLowerCase().includes(lowerQuery) ||
        article.subtitle.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  // Handle article sidebar selection
  const activeArticle = useMemo(() => {
    return DOCUMENT_ARTICLES.find(a => a.id === activeArticleId) || DOCUMENT_ARTICLES[0];
  }, [activeArticleId]);

  return (
    <div className="min-h-screen bg-bgBase text-textPrimary flex flex-col relative font-sans">
      {/* Background radial glowing accents */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.04)_0%,transparent_60%)] z-0" />

      {/* Sticky Help Header */}
      <header className="z-30 border-b border-borderSubtle bg-bgPanel/60 backdrop-blur-md sticky top-0 shrink-0">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="size-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-textPrimary">Slate</span>
            </Link>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-bgActive border border-borderSubtle text-textSecondary hidden sm:inline-block">Docs & Support</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors px-3 py-2">
              <span className="hidden sm:inline">Back to </span>Home
            </Link>
            <Button 
              onClick={() => window.location.href = "/dashboard"} 
              className="h-8 text-[11px] font-semibold px-3 cursor-pointer bg-primary hover:bg-primary/95 text-white"
            >
              <span>Enter App</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Help Workspace Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10 min-h-0">
        
        {/* Left column: Categories & Articles List */}
        <aside className="md:col-span-1 space-y-6 flex flex-col">
          {/* Search Box */}
          <div className="relative w-full rounded-xl border border-borderSubtle bg-bgPanel/40 p-1.5 focus-within:border-primary/50 transition-colors">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted">
              <Search className="size-4" />
            </div>
            <input 
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-transparent border-none text-xs outline-none text-textPrimary placeholder-textMuted"
            />
          </div>

          {/* Categories Navigation Stack */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold text-textMuted uppercase tracking-wider px-3 mb-2">Help Guides</h4>
            {filteredArticles.length === 0 ? (
              <p className="text-xs text-textMuted px-3 py-2">No matching articles found.</p>
            ) : (
              filteredArticles.map((article) => {
                const Icon = article.icon;
                const isActive = article.id === activeArticleId;
                return (
                  <button
                    key={article.id}
                    onClick={() => setActiveArticleId(article.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-150 text-left outline-none cursor-pointer",
                      isActive 
                        ? "bg-bgActive text-primary border border-borderSubtle/30 shadow-sm"
                        : "text-textSecondary hover:bg-bgHover hover:text-textPrimary"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-textMuted")} />
                      <span className="truncate">{article.category}</span>
                    </div>
                    <ChevronRight className={cn("size-3.5 text-textMuted opacity-0 shrink-0", isActive ? "opacity-100 text-primary" : "")} />
                  </button>
                );
              })
            )}
          </div>

          <div className="w-full h-px bg-borderSubtle/60" />

          {/* Quick Help Box */}
          <div className="p-4 rounded-xl border border-borderSubtle bg-bgPanel/30 space-y-2">
            <h5 className="text-[11px] font-bold text-textPrimary flex items-center gap-1.5">
              <HelpCircle className="size-4 text-primary" />
              <span>Need Direct Help?</span>
            </h5>
            <p className="text-[10px] text-textMuted leading-relaxed">
              If you discover any bugs or need database migrations, raise an issue directly on the repository dashboard!
            </p>
          </div>
        </aside>

        {/* Right column: Document viewer */}
        <section className="md:col-span-3 space-y-8 min-h-0 overflow-y-auto pr-1">
          {/* Active Article Surface */}
          <article className="border border-borderSubtle bg-bgPanel/30 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-borderSubtle/60 pb-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                {/* Dynamic Icon */}
                {(() => {
                  const IconComp = activeArticle.icon;
                  return <IconComp className="size-4" />;
                })()}
                <span>{activeArticle.category}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-textPrimary">{activeArticle.title}</h2>
              <p className="text-xs text-textMuted leading-relaxed">{activeArticle.subtitle}</p>
            </div>

            {/* Markdown rendered body */}
            <div className="prose prose-invert max-w-none">
              {activeArticle.content}
            </div>
          </article>

          {/* Interactive FAQs Accordion */}
          <div id="faq-section" className="space-y-6 border-t border-borderSubtle/50 pt-8">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-textPrimary">Frequently Asked Questions</h3>
              <p className="text-xs text-textMuted">Quick answers to common structural questions about Slate.</p>
            </div>

            <div className="space-y-3">
              {faqList.map((faq, idx) => (
                <div 
                  key={idx}
                  className="border border-borderSubtle bg-bgPanel/20 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left font-semibold text-xs text-textPrimary hover:text-primary transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={cn("size-3.5 text-textMuted transition-transform", openFaq === idx ? "rotate-180 text-primary" : "")} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 pt-1 text-[11px] text-textSecondary leading-relaxed border-t border-borderSubtle/30 bg-bgPanel/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Simple Footer */}
      <footer className="relative z-30 border-t border-borderSubtle bg-bgPanel py-6 text-center text-[10px] text-textMuted mt-auto shrink-0">
        <p>© {new Date().getFullYear()} Slate. All documentation rights reserved.</p>
      </footer>
    </div>
  );
}
