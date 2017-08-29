const BFS = require('./BFS');

exports.center = function (image, color) {
  const segments = BFS.findSegments(image, color);
  for (let i = 0; i < segments.length; i++) {
    segments[i].massCenter = getMassCenter(segments[i], true);
  }
  return segments;
};


exports.centerOfAll = function (image, color) {
  const segments = BFS.findSegments(image, color);
  const center = [0, 0];
  let n = 0;
  for (let i = 0; i < segments.length; i++) {
    const ofElem = getMassCenter(segments[i], false);
    center[0] += ofElem[0];
    center[1] += ofElem[1];
    n += segments[i].length;
  }
  center[0] /= n;
  center[1] /= n;
  return center;
};

function getMassCenter(object, divide) {
  let posI = 0;
  let posJ = 0;
  for (let i = 0; i < object.length; i++) {
    posI += object[i].i;
    posJ += object[i].j;
  }

  if (divide) {
    posI /= object.length;
    posJ /= object.length;
  }
  return [posI, posJ];
}
