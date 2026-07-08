import { useCallback, useState } from "react";

interface OptimisticActionOptions<TResult> {
  apply(): void;
  request(): Promise<TResult>;
  rollback(): void;
  onSuccess?(result: TResult): void;
  onError?(error: unknown): void;
}

export function useOptimisticAction() {
  const [pending, setPending] = useState(false);

  const run = useCallback(async <TResult,>({
    apply,
    request,
    rollback,
    onSuccess,
    onError,
  }: OptimisticActionOptions<TResult>) => {
    setPending(true);
    apply();

    try {
      const result = await request();
      onSuccess?.(result);
      return result;
    } catch (error) {
      rollback();
      onError?.(error);
      return null;
    } finally {
      setPending(false);
    }
  }, []);

  return { pending, run };
}
