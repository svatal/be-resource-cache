export class SubscriptionId<TKey> {
  private static nextId = 1;
  id: number = SubscriptionId.nextId++;
  constructor(public key: TKey) {}
}

export interface IAsyncResource<TKey, TData> {
  subscribe(key: TKey, onData: (data: TData) => void): SubscriptionId<TKey>;
  unsubscribe(subscriptionId: SubscriptionId<TKey>): void;
  getSerializedKey(key: TKey): string;
}

export interface ICachedAsyncResource<TKey, TData>
  extends IAsyncResource<TKey, TData> {
  get(key: TKey): TData | undefined;
}
