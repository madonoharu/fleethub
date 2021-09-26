/* eslint-disable @typescript-eslint/ban-types */
export type Dict<K extends string | number | symbol, T> = Partial<Record<K, T>>;

export type NullableArray<T> = Array<T | undefined>;

export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>;

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export type SheetRow = Record<string, string | number | boolean | undefined>;

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;

export type ValueOf<T> = { [K in keyof T]: T[K] }[keyof T];

export type Literal = string | number | bigint | boolean;

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends object
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof unknown[]>> &
            string}`
        | `${Key}.${Exclude<keyof T[Key], keyof unknown[]> & string}`
    : never
  : never;

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

export type Path<T> = PathImpl2<T> extends string | keyof T
  ? PathImpl2<T>
  : keyof T;

export type PathValue<
  T,
  P extends Path<T>
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;
