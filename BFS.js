const colors = require('./colors');

const WHITE = 0;
const GREY = 1;
const BLACK = 2;


exports.removeSmallPieces = function (image) {
  const segments = findSegments(image, colors.BLACK, colors.WHITE, 2000);
};

// paint all the holes of a size smaller than HOLE_SIZE
exports.paintWhiteHoles = function (image) {
  return findAndPaint(image, colors.WHITE, colors.BLACK, 30);
};

/* Divides the pictures in connected areas who have the color segment_color. */
function findAndPaint(image, segment_color, new_color, SIZE) {
  const segments = findSegments(image, segment_color);
  // paint them to the new color
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (segment.length < SIZE) {
      paintSegment(image, segment, new_color);
    }
  }
  return image;
}

function findSegments(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  const nodes = {};
  const segments = [];
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      // create a segment only if the node is removable. This means its color is segment_color and it does not belong to another segment
      if (removable(color, segment_color, nodes, i, j)) {
        segments.push(getSegment(image, i, j, nodes));
      }
    }
  }
  return segments;
}

function paintSegment(image, segment, color) {
  for (let i = 0; i < segment.length; i++) {
    image.setPixelColor(color, segment[i].i, segment[i].j);
  }
}

function removable(c1, sc, nodes, i, j) {
  return c1 === sc && !isIn(nodes, i, j);
}

// checks if nodes[i][j] is defined
function isIn(nodes, i, j) {
  if (!(i in nodes)) {
    return false;
  }
  if (!(j in nodes[i])) {
    return false;
  }
  return true;
}


// BFS algorithm to get a segment
function getSegment(image, i, j, nodes) {
  const S = []; // set with all nodes of the segment
  const Q = []; // queue
  const source = buildNode(i, j, nodes);
  Q.push(source);
  S.push(source);
  while (Q.length > 0) {
    const u = Q.shift();
    const neighbours = getNeighbours(image, u.i, u.j);
    for (let k = 0; k < neighbours.length; k++) {
      const v = getNode(nodes, neighbours[k][0], neighbours[k][1]);
      if (v.color === WHITE) { // NOTE: this color is used to see if the node has been visited. It has nothing to do with the pixel color
        v.color = GREY;
        Q.push(v);
        S.push(v);
      }
    }
    u.color = BLACK;
  }
  return S;
}

// return neighbours (UP, DOWN, RIGHT and LEFT) that have the same color
function getNeighbours(image, i, j) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  const color = image.getPixelColor(i, j);
  const n = [];
  if (i < WIDTH - 1 && color === image.getPixelColor(i + 1, j)) {
    n.push([i + 1, j]);
  }
  if (j < HEIGHT - 1 && color === image.getPixelColor(i, j + 1)) {
    n.push([i, j + 1]);
  }
  if (j > 0 && color === image.getPixelColor(i, j - 1)) {
    n.push([i, j - 1]);
  }
  if (i > 0 && color === image.getPixelColor(i - 1, j)) {
    n.push([i - 1, j]);
  }
  return n;
}


// retrive the node[i][j]. If it does not exists it creates it
function getNode(nodes, i, j) {
  if (isIn(nodes, i, j)) {
    return nodes[i][j];
  }
  return buildNode(i, j, nodes);
}

// builds new node
function buildNode(i, j, nodes) {
  if (!(i in nodes)) {
    nodes[i] = {};
  }
  if (!(j in nodes[i])) {
    nodes[i][j] = {
      i,
      j,
      color: WHITE,
    };
    return nodes[i][j];
  }
  console.log('ERROR', nodes);
  console.log(i, j);
  return null;
}
