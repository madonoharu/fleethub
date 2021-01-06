export const atLeastOne = (xs: number[]) => 1 - xs.reduce((acc, x) => acc * (1 - x), 1)

export const round = (number: number, precision?: number) => {
  precision = precision == null ? 0 : precision >= 0 ? Math.min(precision, 292) : Math.max(precision, -292)
  if (precision) {
    let pair = `${number}e`.split("e")
    const value = Math.round(+`${pair[0]}e${+pair[1] + precision}`)

    pair = `${value}e`.split("e")
    return +`${pair[0]}e${+pair[1] - precision}`
  }
  return Math.round(number)
}

export const randint = (upper: number) => Math.floor(Math.random() * (upper + 1))
