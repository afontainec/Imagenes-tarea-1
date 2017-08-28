const BFS = require('./BFS');

exports.center = function (image, color) {
  const segments = BFS.findSegments(image, color);
  for (let i = 0; i < segments.length; i++) {
    segments[i].massCenter = getMassCenter(segments[i]);
  }
  return segments;
};

function getMassCenter(object) {
  let posI = 0;
  let posJ = 0;
  for (let i = 0; i < object.length; i++) {
    posI += object[i].i;
    posJ += object[i].j;
  }

  posI /= object.length;
  posJ /= object.length;
  return [posI, posJ];
}
