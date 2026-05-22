"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, logOut } = useAuth();

  return (
    <header className="border-b border-border/60 bg-card/40 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight">
            Todo & Notes
          </h1>
          {user?.email && (
            <p className="text-xs text-muted-foreground">{user.email}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => logOut()}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
