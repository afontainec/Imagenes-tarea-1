// const Jimp = require('jimp');
const colors = require('./colors');


// crop the area so that surrounds all the pixels with the segment_color
exports.cropSegment = function (image, segment_color) {
  const x1 = getMinX(image, segment_color)[0];
  const x2 = getMaxX(image, segment_color)[0];

  const y1 = getMinY(image, segment_color)[1];
  const y2 = getMaxY(image, segment_color)[1];
  return [x1, y1, x2 - x1, y2 - y1];
};

function getMinX(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let x;
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        x = [i, j];
        break;
      }
    }
    if (x !== undefined) {
      break;
    }
  }
  return x;
}

function getMaxX(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let x;
  for (let i = WIDTH - 1; i >= 0; i--) {
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        x = [i, j];
        break;
      }
    }
    if (x !== undefined) {
      break;
    }
  }
  return x;
}

function getMinY(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let y;
  for (let j = 0; j < HEIGHT; j++) {
    for (let i = 0; i < WIDTH; i++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        y = [i, j];
        break;
      }
    }
    if (y !== undefined) {
      break;
    }
  }
  return y;
}

function getMaxY(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let y;
  for (let j = HEIGHT - 1; j >= 0; j--) {
    for (let i = 0; i < WIDTH; i++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        y = [i, j];
        break;
      }
    }
    if (y !== undefined) {
      break;
    }
  }
  return y;
}

exports.getMinX = getMinX;
exports.getMaxX = getMaxX;
exports.getMinY = getMinY;
exports.getMaxY = getMaxY;


exports.removeBackgroud = function (target, binary) {
  const WIDTH = binary.bitmap.width;
  const HEIGHT = binary.bitmap.height;
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      const color = binary.getPixelColor(i, j);
      if (color === colors.WHITE) {
        target.setPixelColor(colors.CYAN, i, j);
      }
    }
  }
  return target;
};
