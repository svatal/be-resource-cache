import { getCurrentCtx, invalidate, useEffect } from "bobril";
import { ICachedAsyncResource } from "be-resource-cache";

export function useAsyncResource<TKey, TData>(
  cache: ICachedAsyncResource<TKey, TData>,
  key: TKey
) {
  useEffect(() => {
    const ctx = getCurrentCtx();
    const { unsubscribe } = cache.subscribe(key, () => invalidate(ctx));
    return unsubscribe;
  }, [cache.getSerializedKey(key)]);
  return cache.get(key);
}
