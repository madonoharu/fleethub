import { Parser, Value } from "expr-eval"

export type Variables = Record<string, Value | Value[] | boolean | null>

const parseExpr = (expr: string) => {
  try {
    const parsed = Parser.parse(expr)
    return (arg: Variables): unknown => {
      try {
        return parsed.evaluate(arg as Record<string, Value>)
      } catch (error) {
        throw new Error(`${error?.message}\n${expr}`)
      }
    }
  } catch (error) {
    throw new Error(`${error?.message}\n${expr}`)
  }
}

export default parseExpr
