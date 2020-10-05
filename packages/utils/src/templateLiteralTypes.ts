export type Literal = string | number | bigint | boolean

type Last<T extends unknown[]> = [unknown, ...T][T["length"]]
type Shift<T extends unknown[]> = T extends [infer _, ...infer I] ? I : []
type Pop<T extends unknown[]> = T extends [...infer I, infer _] ? I : []

type Digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
export type Digit = Digits[number]

type AddOneValues = [...Shift<Digits>, 10]
type SubtractOneValues = [-1, ...Digits]

type AddOne<N extends Digit> = AddOneValues[N]
type SubtractOne<N extends Digit> = SubtractOneValues[N]

type RangeArray<N extends number> = N extends 0
  ? []
  : N extends Shift<Digits>[number]
  ? [...RangeArray<SubtractOne<N>>, SubtractOne<N>]
  : number[]

export type Concat<Current extends string, Args extends Literal[]> = Args extends { length: 0 } ? Current : Concat<`${Current}${Args[0]}`, Shift<Args>>

export const concat = <Args extends Literal[]>(...args: Args) => args.join("") as Concat<"", Args>

export type ParseOr<T> = T extends `${infer T1} | ${infer T2}` ? T1 | T2 : never

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false
export type ValueOf<T> = { [K in keyof T]: T[K] }[keyof T]
