const Jimp = require('jimp');
const BFS = require('./BFS');

const WHITE = 4294967295;
const BLACK = 255;

const BROWN = 4294902015;
const RED = 4278190335;
const YELLOW = 16777215;

const BEFORE = 'BEFORE';
const BORDER = 'BORDER';
const WITHIN = 'WITHIN';
// const AFTER = 'AFTER';


exports.getClock = function (image, image_name) {
  const border = getRedBorder(image, image_name);
  const filled = fillClock(border, image_name);

  return filled;
};

function getRedBorder(image, image_name) {
  console.log('---', `${image_name}: save border`);
  const RED = [139, 29, 45];
  let distance = getDistanceAllPixels(image, RED); // calculate the distance as space point from all pixels to a red color
  distance = normalizeDistance(distance); // make all distances to be between 0 and 255
  image = recolor(image, distance);
  // image.write(`./result/${image_name}/border.jpg`);
  console.log('---', `${image_name}: border saved`);
  // image = removeSmallPieces(image, image_name);
  return image;
}


// function getAreaColor(image, _i, _j) {
//   const I = [_i - 1, _i + 1];
//   const J = [_j - 1, _j + 1];
//   let max = RED;
//   for (let i = 0; i < I.length; i++) {
//     const color = image.getPixelColor(I[i], _j);
//     if (color !== WHITE && color !== BLACK && color > max) {
//       console.log('entro');
//       max = color;
//     }
//   }
//   for (let j = 0; j < J.length; j++) {
//     const color = image.getPixelColor(_i, J[j]);
//     if (color !== WHITE && color !== BLACK && color > max) {
//       console.log('entro');
//       max = color;
//     }
//   }
//   return max + 1;
// }
//
// function notifyNeighbours(image, _i, _j, newColor) {
//   const I = [_i - 1, _i, _i + 1];
//   const J = [_j - 1, _j, _j + 1];
//   for (let i = 0; i < I.length; i++) {
//     for (let j = 0; j < J.length; j++) {
//       const color = image.getPixelColor(I[i], J[j]);
//       if (color !== WHITE && color !== BLACK && color < newColor) {
//         image.setPixelColor(newColor, I[i], J[j]);
//         notifyNeighbours(image, i[i], J[j], newColor);
//       }
//     }
//   }
// }

// function divideInAreas(image) {
//   const WIDTH = image.bitmap.width;
//   const HEIGHT = image.bitmap.height;
//   for (let i = 0; i < WIDTH; i++) {
//     for (let j = 0; j < HEIGHT; j++) {
//       const color = image.getPixelColor(i, j);
//       const isWhite = color === WHITE;
//       if (!isWhite) {
//         const newColor = getAreaColor(image, i, j);
//         image.setPixelColor(newColor, i, j);
//         // notifyNeighbours(image, i, j, newColor);
//       }
//     }
//   }
//   return image;
// }

// function removeSmallPieces(image, image_name) {
//   console.log('------', `${image_name}: save areas`);
//   const areas = divideInAreas(image);
//   // const oneArea = getBiggestArea(areas);
//   areas.write(`./result/${image_name}/areas.jpg`);
//   console.log('------', `${image_name}: areas saved`);
//   return areas;
// }


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
      distance[i][j] = distance[i][j] > threshold ? WHITE : BLACK;
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

function inBefore(color, line, i, j) {
  if (color === BLACK) {
    line.status = BORDER;
    const p = {};
    p.start = j;
    p.finish = j;
    line.points.push(p);
  }
}

function inBorder(color, line, i, j) {
  if (color === BLACK) {
    const p = getLastPoint(line);
    p.finish = j;
  } else {
    line.status = BEFORE;
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
      status: BEFORE,
      points: [],
    };
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      if (line.status === BEFORE) {
        inBefore(color, line, i, j);
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
        image.setPixelColor(RED, i, k);
      }
      for (let k = borders.finish; k < HEIGHT; k++) {
        // image.setPixelColor(WHITE, i, k);
      }
    }
  }
  return image;
}


function fillClock(image, image_name) {
  // image = paintHoles(image);
  console.log('------', `${image_name}: save filled`);
  const filled = paintLines(image);
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
