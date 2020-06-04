import React from "react"

import { Container } from "@material-ui/core"

import { NauticalChart } from "../components"
import { MapData } from "../components/organisms/NauticalChart/NauticalChart"

const map: MapData = {
  route: {
    "0": [null, "1", 0, 0],
    "1": ["1", "A", 4, 4],
    "2": ["1", "B", 90, 6],
    "3": ["1", "C", 10, 4],
    "4": ["A", "D", 4, 4],
    "5": ["A", "E", 4, 4],
    "6": ["D", "F", 91, 6],
    "7": ["D", "G", 10, 4],
    "8": ["F", "H", 6, 9],
    "9": ["H", "I", 5, 5],
    "10": ["G", "J", 5, 5],
    "11": ["D", "K", 90, 6],
    "12": ["K", "L", 4, 4],
    "13": ["L", "M", 14, 10],
    "14": ["L", "N", 10, 4],
    "15": ["M", "O", 10, 4],
    "16": ["B", "A", 4, 4],
    "17": ["C", "B", 90, 6],
    "18": ["B", "D", 4, 4],
    "19": ["D", "E", 4, 4],
    "20": ["E", "G", 10, 4],
    "21": ["F", "K", 90, 6],
    "22": ["N", "O", 10, 4],
    "23": ["E", "J", 5, 5],
    "24": ["O", "P", 90, 6],
    "25": ["P", "Q", 4, 4],
    "26": ["Q", "R", 4, 4],
    "27": ["R", "S", 90, 6],
    "28": ["R", "T", 5, 5],
    "29": ["Q", "T", 5, 5],
  },
  spots: {
    "1": [143, 203, "Start"],
    A: [343, 428, null],
    B: [374, 267, null],
    C: [391, 185, null],
    D: [411, 404, null],
    E: [426, 466, null],
    F: [473, 378, null],
    G: [510, 461, null],
    H: [556, 331, null],
    I: [605, 370, null],
    J: [598, 541, null],
    K: [624, 434, null],
    L: [706, 500, null],
    M: [758, 436, null],
    N: [759, 494, null],
    O: [820, 485, null],
    P: [867, 510, null],
    Q: [961, 438, null],
    R: [1035, 385, null],
    S: [1012, 217, null],
    T: [862, 241, null],
  },
  distances: {
    A: 4,
    B: 3,
    C: 4,
    D: 3,
    E: 4,
    F: 2,
    G: 3,
    H: 1,
    I: 2,
    J: 4,
    K: 3,
    L: 4,
    M: 4,
    N: 5,
    O: 5,
    P: 6,
    Q: 6,
    R: 7,
    S: 7,
    T: 5,
  },
}

const MapsPage: React.FC = () => {
  const [point, setPoint] = React.useState<string>("")
  return (
    <Container>
      <NauticalChart data={map} onClick={(node) => setPoint(node.point)} />
      {point}
    </Container>
  )
}

export default MapsPage
