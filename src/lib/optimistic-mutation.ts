import { ApiError } from "@/lib/api";

export async function runOptimisticMutation<T>(opts: {
  applyOptimistic: () => void;
  rollback: () => void;
  mutate: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  showSuccess?: (msg: string) => void;
  showError?: (msg: string) => void;
}): Promise<T | undefined> {
  opts.applyOptimistic();
  try {
    const result = await opts.mutate();
    opts.onSuccess?.(result);
    if (opts.successMessage && opts.showSuccess) {
      opts.showSuccess(opts.successMessage);
    }
    return result;
  } catch (e) {
    opts.rollback();
    const err = e instanceof Error ? e : new Error("Erreur inconnue");
    opts.onError?.(err);
    const message = err instanceof ApiError ? err.message : err.message;
    opts.showError?.(message);
    return undefined;
  }
}
