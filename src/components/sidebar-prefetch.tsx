"use client";

import { PAGINATION } from "@/config/constants";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

const DEFAULT_SEARCH_PARAMS = {
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  search: "",
} as const;

const DEFAULT_EXECUTION_PARAMS = {
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
} as const;

export function useSidebarPrefetch() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const prefetchWorkflows = useCallback(() => {
    void queryClient.prefetchQuery(
      trpc.workflows.getMany.queryOptions(DEFAULT_SEARCH_PARAMS),
    );
  }, [queryClient, trpc]);

  const prefetchCredentials = useCallback(() => {
    void queryClient.prefetchQuery(
      trpc.credentials.getMany.queryOptions(DEFAULT_SEARCH_PARAMS),
    );
  }, [queryClient, trpc]);

  const prefetchExecutions = useCallback(() => {
    void queryClient.prefetchQuery(
      trpc.executions.getMany.queryOptions(DEFAULT_EXECUTION_PARAMS),
    );
  }, [queryClient, trpc]);

  const prefetchAll = useCallback(() => {
    prefetchWorkflows();
    prefetchCredentials();
    prefetchExecutions();
  }, [prefetchCredentials, prefetchExecutions, prefetchWorkflows]);

  const prefetchRoute = useCallback(
    (href: string) => {
      router.prefetch(href);

      if (href.startsWith("/workflows")) {
        prefetchWorkflows();
      } else if (href.startsWith("/credentials")) {
        prefetchCredentials();
      } else if (href.startsWith("/executions")) {
        prefetchExecutions();
      }
    },
    [prefetchCredentials, prefetchExecutions, prefetchWorkflows, router],
  );

  return {
    prefetchAll,
    prefetchRoute,
  };
}

export function SidebarPrefetch() {
  const { prefetchAll } = useSidebarPrefetch();

  useEffect(() => {
    prefetchAll();
  }, [prefetchAll]);

  return null;
}
