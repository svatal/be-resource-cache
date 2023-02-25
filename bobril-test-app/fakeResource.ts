import { cached } from "be-resource-cache";

export const fakeResource = cached<number, number>(
  {
    subscribe(key, onChange) {
      let value = 1;
      const iId = setInterval(() => {
        onChange({ state: "fetched", data: value++ });
      }, 1000);
      return {
        unsubscribe: () => {
          clearInterval(iId);
        },
      };
    },
  },
  (key) => `${key}`
);
