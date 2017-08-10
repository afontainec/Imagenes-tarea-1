const SIZE = 10;
const WHITE = 0;
const GREY = 1;
const BLACK = 2;

function removeSmallPieces(image, segment_color) {
  const WIDTH = image.bitmap.width;
  const HEIGHT = image.bitmap.height;
  const nodes = {};
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      const color = image.getPixelColor(i, j);
      if (removable(color, segment_color, nodes, i, j)) {
        const segment = getSegment(image, i, j, nodes);
      }
    }
  }
}

function removable(c1, sc, nodes, i, j) {
  return c1 === sc && !isIn(nodes, i, j);
}

function isIn(nodes, i, j) {
  if (!(i in nodes)) {
    return false;
  }
  if (!(j in nodes[i])) {
    return false;
  }
  return true;
}


// BFS algorithm to get a segment of size not bigger than SIZE
function getSegment(image, i, j, nodes) {
  const S = []; // set with all nodes of the segment
  const Q = []; // queue
  const source = buildNode(i, j, nodes);
  Q.push(source);
  S.push(source);
  while (Q.length > 0) {
    const neighbours = getNeighbours(image, i, j);
  }
}

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
