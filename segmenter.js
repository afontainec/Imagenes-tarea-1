const Jimp = require('jimp');
const BFS = require('./BFS');
const colors = require('./colors');
const Point = require('./point');


function getByColor(image, color, threshold, image_name) {
  console.log('---', `${image_name}: computing border...`);
  let distance = getDistanceAllPixels(image, color); // calculate the distance as space point from all pixels to the given color
  distance = normalizeDistance(distance, threshold); // make all distances to be between 0 and 255
  image = recolor(image, distance); // what is considered to be the color becames black, all the rest are white.
  console.log('---', `${image_name}: border detected, cleaning it up`);
  image = BFS.paintWhiteHoles(image); // small holes in between are painted black for a less noisy image
  return image;
}

exports.getByColor = getByColor;

exports.getLargestByColor = function (image, color, threshold, image_name) {
  image = getByColor(image, color, threshold, image_name);
  console.log('---', `${image_name}: cleaned. Removing unwanted segments...`);
  image = BFS.removeSmallPieces(image, colors.BLACK); // Remove all the black areas except the largest one border
  console.log('---', `${image_name}: Ok.`);

  return image;
};


exports.getByClusters = function (image, color, threshold, colors, image_name) {
  const n = colors.length;
  image = getByColor(image, color, threshold, image_name);
  const segments = BFS.findSegments(image, colors.BLACK);
  const clusters = getClusters(segments);
  for (let i = 0; i < clusters.length; i++) {
    console.log(clusters[i].length);
  }
  return image;
};

function getClusters(segments) {
  const sorted = segments.sort((a, b) => {
    return a.length - b.length;
  });
  return sorted;
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

function normalizeDistance(distance, threshold) {
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
      distance[i][j] = Point.distance(v, ref);
    }
  }
  return distance;
}

exports.merge = function (image1, image2) {
  const image = image1.clone();
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      const color = image2.getPixelColor(i, j);
      if (color === colors.BLACK) {
        image.setPixelColor(color, i, j);
      }
    }
  }
  return image;
};
