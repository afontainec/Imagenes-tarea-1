const Jimp = require('jimp');
const BFS = require('./BFS');
const colors = require('./colors');
const cropper = require('./cropper');

const BACKGROUND = 'BACKGROUND';
const BORDER = 'BORDER';
// const AFTER = 'AFTER';


exports.getClock = function (image, image_name) {
  const border = getRedBorder(image, image_name);  // return binary image with only the red border
  const innerClock = fillClock(image, border, image_name);   // return binary image with the inside of the clock (the clock without border)
  return innerClock;
};

function getRedBorder(original, image_name) {
  let image = original.clone();
  console.log('---', `${image_name}: computing border...`);
  const RED = [139, 29, 45];
  let distance = getDistanceAllPixels(image, RED); // calculate the distance as space point from all pixels to a red color
  distance = normalizeDistance(distance); // make all distances to be between 0 and 255
  image = recolor(image, distance);  // what is considered red becames black, all the rest is white
  console.log('---', `${image_name}: border detected, cleaning it up`);
  image = BFS.paintWhiteHoles(image); // small holes in between are painted black for a more solid clock
  console.log('---', `${image_name}: cleaned. Removing unwanted segments...`);
  image = BFS.removeSmallPieces(image, colors.BLACK);  // Remove all the black areas except the clock's border
  console.log('---', `${image_name}: Ok. crop image...`);
  const dimensions = cropper.cropSegment(image, colors.BLACK); // Crop image. only appear the clock
  original.crop(dimensions[0], dimensions[1], dimensions[2], dimensions[3]);
  image.crop(dimensions[0], dimensions[1], dimensions[2], dimensions[3]);

  console.log('---', `${image_name}: Ok.`);

  original.write(`./result/${image_name}/border.jpg`);  // on this path an image is saved showing the advance
  console.log('---', `${image_name}: border saved`);
  return image;
}


function recolor(image, distance) {
  for (let i = 0; i < distance.length; i++) {
    for (let j = 0; j < distance[i].length; j++) {
      const color = distance[i][j];
      image.setPixelColor(color, i, j);
    }
  }
  return image;
}

function normalizeDistance(distance) {
  const threshold = 60;
  for (let i = 0; i < distance.length; i++) {
    for (let j = 0; j < distance[i].length; j++) {
      distance[i][j] = distance[i][j] > threshold ? colors.WHITE : colors.BLACK;
    }
  }
  return distance;
}


function getDistanceAllPixels(image, ref) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  const distance = [];
  for (let i = 0; i < WIDTH; i++) {
    distance[i] = [];
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      const rgba = Jimp.intToRGBA(color);
      const v = [rgba.r, rgba.g, rgba.b];
      distance[i][j] = pointDistance(v, ref);
    }
  }
  return distance;
}

function inBackground(color, line, i, j) {
  if (color === colors.BLACK) { // if its in the background and finds a black one, it has entered a border area
    line.status = BORDER;
    const p = {};
    p.start = j;
    p.finish = j;
    line.points.push(p);
  }
}

function inBorder(color, line, i, j) {
  if (color === colors.BLACK) { // if its in the border and finds a black one, update the finish point of that border
    const p = getLastPoint(line);
    p.finish = j;
  } else { // if its in the border and finds a white one, it has entered a background area
    line.status = BACKGROUND;
  }
}

function getLastPoint(line) {
  if (line.points.length === 0) {
    line.points.push({});
  }
  return line.points[line.points.length - 1];
}

function getInnerBorders(line, HEIGHT) {
  if (line.points.length === 2) { // This is the most common case. Where we have no noise whithin the border
    return {
      start: line.points[0].finish,
      finish: line.points[1].start,
    };
  } else if (line.points.length < 2) {  // Edge case, on the line the ir only one border. Furthermost right and left part.
    return {
      start: HEIGHT,
      finish: HEIGHT,
    };
  }
  return longestBackgroudLine(line);
}

function longestBackgroudLine(line) {
  const distances = [];
  for (let i = 0; i < line.points.length - 1; i++) {
    const p = {
      start: line.points[i].finish,
      finish: line.points[i + 1].start,
    };
    p.distance = p.finish - p.start;
    distances.push(p);
  }
  distances.sort((a, b) => {
    return b.distance - a.distance;
  });
  return distances[0];
}
/* In this algorithm there are two diferent types of area: BACKGROUND, where its white, and BORDER, where it is black*/
function paintLines(image) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  for (let i = 0; i < WIDTH; i++) {
    const line = {
      status: BACKGROUND,    // status is binary, its in the backgroud (WHITE AREA) or in the border (BLACK AREA)
      points: [],           // points will register all the starting and finish pixels of a border.
    };
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      if (line.status === BACKGROUND) {
        inBackground(color, line, i, j);
      } else {
        inBorder(color, line, i, j);
      }
    }
    const borders = getInnerBorders(line, HEIGHT); // Get the border of the inner clock. This is without the red border.
    image = repaintLine(image, i, borders, HEIGHT); // paints the inner part of the clock only
  }
  return image;
}

function repaintLine(image, i, borders, HEIGHT) {
  if (borders) {
    for (let k = 0; k < borders.start; k++) {
      image.setPixelColor(colors.WHITE, i, k);
    }
    for (let k = borders.start; k < borders.finish; k++) {
      image.setPixelColor(colors.BLACK, i, k);
    }
    for (let k = borders.finish; k < HEIGHT; k++) {
      image.setPixelColor(colors.WHITE, i, k);
    }
  }
  return image;
}


function fillClock(original, image, image_name) {
  console.log('------', `${image_name}: getting innerClock...`);
  image = paintLines(image); // It goes for every line (horizontal) and paint the inner part of the clock
  console.log('------', `${image_name}: innerClock segmented. Removing unwanted noise...`);
  image = BFS.removeSmallPieces(image, colors.BLACK);  // Remove noise
  console.log('------', `${image_name}: noise removed. Cropping image...`);
  const dim = cropper.cropSegment(image, colors.BLACK); // Crop image
  original.crop(dim[0], dim[1], dim[2], dim[3]);
  image.crop(dim[0], dim[1], dim[2], dim[3]);

  console.log('------', `${image_name}: imaged Cropped.`);
  original.write(`./result/${image_name}/innerClock.jpg`);
  console.log('------', `${image_name}: innerClock saved.`);
  return image;
}


function pointDistance(p1, p2) {
  let dist = 0;
  for (let i = 0; i < 3; i++) {
    dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
  }
  return Math.sqrt(dist);
}
