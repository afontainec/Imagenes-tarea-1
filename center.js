const colors = require('./colors');
const Point = require('./point');
const cropper = require('./cropper');
const solve = require('ndarray-linear-solve');
const ndarray = require('ndarray');
const show = require('ndarray-show');
const math = require('mathjs');
const Jimp = require('jimp');

exports.find = function (image, image_name, original) {
  const image_copy = image.clone();
  cropper.colorComplementWithFilter(image_copy, image, colors.RED, colors.BLUE);
  const top = getTop(image_copy, colors.RED);
  const bottom = getBottom(image_copy, colors.RED);
  const left = getLeft(image_copy, colors.RED);
  const right = getRight(image_copy, colors.RED);
  colorCoord(image, image_name, [top, bottom, left, right]);
  const T = getTransformation([top, bottom, left, right], image);
  console.log(T);
  const transformedImage = transform(T, image, image_name);
};

function colorCoord(image, image_name, coord) {
  image.setPixelColor(colors.YELLOW, coord[0][0], coord[0][1]);
  image.setPixelColor(colors.YELLOW, coord[1][0], coord[1][1]);
  image.setPixelColor(colors.YELLOW, coord[2][0], coord[2][1]);
  image.setPixelColor(colors.YELLOW, coord[3][0], coord[3][1]);
  image.write(`./result/${image_name}/with_coordinate_points.jpg`);
}

function transform(T, image, image_name) {
  const m = math.matrix([
    [T.a, T.b, T.c],
    [T.d, T.e, T.f],
    [0, 0, 1],
  ]);
  const minv = math.inv(m);
  const coor = Math.floor(Math.min(image.bitmap.width / 2, image.bitmap.height / 2));
  const newImage = new Jimp(coor * 2, coor * 2, (err, newImage) => {
    const WIDTH = newImage.bitmap.width;
    const HEIGHT = newImage.bitmap.height;
    for (let i = 0; i < WIDTH; i++) {
      for (let j = 0; j < HEIGHT; j++) {
        const V = math.matrix([i, j, 1]);
        const X = math.multiply(minv, V);
        const color = image.getPixelColor(parseInt(X._data[0], 10), parseInt(X._data[1], 10)); // eslint-disable-line no-underscore-dangle
        newImage.setPixelColor(color, i, j);
      }
    }
    newImage.write(`./result/${image_name}/transformed2.jpg`);
  });
}

function computeBestFitTransformation(I, J) {
  const bestTransformation = {};
  const minDistance = 10000000;
  for (let i = 0; i < I.length; i++) {
    const P = I.slice(0); // copy I

    P.splice(i, 1); // remove one point
    const data = [P[0][0], P[0][1], 1,
      P[1][0], P[1][1], 1,
      P[2][0], P[2][1], 1,
    ];
    const Q = J.slice(0);
    Q.splice(i, 1);
    const B1 = ndarray([Q[0][0], Q[1][0], Q[2][0]]);
    const X1 = ndarray(new Float64Array(3));
    let A = ndarray(data, [3, 3], [1, 3]);
    const r1 = solve(X1, A, B1);
    const B2 = ndarray([Q[0][1], Q[1][1], Q[2][1]]);
    const X2 = ndarray(new Float64Array(3));
    A = ndarray(data, [3, 3], [1, 3]);


    const r2 = solve(X2, A, B2);

    const newP = [(X1.data[0] * I[i][0]) + (X1.data[1] * I[i][1]) + X1.data[2], (X2.data[0] * I[i][0]) + (X2.data[1] * I[i][1]) + X2.data[2]];
    const error = Point.distance(newP, J[i]);
    if (error < minDistance) {
      bestTransformation.a = X1.data[0];
      bestTransformation.b = X1.data[1];
      bestTransformation.c = X1.data[2];
      bestTransformation.d = X2.data[0];
      bestTransformation.e = X2.data[1];
      bestTransformation.f = X2.data[2];
    }
  }
  return bestTransformation;
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
  return computeBestFitTransformation(initialPoints, finalPoints);
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
