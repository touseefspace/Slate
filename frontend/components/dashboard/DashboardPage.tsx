"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  CheckSquare, 
  FileText, 
  LogOut, 
  Search, 
  User, 
  Sparkles,
  Command as CommandIcon,
  Plus,
  Settings,
  X,
  BookOpen
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { SearchModal } from "@/components/ui/SearchModal";
import { MotionBox, AnimatePresence } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname?.includes("/notes") ? "notes" : "todos";
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile specific sheet controls
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Responsive state detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabChange = async (tab: "todos" | "notes") => {
    if (activeTab === tab) {
      if (tab === "notes") {
        window.dispatchEvent(new CustomEvent("app:nav-notes", { detail: {} }));
      }
      return;
    }

    if (activeTab === "notes") {
      if (typeof window !== "undefined") {
        const isDirty = (window as any).isNoteEditorDirty;
        const flushSaveFn = (window as any).flushNoteEditorSave;
        if (isDirty && typeof flushSaveFn === "function") {
          const canNavigate = await flushSaveFn();
          if (!canNavigate) return; // Block transition
        }
      }
    }

    router.push(`/dashboard/${tab}`);
  };

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      const isDirty = (window as any).isNoteEditorDirty;
      const flushSaveFn = (window as any).flushNoteEditorSave;
      if (isDirty && typeof flushSaveFn === "function") {
        const canNavigate = await flushSaveFn();
        if (!canNavigate) return; // Block transition
      }
    }
    logOut();
  };

  // Event listeners for global command actions
  useEffect(() => {
    const handleNavInbox = () => handleTabChange("todos");
    const handleNavNotes = () => handleTabChange("notes");
    const handleSignOutEvent = () => handleSignOut();

    window.addEventListener("app:nav-inbox", handleNavInbox);
    window.addEventListener("app:nav-today", handleNavInbox);
    window.addEventListener("app:nav-notes", handleNavNotes);
    window.addEventListener("app:sign-out", handleSignOutEvent);

    return () => {
      window.removeEventListener("app:nav-inbox", handleNavInbox);
      window.removeEventListener("app:nav-today", handleNavInbox);
      window.removeEventListener("app:nav-notes", handleNavNotes);
      window.removeEventListener("app:sign-out", handleSignOutEvent);
    };
  }, [activeTab, logOut]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen bg-bgBase items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-6 text-center">
          <Skeleton className="h-8 w-24 mx-auto rounded-md" />
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bgBase text-textPrimary font-sans select-none">
      {/* Background radial accent glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(16,185,129,0.03),transparent)]" />

      {/* Mounting Global Interfaces */}
      <SearchModal />

      {/* Collapsible Left Sidebar (Desktop Only) */}
      {!isMobile && (
        <aside
          className="relative z-20 flex h-full flex-col border-r border-borderSubtle bg-bgPanel transition-all duration-200 ease-out w-[260px] translate-x-0"
        >
          {/* Slate Brand */}
          <div className="flex h-14 items-center px-5 border-b border-borderSubtle">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="size-3.5 stroke-[2.5]" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Slate</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 space-y-1.5 px-3 py-4">
            <button
              onClick={() => handleTabChange("todos")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                activeTab === "todos"
                  ? "bg-bgActive text-primary border border-borderSubtle/30 shadow-sm"
                  : "text-textSecondary hover:bg-bgHover hover:text-textPrimary"
              )}
            >
              <CheckSquare className="size-4 shrink-0" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => handleTabChange("notes")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                activeTab === "notes"
                  ? "bg-bgActive text-primary border border-borderSubtle/30 shadow-sm"
                  : "text-textSecondary hover:bg-bgHover hover:text-textPrimary"
              )}
            >
              <FileText className="size-4 shrink-0" />
              <span>Notes</span>
            </button>

            <Link
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-textSecondary hover:bg-bgHover hover:text-textPrimary"
            >
              <BookOpen className="size-4 shrink-0" />
              <span>Help & Docs</span>
            </Link>
          </div>

          {/* Profile Footer */}
          <div className="border-t border-borderSubtle p-4 bg-bgElevated/50 flex flex-col gap-2">
            {user?.email && (
              <div className="flex items-center gap-2 px-1">
                <div className="flex size-7 items-center justify-center rounded-full bg-bgActive border border-borderSubtle">
                  <User className="size-3.5 text-textSecondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-textPrimary truncate">{user.email.split("@")[0]}</p>
                  <p className="text-[10px] text-textMuted truncate">{user.email}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full h-8 text-xs font-semibold justify-start text-textSecondary hover:text-danger hover:bg-bgHover gap-2 border border-transparent mt-1"
            >
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content Slate Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        
        {/* Top Header/Navbar (Desktop: standard command bar; Mobile: beautiful minimal header) */}
        <header className={cn(
          "flex items-center justify-between shrink-0 border-b border-borderSubtle backdrop-blur-md px-6 bg-bgBase/30",
          isMobile ? "h-14 bg-bgPanel" : "h-14"
        )}>
          {isMobile ? (
            // Mobile Brand
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="size-3.5 stroke-[2.5]" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Slate</span>
            </div>
          ) : (
            // Desktop Header Elements
            <div className="flex items-center gap-3" />
          )}

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => window.dispatchEvent(new CustomEvent("app:global-search"))}
                className="size-8 text-textMuted hover:text-textPrimary hover:bg-bgPanel border border-borderSubtle"
                aria-label="Search"
              >
                <Search className="size-4" />
              </Button>
            )}
            
            {isMobile && user?.email && (
              // Mobile profile sheet trigger
              <button 
                onClick={() => setProfileOpen(true)}
                className="flex size-7 items-center justify-center rounded-full bg-bgActive border border-borderSubtle active:scale-95 transition-all"
              >
                <User className="size-3.5 text-textSecondary" />
              </button>
            )}
          </div>
        </header>

        {/* Content Canvas */}
        <main className={cn(
          "flex-1 bg-transparent min-h-0",
          activeTab === "notes"
            ? cn(
                "overflow-hidden flex flex-col",
                isMobile 
                  ? "px-4 pt-4 pb-[calc(4rem+env(safe-area-inset-bottom,0))]" 
                  : "px-8 py-8"
              )
            : (isMobile ? "px-4 py-6 pb-24 overflow-y-auto" : "px-8 py-8 overflow-y-auto")
        )}>
          <div className={cn(
            "mx-auto w-full max-w-5xl transition-all duration-200",
            activeTab === "notes" ? "flex-1 flex flex-col min-h-0 h-full w-full" : ""
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* MOBILE SPECIFIC UI SCHEME                                */}
      {/* ======================================================== */}
      {isMobile && (
        <>
          {/* Absolute Bottom Navigation Bar */}
          <nav 
            style={{ 
              height: "calc(4rem + env(safe-area-inset-bottom, 0px))", 
              paddingBottom: "env(safe-area-inset-bottom, 0px)" 
            }}
            className="fixed bottom-0 left-0 right-0 bg-bgPanel/95 border-t border-borderSubtle backdrop-blur-md z-40 flex items-center justify-around px-4"
          >
            {/* Tab: Tasks */}
            <button
              onClick={() => handleTabChange("todos")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 h-full px-8 outline-none transition-colors",
                activeTab === "todos" ? "text-primary" : "text-textMuted"
              )}
            >
              <CheckSquare className="size-5" />
              <span className="text-[10px] font-medium">Tasks</span>
            </button>

            {/* Tab: Notes */}
            <button
              onClick={() => handleTabChange("notes")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 h-full px-8 outline-none transition-colors",
                activeTab === "notes" ? "text-primary" : "text-textMuted"
              )}
            >
              <FileText className="size-5" />
              <span className="text-[10px] font-medium">Notes</span>
            </button>
          </nav>

          {/* Dynamic Mobile Profile / Settings Sheet */}
          <AnimatePresence>
            {profileOpen && (
              <>
                {/* Backdrop overlay */}
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setProfileOpen(false)}
                  className="fixed inset-0 bg-black z-50 pointer-events-auto"
                />
                {/* Drawer Menu */}
                <MotionBox
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-bgElevated border-t border-borderStrong rounded-t-2xl px-6 pt-5 shadow-2xl flex flex-col gap-4"
                  style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-borderSubtle">
                    <div className="flex items-center gap-2">
                      <Settings className="size-4 text-textMuted" />
                      <span className="text-sm font-semibold text-textPrimary">Settings & Options</span>
                    </div>
                    <button 
                      onClick={() => setProfileOpen(false)}
                      className="p-1 rounded bg-bgPanel text-textMuted"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="bg-bgPanel/50 border border-borderSubtle rounded-xl p-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-bgActive border border-borderSubtle text-primary text-sm font-bold">
                      {user?.email ? user.email.substring(0,2).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-textPrimary truncate">{user?.email ? user.email.split("@")[0] : "User"}</p>
                      <p className="text-xs text-textMuted truncate">{user?.email ?? ""}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link
                      href="/help"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-3 rounded-lg bg-bgPanel hover:bg-bgHover px-4 py-3 text-sm text-textSecondary border border-borderSubtle"
                    >
                      <BookOpen className="size-4 text-textMuted" />
                      <span>Help & Docs</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg bg-danger/10 text-danger hover:bg-danger/15 px-4 py-3 text-sm"
                    >
                      <LogOut className="size-4" />
                      <span>Sign out of account</span>
                    </button>
                  </div>
                </MotionBox>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
