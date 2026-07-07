import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

/**
 * Fetches a short-lived signed URL for a private R2 object key.
 *
 * - Pass null/undefined to skip the fetch (returns url: null).
 * - Signed URLs last 15 min on the backend; we refetch after 10 min.
 */
export function useSignedUrl(key: string | null | undefined): {
  url: string | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery<string | null>({
    queryKey: ["signed-url", key],
    queryFn: async () => {
      const res = await api.get<{ url: string }>("/files/signed-url", {
        params: { key },
      });
      return res.data.url;
    },
    enabled: !!key,
    staleTime: 10 * 60 * 1000,   // 10 minutes
    gcTime:    15 * 60 * 1000,   // keep in cache for 15 minutes
    retry: 1,
  });

  return { url: data ?? null, isLoading: !!key && isLoading };
}
