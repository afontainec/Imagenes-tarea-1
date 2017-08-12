const colors = require('./colors');
const Point = require('./point');
const segmenter = require('./segmenter');
const Jimp = require('jimp');
const BFS = require('./BFS');
const cropper = require('./cropper');

exports.find = function (image, image_name, original) {
  const colorImage = original.clone();

  let newImage = getRedHandle(original, image_name);
  // getWhites(original, image_name);

  newImage = getTimeBlocks(original, newImage, image_name);

  // getGreys(original, image_name);

  // const vertical = getVerticalDiameter(image, colorImage); // get the vertical diameter of the image
  // const horizontal = getHorizontalDiameter(image, colorImage); // get the horizontal diameter of the image
  // colorImage.write(`./result/${image_name}/3.Parameterized.jpg`); // on this path an image is saved showing the advance
  // return {
  //   vertical,
  //   horizontal,
  // };
};

// function getGreys(original, image_name) {
//   let image = original.clone();
//   const BLACK = [25, 29, 28];
//   const GREY = [80, 104, 90];
//   const RED = [139, 29, 45];
//   const GREEN = [0, 255, 0];
//   const BLUE = [31, 91, 163];
//   // const WHITE = [100, 124, 110];
//
//   image = cropper.colorWithFilter(image, original, colors.GREEN, colors.RED);
//   image = cropper.colorWithFilter(image, original, colors.BLUE, colors.BLUE);
//   image = cropper.colorWithFilter(image, original, colors.GREEN, colors.CYAN);
//   image = cropper.colorWithFilter(image, original, colors.GREEN, colors.PURPLE);
//
//   const searchColors = [BLACK, GREY, RED, GREEN, BLUE];
//   const reColors = [colors.BLACK, colors.GREY, colors.RED, colors.GREEN, colors.BLUE];
//
//   image.write(`./result/${image_name}/7.testing_grey_before.jpg`); // on this path an image is saved showing the advance
//
//   const WIDTH = image.bitmap.width;
//   const HEIGHT = image.bitmap.height;
//   for (let i = 0; i < WIDTH; i++) {
//     for (let j = 0; j < HEIGHT; j++) {
//       let distance = 10000000;
//       const color = image.getPixelColor(i, j);
//       const rgba = Jimp.intToRGBA(color);
//       const v = [rgba.r, rgba.g, rgba.b];
//       let newColor;
//       for (let k = 0; k < searchColors.length; k++) {
//         const ref = searchColors[k];
//         if (Point.distance(v, ref) < distance) {
//           distance = Point.distance(v, ref);
//           newColor = reColors[k];
//         }
//       }
//       image.setPixelColor(newColor, i, j);
//     }
//   }

//   BFS.paintHoles(image, colors.RED, colors.BLUE, 2000);
//   BFS.paintHoles(image, colors.BLACK, colors.BLUE, 200);
//   BFS.paintHoles(image, colors.GREY, colors.BLUE, 100);
//   BFS.paintHoles(image, colors.BLUE, colors.GREY, 1000);
//
//   original = cropper.colorWithFilter(original, image, colors.YELLOW, colors.BLUE);
//
//
//   image.write(`./result/${image_name}/7.testing_grey.jpg`); // on this path an image is saved showing the advance
//   original.write(`./result/${image_name}/7.testing_grey.jpg`); // on this path an image is saved showing the advance
// }

function getRedHandle(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  image = segmenter.getLargestByColor(image, RED, 80, image_name);
  original = cropper.colorWithFilter(original, image, colors.CYAN);
  image = cropper.colorWithFilter(image, image, colors.CYAN);


  original.write(`./result/${image_name}/3.red_handle.jpg`); // on this path an image is saved showing the advance
  image.write(`./result/${image_name}/3.red_handle_outline.jpg`); // on this path an image is saved showing the advance

  return image;
}


function getTimeBlocks(original, outlineImage, image_name) {
  let image = original.clone();
  image = segmenter.getBlackHandles(image, 90, image_name);
  original = cropper.colorWithFilter(original, image, colors.PURPLE, colors.PURPLE);
  original = cropper.colorWithFilter(original, image, colors.YELLOW, colors.YELLOW);
  outlineImage = cropper.colorWithFilter(outlineImage, image, colors.PURPLE, colors.PURPLE);
  outlineImage = cropper.colorWithFilter(outlineImage, image, colors.YELLOW, colors.YELLOW);

  const dim = cropper.getBoundingBox(image, colors.YELLOW);
  image.crop(dim[0], dim[1], dim[2], dim[3]);
  original.crop(dim[0], dim[1], dim[2], dim[3]);
  outlineImage.crop(dim[0], dim[1], dim[2], dim[3]);
  image.write(`./result/${image_name}/4.black_parts_outline.jpg`); // on this path an image is saved showing the advance
  original.write(`./result/${image_name}/5.testing.jpg`); // on this path an image is saved showing the advance
  outlineImage.write(`./result/${image_name}/6.outlined.jpg`); // on this path an image is saved showing the advance
  return outlineImage;
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
