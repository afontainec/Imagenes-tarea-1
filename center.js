const colors = require('./colors');
const Point = require('./point');
const segmenter = require('./segmenter');
const BFS = require('./BFS');
const cropper = require('./cropper');

exports.find = function (image, image_name, original) {
  const image_copy = image.clone();
  cropper.colorComplementWithFilter(image_copy, image, colors.RED, colors.BLUE);
  image_copy.write(`./result/${image_name}/bb.jpg`);
  const top = getTop(image_copy, colors.RED);
  const bottom = getBottom(image_copy, colors.RED);
  const left = getLeft(image_copy, colors.RED);
  const right = getRight(image_copy, colors.RED);
  image.setPixelColor(colors.YELLOW, top[0], top[1]);
  image.setPixelColor(colors.YELLOW, bottom[0], bottom[1]);
  image.setPixelColor(colors.YELLOW, left[0], left[1]);
  image.setPixelColor(colors.YELLOW, right[0], right[1]);
  image_copy.write(`./result/${image_name}/bb3.jpg`);
  image.write(`./result/${image_name}/bb2.jpg`);

  // const segments = BFS.findSegments(image_copy, colors.RED);
  // for (let i = 0; i < segments.length; i++) {
  //   const img = image_copy.clone();
  //   BFS.paintSegment(img, segments[i], colors.RED);
  //   const top = cropper.getMinY(img, colors.RED);
  //   const bottom = cropper.getMaxY(img, colors.RED);
  //   const left = cropper.getMinX(img, colors.RED);
  //   const right = cropper.getMaxX(img, colors.RED);
  //   console.log(top, bottom, left, right);
  //   image.setPixelColor(colors.RED, top[0], top[1]);
  //   image.setPixelColor(colors.RED, bottom[0], bottom[1]);
  //   image.setPixelColor(colors.RED, left[0], left[1]);
  //   image.setPixelColor(colors.RED, right[0], right[1]);
  // }
  // image.write(`./result/${image_name}/bb.jpg`);
};


function getVerticalDiameter(image, original) {
  const top = getTop(image, colors.BLACK);
  const bottom = getBottom(image, colors.BLACK);
  const diameter = paintDiameter(original, top, bottom, colors.PURPLE, colors.RED);
  return diameter;
}

function getHorizontalDiameter(image, original) {
  const left = getLeft(image, colors.BLACK);
  const right = getRight(image, colors.BLACK);
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
