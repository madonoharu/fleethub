const table = [0, 10, 25, 40, 55, 70, 85, 100]

const expToAce = (exp: number) => table.filter((boundary) => boundary <= exp).length - 1

const aceToExp = (ace: number) => table[ace] || 0

const ProficiencyExp = {
  table,
  expToAce,
  aceToExp,
}

export default ProficiencyExp
