const Jimp = require('jimp');
const BFS = require('./BFS');
const colors = require('./colors');
const Point = require('./point');
const Cluster = require('./clusters');
const cropper = require('./cropper');


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


function getByClusters(image, color, threshold, cluster_colors, image_name) {
  const n = cluster_colors.length;
  image = getByColor(image, color, threshold, image_name);
  const segments = BFS.findSegments(image, colors.BLACK);
  const clusters = getClusters(segments, n);
  image = paintClusters(image, clusters, cluster_colors);
  return image;
}

exports.getByClusters = getByClusters;

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


function normalizeDistance(distance, threshold) {
  for (let i = 0; i < distance.length; i++) {
    for (let j = 0; j < distance[i].length; j++) {
      distance[i][j] = distance[i][j] > threshold ? colors.WHITE : colors.BLACK;
    }
  }
  return distance;
}

exports.getBlackHandles = function (image, threshold, image_name) {
  const BLACK = [25, 29, 28];
  image = BFS.paintHoles(image, colors.BLACK, colors.WHITE, 300);
  const cluster_colors = [colors.WHITE, colors.YELLOW, colors.BLUE, colors.PURPLE];
  const n = cluster_colors.length;
  image = getByColor(image, BLACK, threshold, image_name);
  image = BFS.paintHoles(image, colors.WHITE, colors.BLACK, 500);
  const segments = BFS.findSegments(image, colors.BLACK);
  const clusters = getClusters(segments, n);
  cluster_colors[2] = clusters[2].length === 1 ? cluster_colors[3] : cluster_colors[1];
  image = paintClusters(image, clusters, cluster_colors);
  // TODO: REFACTOR
  removeBigOne(image, image_name);
  removeOutliers(image, image_name, colors.YELLOW, 2);
  removeTooBigBoundingBox(image, image_name, colors.PURPLE, 2);

  return image;
};

function removeBigOne(image) {
  const segments = BFS.findSegments(image, colors.YELLOW);

  segments.sort((a, b) => {
    return a.length - b.length;
  });

  for (let i = 12; i < segments.length; i++) {
    BFS.paintSegment(image, segments[i], colors.WHITE);
  }
}

function removeTooBigBoundingBox(image, image_name, color, times) {
  const segments = BFS.findSegments(image, color);
  const dimensions = [];

  segments.sort((a, b) => {
    return a.length - b.length;
  });

  for (let i = 0; i < segments.length; i++) {
    const img = image.clone();
    BFS.paintSegment(img, segments[i], colors.RED);
    const dim = cropper.getBoundingBox(img, colors.RED);
    dimensions.push(({
      i,
      size: dim[2] * dim[3],
    }));
  }
  dimensions.sort((a, b) => {
    return b.size - a.size;
  });
  const size = image.bitmap.width * image.bitmap.height;
  if (dimensions.length > 1 && times * dimensions[0].size > size) {
    BFS.paintSegment(image, segments[dimensions[0].i], colors.WHITE);
  }
}

function removeOutliers(image, image_name, color, times) {
  const segments = BFS.findSegments(image, color);
  const dimensions = [];

  segments.sort((a, b) => {
    return a.length - b.length;
  });

  for (let i = 0; i < segments.length; i++) {
    const img = image.clone();
    BFS.paintSegment(img, segments[i], colors.RED);
    const dim = cropper.getBoundingBox(img, colors.RED);
    dimensions.push(({
      i,
      size: dim[2] * dim[3],
    }));
  }
  dimensions.sort((a, b) => {
    return b.size - a.size;
  });
  if (dimensions.length > 1 && times * dimensions[1].size < dimensions[0].size) {
    BFS.paintSegment(image, segments[dimensions[0].i], colors.WHITE);
  }
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

function getColorClusters(image, distance, n) {
  const clusters = [];
  let done = false;
  while (!done) {
    let size = 0;
    const array = [];
    for (let i = 0; i < distance.length; i++) {
      for (let j = 0; j < distance[i].length; j++) {
        if (distance[i][j]) {
          size++;
          array.push(distance[i][j]);
        }
      }
    }
    const partitions = Cluster.get(array, n);
    for (let k = 0; k < partitions.length; k++) {
      const s = partitions[k][0];
      const f = partitions[k][1];
      const cluster = [];
      for (let i = 0; i < distance.length; i++) {
        for (let j = 0; j < distance[i].length; j++) {
          const d = distance[i][j];
          if (d && s <= d && d <= f) {
            cluster.push({
              i,
              j,
            });
          }
        }
        clusters[k] = [cluster];
      }
    }

    let retry = false;
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i][0];
      if (cluster.length < 3000) {
        retry = true;
        for (let i = 0; i < cluster.length; i++) {
          BFS.paintSegment(image, cluster, colors.WHITE);
          const a = cluster[i].i;
          const b = cluster[i].j;
          distance[a][b] = null;
        }
      }
    }
    done = !retry;
  }
  return clusters;
}

function getLargestCluster(clusters) {
  let max = -1;
  let maxIndex = -1;
  for (let i = 0; i < clusters.length; i++) {
    let size = 0;
    const segments = clusters[i];
    for (let j = 0; j < segments.length; j++) {
      size += segments[j].length;
    }
    if (size > max) {
      max = size;
      maxIndex = i;
    }
  }

  return maxIndex;
}


exports.colorClusters = function (image, color, cluster_colors) {
  const n = cluster_colors.length;
  const distance = getDistanceAllPixels(image, color); // calculate the distance as space point from all pixels to the given color
  const clusters = getColorClusters(image, distance, n);
  const index = getLargestCluster(clusters);
  // for (let i = 0; i < cluster_colors.length; i++) {
  //   cluster_colors[i] = colors.WHITE;
  // }
  // cluster_colors[index] = colors.BLACK;
  image = paintClusters(image, clusters, cluster_colors);
  // image = BFS.paintWhiteHoles(image, 10);
  return image;
};
