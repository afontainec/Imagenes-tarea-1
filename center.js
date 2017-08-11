const colors = require('./colors');
const Point = require('./point');

exports.find = function (image, image_name) {
  const top = getTop(image, colors.BLACK);
  const bottom = getBottom(image, colors.BLACK);
  Point.paintLineBetween(image, colors.RED, bottom, top);
  image.setPixelColor(colors.RED, top[0], top[1]);
  image.setPixelColor(colors.RED, bottom[0], bottom[1]);
  image.write(`./result/${image_name}/parameterized.jpg`);  // on this path an image is saved showing the advance
  return image;
};


// returns the coordinates of the pixel of the middle of the first line of color segment_color
function getTop(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let y = 0;
  let n = 0;
  let found = false;
  for (let j = 0; j < HEIGHT; j++) {
    for (let i = 0; i < WIDTH; i++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        found = true;
        y += i;
        n += 1;
      }
    }
    if (found) {
      y /= n;
      return [parseInt(y, 10), j];
    }
  }

  return [0, 0];
}

function getBottom(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  let y = 0;
  let n = 0;
  let found = false;
  for (let j = HEIGHT - 1; j >= 0; j--) {
    for (let i = 0; i < WIDTH; i++) {
      const color = image.getPixelColor(i, j);
      if (color === segment_color) {
        found = true;
        y += i;
        n += 1;
      }
    }
    if (found) {
      y /= n;
      return [parseInt(y, 10), j];
    }
  }

  return [0, 0];
}
