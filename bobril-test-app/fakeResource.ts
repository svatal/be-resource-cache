import { ICachedAsyncResource, SubscriptionId } from "be-resource-cache";

const data = new Map<number, number | undefined>();
const cbsByKey = new Map<number, Map<number, (data: number) => void>>();

setInterval(() => {
  cbsByKey.forEach((cbs, key) => {
    const newVal = (data.get(key) ?? 0) + 1;
    data.set(key, newVal);
    cbs.forEach((cb) => cb(newVal));
  });
}, 1000);

export const fakeResource: ICachedAsyncResource<number, number> = {
  subscribe(key, onData) {
    if (!data.has(key)) data.set(key, undefined);
    const sId = new SubscriptionId(key);
    if (!cbsByKey.has(key)) cbsByKey.set(key, new Map());
    cbsByKey.get(key)!.set(sId.id, onData);
    return sId;
  },
  unsubscribe(subscriptionId) {
    const cbs = cbsByKey.get(subscriptionId.key)!;
    cbs.delete(subscriptionId.id);
    if (cbs.size === 0) {
      cbsByKey.delete(subscriptionId.key);
    }
  },
  get(key) {
    return data.get(key);
  },
  getSerializedKey(key) {
    return `${key}`;
  },
};
