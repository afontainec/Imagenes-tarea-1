const Jimp = require('jimp');
const BFS = require('./BFS');
const colors = require('./colors');

const BACKGROUND = 'BACKGROUND';
const BORDER = 'BORDER';
// const AFTER = 'AFTER';


exports.getClock = function (image, image_name) {
  const border = getRedBorder(image, image_name);  // return binary image with only the red border
  const filled = fillClock(border, image_name);   // return binary image with the inside of the clock (the clock without border)

  return filled;
};

function getRedBorder(image, image_name) {
  console.log('---', `${image_name}: save border`);
  const RED = [139, 29, 45];
  let distance = getDistanceAllPixels(image, RED); // calculate the distance as space point from all pixels to a red color
  distance = normalizeDistance(distance); // make all distances to be between 0 and 255
  image = recolor(image, distance);  // what is considered red becames black, all the rest is white
  image = BFS.paintWhiteHoles(image); // small holes in between are painted black for a more solid clock
  image = BFS.removeSmallPieces(image);  // Remove all the black areas except the clock's border
  image.write(`./result/${image_name}/border.jpg`);  // on this path an image is saved showing the advance
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
  if (color === colors.BLACK) {
    line.status = BORDER;
    const p = {};
    p.start = j;
    p.finish = j;
    line.points.push(p);
  }
}

function inBorder(color, line, i, j) {
  if (color === colors.BLACK) {
    const p = getLastPoint(line);
    p.finish = j;
  } else {
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
  if (line.points.length === 2) {
    return {
      start: line.points[0].finish,
      finish: line.points[1].start,
    };
  } else if (line.points.length < 2) {
    return {
      start: HEIGHT,
      finish: HEIGHT,
    };
  }
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

function paintLines(image) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  for (let i = 0; i < WIDTH; i++) {
    const line = {
      status: BACKGROUND,
      points: [],
    };
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      // status is binary, its in the backgroud (WHITE AREA) or in the border (BLACK AREA)
      if (line.status === BACKGROUND) {
        inBackground(color, line, i, j);
      } else {
        inBorder(color, line, i, j);
      }
    }
    const borders = getInnerBorders(line, HEIGHT);
    if (borders) {
      for (let k = 0; k < borders.start; k++) {
        // image.setPixelColor(WHITE, i, k);
      }
      for (let k = borders.start; k < borders.finish; k++) {
        image.setPixelColor(colors.RED, i, k);
      }
      for (let k = borders.finish; k < HEIGHT; k++) {
        // image.setPixelColor(WHITE, i, k);
      }
    }
  }
  return image;
}


function fillClock(image, image_name) {
  console.log('------', `${image_name}: save filled`);
  const filled = paintLines(image);      // It goes for every line (horizontal) and paint the inner part of the clock
  image.write(`./result/${image_name}/filled.jpg`);
  console.log('------', `${image_name}: filled saved`);
  return filled;
}


function pointDistance(p1, p2) {
  let dist = 0;
  for (let i = 0; i < 3; i++) {
    dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
  }
  return Math.sqrt(dist);
}
