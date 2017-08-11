const colors = require('./colors');
const Point = require('./point');
const segmenter = require('./segmenter');
const BFS = require('./BFS');
const cropper = require('./cropper');

exports.find = function (image, image_name, original) {
  const colorImage = original.clone();

  getGreys(original, image_name);
  getRedHandle(original, image_name);
  // getWhites(original, image_name);

  // getTimeBlocks(original, image_name);
  // const vertical = getVerticalDiameter(image, colorImage); // get the vertical diameter of the image
  // const horizontal = getHorizontalDiameter(image, colorImage); // get the horizontal diameter of the image
  // colorImage.write(`./result/${image_name}/3.Parameterized.jpg`); // on this path an image is saved showing the advance
  // return {
  //   vertical,
  //   horizontal,
  // };
};

function getGreys(original, image_name) {
  let image = original.clone();
  const GREY = [80, 104, 90];
  image = segmenter.getLargestByColor(image, GREY, 1, image_name);
  image.write(`./result/${image_name}/7.testing_grey.jpg`);  // on this path an image is saved showing the advance
  original = cropper.colorWithFilter(original, image, colors.BLUE);

  original.write(`./result/${image_name}/6.testing_grey.jpg`);  // on this path an image is saved showing the advance
}

function getRedHandle(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  const clusters_colors = [colors.PURPLE, colors.PURPLE, colors.PURPLE, colors.PURPLE, colors.BLACK];
  image = segmenter.getByClusters(image, RED, 2, clusters_colors, image_name);
  image.write(`./result/${image_name}/7.testing_red.jpg`);  // on this path an image is saved showing the advance
  original = cropper.colorWithFilter(original, image, colors.RED);
  original = cropper.colorWithFilter(original, image, colors.BLUE, colors.PURPLE);
  original.write(`./result/${image_name}/6.testing_red.jpg`);  // on this path an image is saved showing the advance
}

function getWhites(original, image_name) {
  let image = original.clone();
  const WHITE = [255, 255, 255];
  const clusters_colors = [colors.BLACK, colors.PURPLE, colors.BLUE, colors.RED, colors.CYAN];
  image = segmenter.getByClusters(image, WHITE, 3, clusters_colors, image_name);
  image.write(`./result/${image_name}/7.testing_white.jpg`);  // on this path an image is saved showing the advance

  // original.write(`./result/${image_name}/6.testing.jpg`);  // on this path an image is saved showing the advance
}


function getTimeBlocks(original, image_name) {
  let image = original.clone();
  const BLACK = [25, 29, 28];
  const clusters_colors = [colors.BLACK, colors.PURPLE, colors.BLUE, colors.RED, colors.CYAN];
  image = segmenter.getByClusters(image, BLACK, 4, clusters_colors, image_name);
  // image = segmenter.getByColor(image, BLACK, 3, image_name); // get binary image with BLACK whenever the is RED and the rest is white
  // image = BFS.removeLargest(image, colors.BLACK);
  // image = BFS.paintHoles(image, colors.BLACK, colors.WHITE, 200);
  // original = cropper.colorWithFilter(original, image, colors.BLUE);
  image.write(`./result/${image_name}/8.testing.jpg`);  // on this path an image is saved showing the advance

  original.write(`./result/${image_name}/6.testing.jpg`);  // on this path an image is saved showing the advance
}

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
