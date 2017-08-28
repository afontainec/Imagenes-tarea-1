const segmenter = require('./segmenter');
const colors = require('./colors');
const Point = require('./point');


exports.getAsVectors = function (image, center, image_name) {
  // const handles = getHandles(image, image_name);
  const vector = getHourAndMin(image, center);
  image.write(`./result/${image_name}/handle.jpg`);
  return vector;
};


function getHourAndMin(image, center) {
  const n = 12;
  const j = 6;
  const points = [];
  let inPurple = false;
  let inCyan = false;
  let inWhite = false;
  let found = -1;
  const coord = [];
  let c = 0;
  for (let i = 0; i < image.bitmap.height; i++) {
    const color = image.getPixelColor((j * center[0]) / n, i);
    switch (color) {
    case colors.PURPLE:
      if (!inCyan && !inPurple) {
        found++;

        coord[found] = 0;
        inPurple = true;
      }
      break;
    case colors.CYAN:
      inCyan = true;
      break;
    case colors.WHITE:
      if (inPurple) {
          // do something
      }
      inPurple = false;
      inCyan = false;
      inWhite = true;
      break;
    default:
      break;
    }
    if (inPurple) {
      coord[found] += i;
      c++;
    }
  }
  const p = [(j * center[0]) / n, coord[found] / c];
  const vector = Point.getVector(p, center);
  Point.paintLineBetween(image, colors.YELLOW, p, center);
  return vector;
}
