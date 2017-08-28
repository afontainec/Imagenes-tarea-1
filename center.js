const colors = require('./colors');
const Point = require('./point');
const Mass = require('./mass');
const BFS = require('./BFS');
const cropper = require('./cropper');


exports.find = function (image, image_name) {
  findByMask(image, image_name);
  // const diameter = findDiameter(image, image_name);
  // image.write(`./result/${image_name}/with_diameters.jpg`);
};


function findByMask(image, image_name) {
  const resized = image.resize(256, 256);
  resized.write(`./result/${image_name}/resized.jpg`);
  const maskSize = 18;
  operateMask(resized, maskSize);
  // paintMask(resized, maskSize, 100);
  resized.write(`./result/${image_name}/mask.jpg`);
}


function operateMask(image, mask) {
  let bestMask = [-1, -1];
  let minWhite = 10000;
  for (let jOffset = 0; jOffset < image.bitmap.width; jOffset++) {
    for (let iOffset = 0; iOffset < image.bitmap.width; iOffset++) {
      let hasPurple = 0;
      let hasCyan = 0;
      let hasWhite = 0;

      for (let i = 0; i < mask; i++) {
        for (let j = 0; j < mask; j++) {
          const color = image.getPixelColor(iOffset + i, jOffset + j);
          if (color === colors.PURPLE) {
            hasPurple++;
          }
          if (color === colors.CYAN) {
            hasCyan++;
          }
          if (color === colors.WHITE) {
            hasWhite++;
          }
        }
      }
      if (hasCyan && hasPurple && hasWhite < minWhite) {
        bestMask = [iOffset, jOffset];
        minWhite = hasWhite;
      }
      if (hasCyan && hasPurple && hasCyan > hasPurple && !hasWhite) {
        paintMask(image, mask, iOffset, jOffset);
      }
    }
  }
  paintMask(image, mask, bestMask[0], bestMask[1], colors.RED);
}

function paintMask(image, mask, iOffset, jOffset, color) {
  const paintingColor = color || colors.BLACK;
  for (let j = 0; j < mask; j++) {
    image.setPixelColor(paintingColor, iOffset, jOffset + j);
    image.setPixelColor(paintingColor, iOffset + (mask - 1), jOffset + j);
    image.setPixelColor(paintingColor, iOffset + j, jOffset);
    image.setPixelColor(paintingColor, iOffset + j, jOffset + (mask - 1));
  }
}

function findDiameter(image, image_name) {
  const timeBlocks = Mass.center(image, colors.YELLOW);
  const pointImage = timeBlocksToPoints(image, timeBlocks);
  const diameters = getOpositeSide(timeBlocks, image, image_name);
  for (let i = 0; i < diameters.length; i++) {
    const diameter = diameters[i];
    paintDiameter(pointImage, diameter.p1, diameter.p2, colors.BLUE, colors.RED);
  }
}

function timeBlocksToPoints(image, timeBlocks) {
  cropper.colorWithFilter(image, image, colors.WHITE, colors.YELLOW);
  for (let i = 0; i < timeBlocks.length; i++) {
    image.setPixelColor(colors.BLACK, timeBlocks[i].massCenter[0], timeBlocks[i].massCenter[1]);
  }
  return image;
}


function getVerticalDiameter(image, original) {
  const top = getTop(image, colors.YELLOW);
  const bottom = getBottom(image, colors.YELLOW);
  const diameter = paintDiameter(original, top, bottom, colors.PURPLE, colors.RED);
  return diameter;
}

function getHorizontalDiameter(image, original) {
  const left = getLeft(image, colors.YELLOW);
  const right = getRight(image, colors.YELLOW);
  const diameter = paintDiameter(original, left, right, colors.BLUE, colors.YELLOW);
  return diameter;
}

function paintDiameter(image, p1, p2, mainColor, centerColor) {
  const diameter = Point.paintLineBetween(image, mainColor, p1, p2);
  const center = Point.midPoint(p1, p2);
  image.setPixelColor(centerColor, center[0], center[1]);
  image.setPixelColor(centerColor, p1[0], p1[1]);
  image.setPixelColor(centerColor, p2[0], p2[1]);
  diameter.center = center;
  return diameter;
}


// returns the coordinates of the pixel of the middle of the first line of color segment_color
function getTop(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let x = 0;
  let n = 0;
  let found = false;
  for (let j = 0; j < HEIGHT; j++) {
    for (let i = 0; i < WIDTH; i++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        image.setPixelColor(colors.PURPLE, i, j);
        found = true;
        x += i;
        n += 1;
      }
    }
    if (found) {
      x /= n;
      return [parseInt(x, 10), j];
    }
  }

  return [0, 0];
}

function getBottom(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let x = 0;
  let n = 0;
  let found = false;
  for (let j = HEIGHT - 1; j >= 0; j--) {
    for (let i = 0; i < WIDTH; i++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        found = true;
        x += i;
        n += 1;
      }
    }
    if (found) {
      x /= n;
      return [parseInt(x, 10), j];
    }
  }

  return [0, 0];
}


// returns the coordinates of the pixel of the middle of the first column of color segment_color
function getLeft(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let y = 0;
  let n = 0;
  let found = false;
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        found = true;
        y += j;
        n += 1;
      }
    }
    if (found) {
      y /= n;
      return [i, parseInt(y, 10)];
    }
  }

  return [0, 0];
}

// returns the coordinates of the pixel of the middle of the last column of color segment_color
function getRight(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let y = 0;
  let n = 0;
  let found = false;
  for (let i = WIDTH - 1; i >= 0; i--) {
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        found = true;
        y += j;
        n += 1;
      }
    }
    if (found) {
      y /= n;
      return [i, parseInt(y, 10)];
    }
  }

  return [0, 0];
}


exports.massCenter = function (image, image_name) {
  const timeBlocks = massCenterTimeBlocks(image, image_name);
  getOpositeSide(timeBlocks, image, image_name);
  image.write(`./result/${image_name}/massCenter.jpg`);
};

function getFurtherAway(timeBlocks) {
  for (let i = 0; i < timeBlocks.length; i++) {
    const start = timeBlocks[i];
    let maxDistance = -1;
    for (let j = 0; j < timeBlocks.length; j++) {
      const end = timeBlocks[j];
      const distance = Point.distance(start.massCenter, end.massCenter);
      if (distance > maxDistance) {
        maxDistance = distance;
        start.opposite = end;
      }
    }
  }
}

function getOpositeSide(timeBlocks) {
  const opposites = [];
  getFurtherAway(timeBlocks);

  for (let i = 0; i < timeBlocks.length; i++) {
    if (timeBlocks[i] === timeBlocks[i].opposite.opposite) {
      opposites.push({
        p1: timeBlocks[i].massCenter,
        p2: timeBlocks[i].opposite.massCenter,
      });
    }
  }
  return opposites;
}

function massCenterTimeBlocks(image) {
  const timeBlocks = BFS.findSegments(image, colors.YELLOW);
  for (let i = 0; i < timeBlocks.length; i++) {
    timeBlocks[i].massCenter = getMassCenter(timeBlocks[i]);
  }
  return timeBlocks;
}


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
