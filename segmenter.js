const Jimp = require('jimp');
const BFS = require('./BFS');
const colors = require('./colors');
const Point = require('./point');
const Cluster = require('./clusters');
const math = require('mathjs');


function getByColor(image, color, threshold, image_name) {
  console.log('---', `${image_name}: computing...`);
  let distance = getDistanceAllPixels(image, color); // calculate the distance as space point from all pixels to the given color
  distance = normalizeDistance(distance, threshold); // make all distances to be between 0 and 255
  image = recolor(image, distance); // what is considered to be the color becames black, all the rest are white.
  image = BFS.paintWhiteHoles(image); // small holes in between are painted black for a less noisy image
  console.log('---', `${image_name}: selected of color ${color}.`);
  return image;
}

exports.getByColor = getByColor;

exports.getLargestByColor = function (image, color, threshold, image_name) {
  image = getByColor(image, color, threshold, image_name);
  image = BFS.removeSmallPieces(image, colors.BLACK); // Remove all the black areas except the largest one border
  return image;
};


exports.getByClusters = function (image, color, threshold, cluster_colors, image_name) {
  const n = cluster_colors.length;
  image = getByColor(image, color, threshold, image_name);
  const segments = BFS.findSegments(image, colors.BLACK);
  const clusters = getClusters(segments, n);
  image = paintClusters(image, clusters, cluster_colors);
  return image;
};

function paintClusters(image, clusters, clusters_colors) {
  for (let i = 0; i < clusters.length; i++) {
    const segments = clusters[i];
    for (let j = 0; j < segments.length; j++) {
      BFS.paintSegment(image, segments[j], clusters_colors[i]);
    }
  }
  return image;
}

function getClusters(segments, n) {
  const array = [];
  for (let i = 0; i < segments.length; i++) {
    array.push(segments[i].length);
  }
  const partitions = Cluster.get(array, n);
  const clusters = [];


  for (let i = 0; i < partitions.length; i++) {
    const s = partitions[i][0];
    const f = partitions[i][1];
    clusters[i] = [];
    for (let j = 0; j < segments.length; j++) {
      const l = segments[j].length;
      if (s <= l && l <= f) {
        clusters[i].push(segments[j]);
      }
    }
  }

  return clusters;
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


function getThreshold(distance, times) {
  const arr = [];
  for (let i = 0; i < distance.length; i++) {
    for (let j = 0; j < distance[i].length; j++) {
      arr.push(distance[i][j]);
    }
  }
  const min = math.min(arr);
  const std = math.std(arr);
  console.log('THRES', 'd', math.min(arr), math.std(arr), math.median(arr), math.mean(arr), math.max(arr));
  return math.median(arr) - (std * times);
}

function normalizeDistance(distance, threshold) {
  // threshold = getThreshold(distance, threshold);
  // console.log(threshold);
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
