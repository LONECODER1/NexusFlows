"use client";

import { EntityListSkeleton } from "@/components/entity-list-skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, type ReactNode } from "react";

type ListSectionProps = {
  children: ReactNode;
  errorFallback: ReactNode;
};

export function ListSection({ children, errorFallback }: ListSectionProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={<EntityListSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
