const colors = require('./colors');
const cropper = require('./cropper');
const math = require('mathjs');
const Jimp = require('jimp');

exports.perspective = function (image, image_name) {
  const image_copy = image.clone();
  cropper.colorComplementWithFilter(image_copy, image, colors.RED, colors.BLUE);
  const top = getTop(image_copy, colors.RED);
  const bottom = getBottom(image_copy, colors.RED);
  const left = getLeft(image_copy, colors.RED);
  const right = getRight(image_copy, colors.RED);
  colorCoord(image, image_name, [top, bottom, left, right]);
  console.log(`${image_name} : getting transformation`);
  const T = getTransformation([top, bottom, left, right], image);
  const transformedImage = transform(T, image, image_name);
  transformedImage.write(`./result/${image_name}/transformed2.jpg`);
  return transformedImage;
};

function colorCoord(image, image_name, coord) {
  image.setPixelColor(colors.YELLOW, coord[0][0], coord[0][1]);
  image.setPixelColor(colors.YELLOW, coord[1][0], coord[1][1]);
  image.setPixelColor(colors.YELLOW, coord[2][0], coord[2][1]);
  image.setPixelColor(colors.YELLOW, coord[3][0], coord[3][1]);
  image.write(`./result/${image_name}/with_coordinate_points.jpg`);
}


function transform(T, image) {
  const coor = Math.floor(Math.min(image.bitmap.width / 2, image.bitmap.height / 2));
  const newImage = new Jimp(coor * 2, coor * 2, (err, newImage) => {
    const WIDTH = newImage.bitmap.width;
    const HEIGHT = newImage.bitmap.height;
    for (let u = 0; u < WIDTH; u++) {
      for (let v = 0; v < HEIGHT; v++) {
        const y = getY(T, u, v);
        const x = getX(T, u, v, y);
        // console.log(u, ((T[0] * u) + (T[1] * v) + T[2]) / ((T[6] * u) + (T[7] * v) + 1));
        const color = image.getPixelColor(parseInt(x, 10), parseInt(y, 10)); // eslint-disable-line no-underscore-dangle
        newImage.setPixelColor(color, u, v);
      }
    }
  });

  return newImage;
}

function getY(T, u, v) {
  const a = T._data[0]; // eslint-disable-line no-underscore-dangle
  const b = T._data[1]; // eslint-disable-line no-underscore-dangle
  const c = T._data[2]; // eslint-disable-line no-underscore-dangle
  const d = T._data[3]; // eslint-disable-line no-underscore-dangle
  const e = T._data[4]; // eslint-disable-line no-underscore-dangle
  const f = T._data[5]; // eslint-disable-line no-underscore-dangle
  const g = T._data[6]; // eslint-disable-line no-underscore-dangle
  const h = T._data[7]; // eslint-disable-line no-underscore-dangle
  // eslint-disable-next-line no-mixed-operators
  return (a * f - a * v - c * d + c * g * v + d * u - f * g * u) / (-a * e + a * h * v + b * d - b * g * v - d * h * u + e * g * u);
}

function getX(T, u, v, y) {
  const d = T._data[3]; // eslint-disable-line no-underscore-dangle
  const e = T._data[4]; // eslint-disable-line no-underscore-dangle
  const f = T._data[5]; // eslint-disable-line no-underscore-dangle
  const g = T._data[6]; // eslint-disable-line no-underscore-dangle
  const h = T._data[7]; // eslint-disable-line no-underscore-dangle
  // eslint-disable-next-line no-mixed-operators
  return (-e * y - f + v * h * y + v) / (d - g * v);
}

function computeT(initial, final) {
  const array = [];
  for (let i = 0; i < initial.length; i++) {
    array.push(getFirstRow(initial[i], final[i]));
    array.push(getSecondRow(initial[i], final[i]));
  }
  const T = math.matrix(array);
  const Tinv = math.inv(T);
  const V = makeVector(final);

  const result = math.multiply(Tinv, V);
  return result;
}

function getTransformation(points, image) {
  const coor = Math.floor(Math.min(image.bitmap.width / 2, image.bitmap.height / 2));
  const initialPoints = points;
  const finalPoints = [
    [coor, 0],
    [coor, coor * 2],
    [0, coor],
    [coor * 2, coor],
  ];
  // return computeBestFitTransformation(initialPoints, finalPoints);
  return computeT(initialPoints, finalPoints);
}

function getFirstRow(X, U) {
  return [X[0], X[1], 1, 0, 0, 0, -X[0] * U[0], X[1] * U[0]];
}

function getSecondRow(X, U) {
  return [0, 0, 0, X[0], X[1], 1, -X[0] * U[1], X[1] * U[1]];
}

function makeVector(final) {
  const V = [];
  for (let j = 0; j < final.length; j++) {
    for (let i = 0; i < 2; i++) {
      V.push(final[j][i]);
    }
  }
  return V;
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
