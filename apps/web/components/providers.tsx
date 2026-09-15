'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
