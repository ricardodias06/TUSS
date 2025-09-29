// line-mapper.js
// Aqui defines manualmente que paragens pertencem a cada linha.
// Cada linha tem dois arrays: outbound (IDA) e inbound (VOLTA).

window.LINE_MAPPINGS = {
  "5": {
    name: "Linha 5",
    color: "#0072bc",
    outbound: [
      [358, 0],
      [359, 0],
      [360, 0],
      [361, 0],
      [362, 0],
      [363, 0]
      // adiciona as paragens de IDA
    ],
    inbound: [
      [14, 0],
      [13, 0],
      [12, 0],
      [11, 0],
      [10, 0],
      [9, 0]
      // adiciona as paragens de VOLTA
    ]
  }
  // Outras linhas aqui...
};
