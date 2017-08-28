const math = require('mathjs');

function distance(p1, p2) {
  let dist = 0;
  for (let i = 0; i < p1.length; i++) {
    dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
  }
  return Math.sqrt(dist);
}
exports.distance = distance;

function getLine(p1, p2) {
  const m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  const c = p1[1] - (m * p1[0]);
  const s = p1[0] > p2[0] ? p2[0] : p1[0];
  const f = p1[0] > p2[0] ? p1[0] : p2[0];
  return {
    m,
    c,
    s,
    f,
  };
}

exports.midPoint = function (p1, p2) {
  const line = getLine(p1, p2);
  const mid = (p1[0] + p2[0]) / 2;
  return [parseInt(mid, 10), parseInt((line.m * mid) + line.c, 10)];
};

exports.getVector = function (p1, p2) {
  return [p2[0] - p1[0], p2[1] - p1[1], p1];
};

function paintLineBetween(image, color, p1, p2) {
  const line = getLine(p1, p2);
  for (let i = line.s; i < line.f; i++) {
    const x = i;
    const y = (line.m * i) + line.c;
    image.setPixelColor(color, x, y);
  }
  return line;
}

exports.paintLineBetween = paintLineBetween;


exports.drawVector = function (image, color, vector) {
  const p1 = vector[2];
  const p2 = [p1[0] + vector[0], p1[1] + vector[1]];
  paintLineBetween(image, color, p1, p2);
};

function dotProduct(u, v) {
  return (u[0] * v[0]) + (u[1] * v[1]);
}

function getDet(u, v) {
  return (u[0] * v[1]) - (u[1] * v[0]);
}

function lengthOfVector(v) {
  const p1 = v[2];
  const p2 = [p1[0] + v[0], p1[1] + v[1]];
  return distance(p1, p2);
}

exports.getAngle = function (u, v) {
  const dot = dotProduct(u, v);
  const det = getDet(u, v);
  // const lenU = lengthOfVector(u);
  // const lenV = lengthOfVector(v);
  let angle = math.atan2(det, dot);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
};

exports.vectorEndPoint = function (v) {
  return [v[2][0] + v[0], v[2][1] + v[1]];
};
