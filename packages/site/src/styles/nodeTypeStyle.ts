const nodeTypes = [
  {
    id: 0,
    name: "Start",
    color: "#eeeeff",
    background: "#4a95e3",
    border: "#3a77db",
  },
  {
    id: 4,
    name: "Battle",
    color: "#000000",
    background: "#ff7979",
    border: "#ef1a1a",
  },
  {
    id: 5,
    name: "Boss",
    color: "#ffeeee",
    background: "#d92b2b",
    border: "#980d02",
  },

  {
    id: 90,
    name: "Nothing",
    color: "#000000",
    background: "#82e9ff",
    border: "#1abaef",
  },
  {
    id: 91,
    name: "Choice",
    color: "#000000",
    background: "#82e9ff",
    border: "#f7f733",
  },
  {
    id: 14,
    name: "Repair",
    color: "#000000",
    background: "#a2efff",
    border: "#f0f0ff",
  },

  {
    id: 2,
    name: "Resource",
    color: "#000000",
    background: "#b0ff5b",
    border: "#76d406",
  },
  {
    id: 9,
    name: "AirResource",
    color: "#000000",
    background: "#8fa933",
    border: "#577c21",
  },
  {
    id: 6,
    name: "Transport",
    color: "#000000",
    background: "#76d406",
    border: "#b0ff5b",
  },

  {
    id: 10,
    name: "AirRaid",
    color: "#000000",
    background: "#ff7979",
    border: "#fad0d3",
  },
  {
    id: 7,
    name: "AirBattle",
    color: "#000000",
    background: "#ff7979",
    border: "#1abaef",
  },
  {
    id: 13,
    name: "Ambush",
    color: "#000000",
    background: "#ffad22",
    border: "#ef4b1a",
  },

  {
    id: 11,
    name: "NightBattle",
    color: "#000000",
    background: "#b076ec",
    border: "#dad0e1",
  },
  {
    id: 3,
    name: "Maelstrom",
    color: "#000000",
    background: "#d2c6ff",
    border: "#ae8ae7",
  },

  {
    id: 8,
    name: "FinishLine",
    color: "#000000",
    background: "#dbe5ea",
    border: "#497291",
  },

  {
    id: -2,
    name: "LBAS",
    color: "#000000",
    background: "#dddddd",
    border: "#999999",
  },
  {
    id: -1,
    name: "Unknown",
    color: "#000000",
    background: "#dddddd",
    border: "#999999",
  },
] as const;

export const getNodeTypeStyle = (id: number) => {
  return nodeTypes.find((type) => type.id === id) || nodeTypes[0];
};
