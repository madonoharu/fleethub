import { useState } from "react"
import get from "lodash/get"
import set from "lodash/set"
import { useImmer } from "use-immer"

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T

type Path<T> = PathImpl2<T> extends string | keyof T ? PathImpl2<T> : keyof T

type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never

export const useImmerFields = <S extends object>(initialValue: S | (() => S)) => {
  const [state, setState] = useImmer(initialValue)

  const getHandlers = <K extends Path<S>>(key: K) => {
    const value: PathValue<S, K> = get(state, key)

    const onChange = (value: PathValue<S, K>) => {
      setState((draft) => {
        set(draft, key, value)
      })
    }

    return { value, onChange }
  }

  return { state, setState, getHandlers }
}
