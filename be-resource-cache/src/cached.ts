import {
  IAsyncResource,
  ICachedAsyncResource,
  SubscriptionId,
} from "./asyncResource";
import { asDeepReadonly, DeepReadonly } from "./util";

export function cached<TKey, TData>(
  resource: IAsyncResource<TKey, TData>
): ICachedAsyncResource<TKey, DeepReadonly<TData>> {
  const cache = new Map<string, DeepReadonly<TData>>();
  const subscribes = new Map<
    string,
    {
      sId: SubscriptionId<TKey>;
      cbs: Map<number, (cb: DeepReadonly<TData>) => void>;
    }
  >();
  return {
    subscribe(key, onData) {
      const serializedKey = resource.getSerializedKey(key);
      let s = subscribes.get(serializedKey);
      if (!s) {
        const parentSubscriptionId = resource.subscribe(key, (data) => {
          const roData = asDeepReadonly(data);
          cache.set(serializedKey, roData);
          subscribes.get(serializedKey)?.cbs.forEach((cb) => cb(roData));
        });
        s = {
          sId: parentSubscriptionId,
          cbs: new Map(),
        };
        subscribes.set(serializedKey, s);
      }
      const subscriptionId = new SubscriptionId(key);
      s.cbs.set(subscriptionId.id, onData);
      return subscriptionId;
    },
    unsubscribe(subscriptionId) {
      const serializedKey = resource.getSerializedKey(subscriptionId.key);
      let s = subscribes.get(serializedKey);
      if (!s) return;
      s.cbs.delete(subscriptionId.id);
      if (s.cbs.size > 0) return;
      subscribes.delete(serializedKey);
      resource.unsubscribe(s.sId);
    },
    getSerializedKey(key) {
      return resource.getSerializedKey(key);
    },
    get(key) {
      const serializedKey = resource.getSerializedKey(key);
      return cache.get(serializedKey);
    },
  };
}
