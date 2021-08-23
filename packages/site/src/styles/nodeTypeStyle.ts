const nodeTypes = [
  {
    id: 0,
    name: "nodeTypeStart",
    color: "#eeeeff",
    background: "#4a95e3",
    border: "#3a77db",
  },
  {
    id: 4,
    name: "nodeTypeBattle",
    color: "#000000",
    background: "#ff7979",
    border: "#ef1a1a",
  },
  {
    id: 5,
    name: "nodeTypeBoss",
    color: "#ffeeee",
    background: "#d92b2b",
    border: "#980d02",
  },

  {
    id: 90,
    name: "nodeTypeNothing",
    color: "#000000",
    background: "#82e9ff",
    border: "#1abaef",
  },
  {
    id: 91,
    name: "nodeTypeChoice",
    color: "#000000",
    background: "#82e9ff",
    border: "#f7f733",
  },
  {
    id: 14,
    name: "nodeTypeRepair",
    color: "#000000",
    background: "#a2efff",
    border: "#f0f0ff",
  },

  {
    id: 2,
    name: "nodeTypeResource",
    color: "#000000",
    background: "#b0ff5b",
    border: "#76d406",
  },
  {
    id: 9,
    name: "nodeTypeAirResource",
    color: "#000000",
    background: "#8fa933",
    border: "#577c21",
  },
  {
    id: 6,
    name: "nodeTypeTransport",
    color: "#000000",
    background: "#76d406",
    border: "#b0ff5b",
  },

  {
    id: 10,
    name: "nodeTypeAirRaid",
    color: "#000000",
    background: "#ff7979",
    border: "#fad0d3",
  },
  {
    id: 7,
    name: "nodeTypeAirBattle",
    color: "#000000",
    background: "#ff7979",
    border: "#1abaef",
  },
  {
    id: 13,
    name: "nodeTypeAmbush",
    color: "#000000",
    background: "#ffad22",
    border: "#ef4b1a",
  },

  {
    id: 11,
    name: "nodeTypeNightBattle",
    color: "#000000",
    background: "#b076ec",
    border: "#dad0e1",
  },
  {
    id: 3,
    name: "nodeTypeMaelstrom",
    color: "#000000",
    background: "#d2c6ff",
    border: "#ae8ae7",
  },

  {
    id: 8,
    name: "nodeTypeFinishLine",
    color: "#000000",
    background: "#dbe5ea",
    border: "#497291",
  },

  {
    id: -2,
    name: "nodeTypeLBAS",
    color: "#000000",
    background: "#dddddd",
    border: "#999999",
  },
  {
    id: -1,
    name: "nodeTypeUnknown",
    color: "#000000",
    background: "#dddddd",
    border: "#999999",
  },
];

export const getNodeTypeStyle = (id: number) => {
  return nodeTypes.find((type) => type.id === id) || nodeTypes[0];
};
