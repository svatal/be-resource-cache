export const AsyncResourceState = {
  fetching: "fetching",
  fetched: "fetched",
  invalidated: "invalidated",
  error: "error", // ?
} as const;

export type AsyncResourceState =
  typeof AsyncResourceState[keyof typeof AsyncResourceState];

export const fetching = {
  state: AsyncResourceState.fetching,
  data: undefined,
};

export interface Fetched<TData> {
  state: typeof AsyncResourceState.fetched;
  data: TData;
}

export const invalidated = {
  state: AsyncResourceState.invalidated,
  data: undefined,
};

export interface Error {
  state: typeof AsyncResourceState.error;
  data?: undefined;
  error: "noRights" | "deleted" | "unspecified";
}

export type AsyncResourceResult<TData> =
  | typeof fetching
  | Fetched<TData>
  | typeof invalidated
  | Error;

interface IAsyncResourceBase<TKey, TResult> {
  subscribe(
    key: TKey,
    onChange: (result: TResult) => void
  ): { unsubscribe: () => void };
}

export interface IAsyncResource<TKey, TData>
  extends IAsyncResourceBase<TKey, AsyncResourceResult<TData>> {}

export interface CachedInvalidated<TData> {
  state: typeof AsyncResourceState.invalidated;
  data: TData;
}

export type CachedAsyncResourceResult<TData> =
  | typeof fetching
  | Fetched<TData>
  | CachedInvalidated<TData>
  | Error;

export interface ICachedAsyncResource<TKey, TData>
  extends IAsyncResourceBase<TKey, CachedAsyncResourceResult<TData>> {
  get(key: TKey): CachedAsyncResourceResult<TData> | undefined;
  getSerializedKey(key: TKey): string;
}
