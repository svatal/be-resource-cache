import {
  AsyncResourceState,
  CachedAsyncResourceResult,
  fetching,
  IAsyncResource,
  ICachedAsyncResource,
} from "./asyncResource";
import { asDeepReadonly, assertNever, DeepReadonly } from "./util";

interface ICachingStrategy {
  onLastUnsubscribe(endSubscription: () => void): void;
  onChangeWithoutSubscribers(endSubscription: () => void): void;
}

export const deleteASAP: ICachingStrategy = {
  onLastUnsubscribe: (endSubscription) => {
    endSubscription();
  },
  onChangeWithoutSubscribers: () => {},
};

export const keepUntilChanged: ICachingStrategy = {
  onLastUnsubscribe: () => {},
  onChangeWithoutSubscribers: (endSubscription) => {
    endSubscription();
  },
};

export const keepWatchingForever: ICachingStrategy = {
  onLastUnsubscribe: () => {},
  onChangeWithoutSubscribers: () => {},
};

export function cached<TKey, TData>(
  resource: IAsyncResource<TKey, TData>,
  getSerializedKey: (key: TKey) => string,
  cachingStrategy: ICachingStrategy
): ICachedAsyncResource<TKey, DeepReadonly<TData>> {
  let nextSubscriptionId = 1;
  const cache = new Map<
    string,
    {
      unsubscribe: () => void;
      result: CachedAsyncResourceResult<DeepReadonly<TData>> | undefined;
      cbs: Map<
        number,
        (cb: CachedAsyncResourceResult<DeepReadonly<TData>>) => void
      >;
    }
  >();
  return {
    subscribe(key, onData) {
      const serializedKey = getSerializedKey(key);
      let s = cache.get(serializedKey);
      if (!s) {
        const { unsubscribe } = resource.subscribe(key, (result) => {
          const subscribed = cache.get(serializedKey);
          if (!subscribed)
            throw "onChange callback called after the subscription ended!";
          switch (result.state) {
            case AsyncResourceState.fetched: {
              subscribed.result = {
                state: result.state,
                data: asDeepReadonly(result.data),
              };
              break;
            }
            case AsyncResourceState.fetching:
            case AsyncResourceState.error: {
              subscribed.result = result;
              break;
            }
            case AsyncResourceState.invalidated: {
              subscribed.result =
                subscribed.result?.data !== undefined
                  ? { state: result.state, data: subscribed.result.data }
                  : fetching;
              break;
            }
            default:
              assertNever(result);
          }
          subscribed.cbs.forEach((cb) => cb(subscribed.result!));
          if (subscribed.cbs.size === 0) {
            cachingStrategy.onChangeWithoutSubscribers(endSubscription);
          }
        });
        s = {
          unsubscribe,
          result: undefined,
          cbs: new Map(),
        };
        cache.set(serializedKey, s);
      }
      function endSubscription() {
        if (!s) throw new Error("Cannot unsubscribe during subscribe!");
        s.unsubscribe();
        cache.delete(serializedKey);
      }
      const subscriptionId = nextSubscriptionId++;
      s.cbs.set(subscriptionId, onData);
      return {
        unsubscribe: () => {
          let s = cache.get(serializedKey);
          if (!s) return;
          s.cbs.delete(subscriptionId);
          if (s.cbs.size > 0) return;
          cachingStrategy.onLastUnsubscribe(endSubscription);
        },
      };
    },
    getSerializedKey(key) {
      return getSerializedKey(key);
    },
    get(key) {
      const serializedKey = getSerializedKey(key);
      return cache.get(serializedKey)?.result;
    },
  };
}
