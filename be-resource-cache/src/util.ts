export type DeepReadonly<T> = T extends
  | Function
  | boolean
  | number
  | string
  | null
  | undefined
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer V>
  ? ReadonlySet<DeepReadonly<V>>
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };

export function asDeepReadonly<T>(x: T): DeepReadonly<T> {
  return x as DeepReadonly<T>;
}
/*
test<number>(1);
test<number[]>([1]);
test<{ a: number; b: string[] }>({ a: 1, b: ["12"] });

const x = {
  a: 1,
  b: ["12"],
  c: new Map<string, string>(),
  d: new Set<number>(),
};
test<typeof x>(x);

function test<T>(x: DeepReadonly<T>) {}
*/
export function assertNever(x: never) {}
