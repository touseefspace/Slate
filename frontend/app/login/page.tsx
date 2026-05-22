"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ChevronLeft } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-bgBase p-6">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-64 w-full max-w-md rounded-xl" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bgBase text-textPrimary px-6 overflow-hidden">
      {/* Background radial glowing accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(16,185,129,0.04),transparent)] z-0" />

      {/* Back to marketing link */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors duration-150 rounded-lg p-2 hover:bg-bgHover"
        >
          <ChevronLeft className="size-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="size-4.5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-textPrimary to-textSecondary bg-clip-text">Slate</span>
        </Link>

        {/* Center aligned Auth Card */}
        <AuthCard />
      </div>
    </div>
  );
}
