/* eslint-disable @typescript-eslint/ban-types */
export type Optional<T extends object, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type NullToOptional<T> = T extends object
  ? Optional<
      {
        [K in keyof T]: NullToOptional<T[K]>;
      },
      {
        [K in keyof T]: null extends T[K] ? K : never;
      }[keyof T]
    >
  : T;
