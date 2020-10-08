const toHeaderKeyValues = <K extends string = string>(headerValues: string[]) =>
  headerValues.map((headerValue) => {
    const trimmed = headerValue.trim()
    const result = /(\S+)\s*\((.*)\)/.exec(trimmed)

    if (!result) return { headerValue, key: trimmed as K, comment: "" }
    return { headerValue, key: result[1] as K, comment: result[2] }
  })

export default toHeaderKeyValues
