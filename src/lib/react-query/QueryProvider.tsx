"use client";

import { ReactNode, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Next.js re-renders and re-runs client components, so we use useState to make sure QueryClient is created only once and not recreated on every render.

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      queryCache: new QueryCache(),
      mutationCache: new MutationCache(),
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 2, // 2 minutes
          retry: 1,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 0,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={true}  />
    </QueryClientProvider>
  );
}
