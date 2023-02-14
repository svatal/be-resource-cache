import { getCurrentCtx, invalidate, useEffect } from "bobril";
import { ICachedAsyncResource } from "be-resource-cache";

export function useAsyncResource<TKey, TData>(
  cache: ICachedAsyncResource<TKey, TData>,
  key: TKey
) {
  useEffect(() => {
    const ctx = getCurrentCtx();
    const subId = cache.subscribe(key, () => invalidate(ctx));
    return () => cache.unsubscribe(subId);
  }, [cache.getSerializedKey(key)]);
  return cache.get(key);
}
