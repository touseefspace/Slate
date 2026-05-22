"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Zap, 
  Lock, 
  BookOpen, 
  ChevronDown,
  Layers,
  ArrowUpRight
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Interactive FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Slate?",
      answer: "Slate is a premium, distraction-free productivity space designed for seamless task management and note-taking. It combines the power of a standard rich text editor with interactive checklists to help you streamline your thoughts and get things done."
    },
    {
      question: "How does Slate's autosave feature work?",
      answer: "Slate uses an advanced, non-blocking background autosave engine. When you stop typing for 1.5 seconds, Slate automatically pushes your updates to the cloud. It features race-condition sequencing protection to ensure that slower network responses never overwrite your newest thoughts."
    },
    {
      question: "What makes the mobile experience unique?",
      answer: "Slate features a gesture-driven mobile interface modeled after native apps. You can long-press on any note in the note list to trigger haptic feedback and enter selection mode, allowing you to multi-select and delete notes in parallel with an elegant glassmorphism confirmation modal."
    },
    {
      question: "Is Slate free to use?",
      answer: "Yes, Slate is free forever for personal use. The default plan (Clean Slate) includes unlimited notes, unlimited tasks, cloud synchronization, rich text editing, and gesture multi-select."
    }
  ];

  return (
    <div className="min-h-screen bg-bgBase text-textPrimary overflow-x-hidden relative font-sans pt-16">



      {/* Dynamic Header Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-borderSubtle bg-bgPanel/60 backdrop-blur-md transition-all duration-200">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="size-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-linear-to-r from-textPrimary to-textSecondary bg-clip-text">Slate</span>
            </Link>

            {/* Nav Menu Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-textSecondary">
              <a href="#features" className="hover:text-textPrimary transition-colors duration-150">Features</a>
              <a href="#pricing" className="hover:text-textPrimary transition-colors duration-150">Pricing</a>
              <a href="#faqs" className="hover:text-textPrimary transition-colors duration-150">FAQs</a>
              <Link href="/help" className="hover:text-textPrimary transition-colors duration-150 flex items-center gap-1">
                <span>Help & Docs</span>
                <ArrowUpRight className="size-3 text-textMuted" />
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-24 bg-bgActive/40 animate-pulse rounded-lg border border-borderSubtle" />
            ) : user ? (
              <Button 
                onClick={() => router.push("/dashboard")} 
                className="h-9 text-xs font-semibold px-4 cursor-pointer gap-1.5 shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all active:scale-95 bg-primary hover:bg-primary/95 text-white"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-textSecondary hover:text-textPrimary px-3 py-2 transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Button 
                  onClick={() => router.push("/login")} 
                  className="h-9 text-xs font-semibold px-4 cursor-pointer gap-1.5 bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/10 active:scale-95 transition-all"
                >
                  <span>Start Free</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full pt-20 pb-16 text-center overflow-hidden bg-transparent">
        
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-textPrimary max-w-3xl mx-auto leading-[1.1] sm:leading-[1.1] mb-6">
            Your thoughts, <br className="hidden sm:inline" />
            perfected on a clean <span className="bg-linear-to-r from-primary to-accent-emerald bg-clip-text text-transparent drop-shadow-sm">Slate</span>.
          </h1>
          
          <p className="text-base sm:text-lg text-textMuted max-w-2xl mx-auto mb-10 leading-relaxed">
            A premium, minimal workspace crafted for personal thoughts, beautiful notes, and distraction-free task tracking. Backed by state-of-the-art background autosave.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Button 
              onClick={() => router.push(user ? "/dashboard" : "/login")} 
              className="w-full sm:w-auto h-12 text-sm font-semibold px-6 cursor-pointer bg-primary hover:bg-primary/95 text-white gap-2 shadow-xl shadow-primary/15 transition-all active:scale-[0.98]"
            >
              <span>{user ? "Go to Dashboard" : "Start Writing Free"}</span>
              <ArrowRight className="size-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/help")}
              className="w-full sm:w-auto h-12 text-sm font-semibold px-6 cursor-pointer border-borderSubtle hover:bg-bgPanel/50 text-textSecondary hover:text-textPrimary gap-2 bg-transparent"
            >
              <BookOpen className="size-4 text-textMuted" />
              <span>Browse Help Docs</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 pt-5 pb-10 overflow-hidden bg-transparent">

        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary">Clarity from the very first keystroke.</h2>
            <p className="text-sm text-textMuted">Feel the absolute ease of a quiet, responsive space that moves at the speed of your thoughts—free of pressure and distracting bloat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-borderSubtle bg-bgPanel/40 backdrop-blur-sm rounded-2xl p-6 hover:-translate-y-1 hover:border-primary/30 transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <FileText className="size-5" />
                </div>
                <h3 className="font-bold text-textPrimary text-base">Premium WYSIWYG Editor</h3>
              </div>
              <p className="text-xs text-textMuted leading-relaxed">
                Enjoy standard formatting commands with our elegant horizontal toolbar. Supports nested lists, interactive checklists, code blocks, quote segments, and bullet structures.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-borderSubtle bg-bgPanel/40 backdrop-blur-sm rounded-2xl p-6 hover:-translate-y-1 hover:border-primary/30 transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald flex items-center justify-center shrink-0">
                  <Zap className="size-5" />
                </div>
                <h3 className="font-bold text-textPrimary text-base">Debounced Cloud Autosave</h3>
              </div>
              <p className="text-xs text-textMuted leading-relaxed">
                Type without thinking about saving. Updates are silently pushed to the cloud in the background. If you leave the tab, client-side guards flush changes instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-borderSubtle bg-bgPanel/40 backdrop-blur-sm rounded-2xl p-6 hover:-translate-y-1 hover:border-primary/30 transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Layers className="size-5" />
                </div>
                <h3 className="font-bold text-textPrimary text-base">Haptic Mobile Multi-Select</h3>
              </div>
              <p className="text-xs text-textMuted leading-relaxed">
                Manage lists seamlessly. Long-press a note on mobile to toggle haptic vibration, select multiple notes via tick marks, and perform parallel batch deletes with custom alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-22 overflow-hidden bg-transparent">

        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary">Fair pricing for standard quality.</h2>
            <p className="text-sm text-textMuted">Slate is free forever for personal use, with premium features in development.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="border border-borderSubtle bg-bgPanel/30 rounded-2xl p-8 relative flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Default Tier</span>
                  <h3 className="text-xl font-bold text-textPrimary">Clean Slate</h3>
                </div>
                <div className="flex items-baseline gap-1 text-textPrimary">
                  <span className="text-3xl font-extrabold">$0</span>
                  <span className="text-xs text-textMuted">/ free forever</span>
                </div>
                <p className="text-xs text-textMuted">Perfect for personal note taking, fast brain dumps, and keeping structured checklists daily.</p>
                <div className="w-full h-px bg-borderSubtle" />
                <ul className="space-y-2.5 text-xs text-textSecondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>Unlimited notes & tasks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>Standard WYSIWYG Editor formatting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>Background autosave (1.5s debounce)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>Samsung-style multi-select gesture</span>
                  </li>
                </ul>
              </div>
              <Button 
                onClick={() => router.push(user ? "/dashboard" : "/login")} 
                className="w-full h-10 text-xs font-semibold border border-borderSubtle hover:bg-bgPanel/60 text-textSecondary hover:text-textPrimary bg-transparent"
              >
                <span>{user ? "Enter App" : "Get Started Free"}</span>
              </Button>
            </div>

            {/* Pro Tier Mock */}
            <div className="border border-primary/30 bg-bgPanel/60 rounded-2xl p-8 relative flex flex-col justify-between gap-8 shadow-xl shadow-primary/5">
              <div className="absolute top-4 right-4 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                Coming Soon
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider font-sans">Power User</span>
                  <h3 className="text-xl font-bold text-textPrimary">Infinite Slate</h3>
                </div>
                <div className="flex items-baseline gap-1 text-textPrimary">
                  <span className="text-3xl font-extrabold">$4</span>
                  <span className="text-xs text-textMuted">/ user / mo</span>
                </div>
                <p className="text-xs text-textMuted">For collaborators, researchers, and professional builders who need structured exports and syncing.</p>
                <div className="w-full h-px bg-borderSubtle" />
                <ul className="space-y-2.5 text-xs text-textSecondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>Everything in Clean Slate</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>Interactive rich page sharing links</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>Premium Markdown & PDF exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>Real-time custom themes & assets</span>
                  </li>
                </ul>
              </div>
              <Button disabled className="w-full h-10 text-xs font-semibold opacity-60 cursor-not-allowed">
                <span>In Development</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Accordion Grid */}
      <section id="faqs" className="relative z-10 py-24 overflow-hidden bg-transparent">

        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary">Frequently Asked Questions</h2>
            <p className="text-sm text-textMuted">Everything you need to know about Slate's architecture, autosave, and features.</p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-borderSubtle bg-bgPanel/30 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm text-textPrimary hover:text-primary transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={cn("size-4 text-textMuted transition-transform duration-200", openFaq === idx ? "rotate-180 text-primary" : "")} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-textSecondary leading-relaxed border-t border-borderSubtle/40 bg-bgPanel/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-xs text-textMuted">
              Have complex developer questions?{" "}
              <Link href="/help" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">
                <span>Browse our full documentation</span>
                <ArrowRight className="size-3" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="relative z-10 border-t border-borderSubtle/30 bg-transparent py-12 text-center text-xs text-textMuted">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3 stroke-[2.5]" />
            </div>
            <span className="font-bold text-textPrimary">Slate</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <a href="#features" className="hover:text-textSecondary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-textSecondary transition-colors">Pricing</a>
            <Link href="/help" className="hover:text-textSecondary transition-colors">Help Docs</Link>
            <Link href="/login" className="hover:text-textSecondary transition-colors">Sign In</Link>
          </div>

          <p>© {new Date().getFullYear()} Slate. Premium Distraction-Free Mind Palace.</p>
        </div>
      </footer>
    </div>
  );
}
