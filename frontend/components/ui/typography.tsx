import React from "react";
import { cn } from "@/lib/utils";

type TypographyProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function H1({ children, className, id }: TypographyProps) {
  return (
    <h1
      id={id}
      className={cn(
        "text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary",
        className
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className, id }: TypographyProps) {
  return (
    <h2
      id={id}
      className={cn(
        "text-xl sm:text-2xl font-medium tracking-tight text-text-primary",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Title({ children, className, id }: TypographyProps) {
  return (
    <h3
      id={id}
      className={cn(
        "text-base sm:text-lg font-medium tracking-tight text-text-primary",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function Body({ children, className, id }: TypographyProps) {
  return (
    <p
      id={id}
      className={cn(
        "text-sm sm:text-base leading-relaxed text-text-secondary",
        className
      )}
    >
      {children}
    </p>
  );
}

export function Meta({ children, className, id }: TypographyProps) {
  return (
    <span
      id={id}
      className={cn(
        "text-xs font-normal tracking-wide text-text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
