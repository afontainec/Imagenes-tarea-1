const Jimp = require('jimp');

const WHITE = 4294967295;
const BLACK = 255;
const RED = 4278190335;
const BROWN = 4294902015;
const YELLOW = 16777215;

const BEFORE = 'BEFORE';
const BORDER = 'BORDER';
const WITHIN = 'WITHIN';
const AFTER = 'AFTER';







exports.getClock = function(image, image_name) {
  const border = getRedBorder(image, image_name);
  const filled = fillClock(border, image_name);

  return filled;
};

function getRedBorder(image, image_name) {
  console.log('---', image_name + ': save border');
  const RED = [139, 29, 45];
  distance = getDistanceAllPixels(image, RED); //calculate the distance as space point from all pixels to a red color
  distance = normalizeDistance(distance); // make all distances to be between 0 and 255
  image = recolor(image, distance);
  image.write('./result/' + image_name + '/border.jpg');
  console.log('---', image_name + ': border saved');
  return image;
}


function recolor(image, distance) {
  for (var i = 0; i < distance.length; i++) {
    for (var j = 0; j < distance[i].length; j++) {
      const color = distance[i][j];
      image.setPixelColor(color, i, j);
    }
  }
  return image;
}

function normalizeDistance(distance) {
  const threshold = 60;
  for (var i = 0; i < distance.length; i++) {
    for (var j = 0; j < distance[i].length; j++) {
      distance[i][j] = distance[i][j] > threshold ? WHITE : BLACK;
    }
  }
  return distance;
}


function getDistanceAllPixels(image, ref) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  distance = [];
  for (var i = 0; i < WIDTH; i++) {
    distance[i] = []
    for (var j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      const rgba = Jimp.intToRGBA(color);
      v = [rgba.r, rgba.g, rgba.b];
      distance[i][j] = pointDistance(v, ref);
    }
  }
  return distance;
}

function isInBorder(color, pos, isBlack) {
  if (!pos.inBorder && isBlack) {
    pos.inBorder = true;
    // console.log('in border', pos.inBorder);
  } else if (pos.inBorder) {
    if (!isBlack) {
      pos.inBorder = false;
      pos.isFilling = true;
      // console.log(pos.isFilling);
    }
  }
  return pos.inBorder;
}

function isWithin(color, pos, isBlack) {
  if (pos.isFilling && isBlack) {
    pos.filled = true;
    pos.isFilling = false;
    pos.isInBorder = true;
  }
  return pos.isFilling;
}

function shouldReset(color, pos, isBlack) {
  return false;
}

function whereIsIt(color, pos, isBlack) {
  if (shouldReset(color, pos, isBlack)) {
    return RESET;
  }
  if (isInBorder(color, pos, isBlack)) {
    return BORDER;
  }
  if (isWithin(color, pos, isBlack)) {
    return FILLING;
  }
  return BACKGROUND;
}

function getColor(area) {

  switch (area) {
    case BORDER:
      return RED;
    case FILLING:
      return BLACK;
    case RESET:
      return BLACK;
      break;
    default:
      return WHITE;
  }
}

function fillClock(image, image_name) {
  console.log('------', image_name + ': save filled');
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  for (var i = 0; i < WIDTH; i++) {
    const status = {
      current: BEFORE,
    }
    for (var j = 0; j < HEIGHT; j++) {
      // console.log('---------------', i, j);
      const color = image.getPixelColor(i, j);
      const isBlack = color == BLACK;
      const area = whereIsIt(color, pos, isBlack);
      // console.log(area);
      const newColor = getColor(area);
      if (area == BORDER) {
        // console.log(i, j);
      }
      // console.log(newColor);
      // console.log(pos, isBlack);
      image.setPixelColor(newColor, i, j);
      if (area == RESET) {
        j = -1;
      }
    }
  }
  image.write('./result/' + image_name + '/filled.jpg');
  console.log('------', image_name + ': filled saved');
  return image;
}


function pointDistance(p1, p2) {
  let dist = 0;
  for (var i = 0; i < 3; i++) {
    dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
  }
  return Math.sqrt(dist);

}
