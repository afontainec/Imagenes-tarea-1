exports.distance = function (p1, p2) {
  let dist = 0;
  for (let i = 0; i < p1.length; i++) {
    dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
  }
  return Math.sqrt(dist);
};

function getLine(p1, p2) {
  const m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  const c = p1[1] - (m * p1[0]);
  const s = p2[0];
  const f = p1[0];
  return {
    m,
    c,
    s,
    f,
  };
}


exports.paintLineBetween = function (image, color, p1, p2) {
  const line = getLine(p1, p2);
  console.log(p1, p2);
  console.log(line);
  for (let i = line.s; i < line.f; i++) {
    const x = i;
    const y = (line.m * i) + line.c;
    image.setPixelColor(color, x, y);
  }
};
