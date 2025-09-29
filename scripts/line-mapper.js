// /scripts/line-mapper.js
// Manual mapping: cada linha tem name, color, outbound (IDA) e inbound (VOLTA).
// Cada paragem: [rowIndex, colIndex] (numérico). Se o CSV usar 1-based vs 0-based o renderer tenta fallbacks.

window.LINE_MAPPINGS = {
  "5": {
    name: "Linha 5",
    color: "#cd0000",
    outbound: [
      [358, 0],
      [359, 0],
      [360, 0],
      [361, 0],
      [362, 0],
      [363, 0],
      [364, 0],
      [365, 0],
      [366, 0],
      [367, 0],
      [368, 0],
      [369, 0],
      [370, 0],
      [371, 0],
      [372, 0],
      [373, 0],
      [374, 0],
      [375, 0],
      [376, 0],
      [377, 0]
      // adiciona mais [row,col] conforme necessário
    ],
    inbound: [
      [379, 0],
      [380, 0],
      [381, 0],
      [382, 0],
      [383, 0],
      [384, 0],
      [385, 0],
      [386, 0],
      [387, 0],
      [388, 0],
      [389, 0],
      [390, 0],
      [391, 0],
      [392, 0],
      [393, 0],
      [394, 0],
      [395, 0],
      [396, 0]
      // adiciona mais [row,col] conforme necessário
    ]
  }

  // Adiciona aqui outras linhas, por ex:
  // "200": { name: "Linha 200", color: "#0077cc", outbound: [[...],[...]], inbound: [[...]] }
};
