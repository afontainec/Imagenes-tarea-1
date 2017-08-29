const colors = require('./colors');
const Point = require('./point');
const Mass = require('./mass');
const Angle = require('./angle');


exports.getAsVectors = function (image, center, image_name) {
  // const handles = getHandles(image, image_name);
  // divide(image, center);
  getHandles(image, center, image_name);
  // const vector = getHourAndMin(image, center);
  // image.write(`./result/${image_name}/handle.jpg`);
  // return vector;
};


function getHandles(image, center, image_name) {
  // const im = image.clone();
  const maxRadius = Math.max(center[0], center[1]);
  const handles = getPolarCoordinates(image, maxRadius, center);
  const minuteHandle = toStandardForm(handles.minutes, center, image);
  const hourHandle = toStandardForm(handles.hour, center, image);
  Point.drawVector(image, colors.YELLOW, hourHandle);
  Point.drawVector(image, colors.GREEN, minuteHandle);
  image.write(`./result/${image_name}/handle.jpg`);
}

function toStandardForm(handle, center, image) {
  const radius = handle[2];
  const a = handle[0];
  const p = [(radius * Math.cos(Angle.toRad(a))) + center[0], (radius * Math.sin(Angle.toRad(a))) + center[1]];
  const averagePoint = getAverageY(p, image);
  return Point.getVector(averagePoint, center);
}

function getAverageY(p, image) {
  const p1 = getMaxY(p, image);
  const p2 = getMinY(p, image);
  const averageY = (p1[1] + p2[1]) / 2;
  return [p[0], averageY];
}

function getMaxY(p, image) {
  let inPurple = true;
  const endPoint = p.slice(0, 2);
  while (inPurple) {
    endPoint[1]--;
    const color = image.getPixelColor(endPoint[0], endPoint[1]);
    if (color !== colors.PURPLE) {
      inPurple = false;
      break;
    }
  }
  return endPoint;
}

function getMinY(p, image) {
  let inPurple = true;
  const endPoint = p.slice(0, 2);
  while (inPurple) {
    endPoint[1]++;
    const color = image.getPixelColor(endPoint[0], endPoint[1]);
    if (color !== colors.PURPLE) {
      inPurple = false;
      break;
    }
  }
  return endPoint;
}

// function getMaxY(handle, center) {
//   // en el caso de que de la vuelta
//   if (handle[0] > handle[1]) {
//     handle[1] += 360;
//   }
//   const radius = handle[2];
//   let maxY = -1;
//   let maxX = -1;
//   for (let a = handle[0]; a < handle[1]; a++) {
//     const y = (radius * Math.sin(Angle.toRad(a))) + center[1];
//     if (y > maxY) {
//       maxY = y;
//       maxX = (radius * Math.cos(Angle.toRad(a))) + center[0];
//     }
//     return [maxX, maxY];
//   }
// }

function getPolarCoordinates(image, maxRadius, center) {
  let minutesHandle;
  let bothHandles;
  /* Iteramos desde el perimetro de un circulo muy grande hasta uno muy chico*/
  for (let radius = maxRadius; radius > 0; radius--) {
    const histogram = getHistogram(image, radius, center);
    const clusters = getClusters(histogram, radius);
    // Si solo hubo una parte morada coltigua hemos pillado al minutero por primera vez
    if (clusters.length === 1) {
      minutesHandle = clusters;
      radius /= 2;
    }
    // Si hubo dos partes moradas contiguas, hemos pillado al minutero y al palito de la hora
    if (clusters.length === 2) {
      bothHandles = clusters;
      // Identificados cual corresponde a la hora, y cual al minutero
      return identifyHandles(bothHandles, minutesHandle);
    }
  }
}

// Las identificamos analizando cual es más parecida a munutesHandle
function identifyHandles(bothHandles, minutesHandle) {
  const distance1 = Math.abs(bothHandles[0][0] - minutesHandle[0][0]);
  const distance2 = Math.abs(bothHandles[1][0] - minutesHandle[0][0]);
  if (distance1 < distance2) {
    return {
      hour: bothHandles[1],
      minutes: bothHandles[0],
    };
  }
  return {
    hour: bothHandles[0],
    minutes: bothHandles[1],
  };
}


function getHistogram(image, radius, center) {
  const histogram = [];
  for (let a = 0; a < 360; a++) {
    histogram.push(isPurple(image, radius, a, center));
  }
  return histogram;
}

function isPurple(image, radius, a, center) {
  const x = (radius * Math.cos(Angle.toRad(a))) + center[0];
  const y = (radius * Math.sin(Angle.toRad(a))) + center[1];
  const color = image.getPixelColor(x, y);
  const isPurple = color === colors.PURPLE;
  return isPurple;
}

function drawCircle(image, radius, center, color) {
  for (let a = 0; a < 360; a++) {
    const x = (radius * Math.cos(Angle.toRad(a))) + center[0];
    const y = (radius * Math.sin(Angle.toRad(a))) + center[1];
    image.setPixelColor(color, x, y);

    if (a === 344) {
      image.setPixelColor(colors.YELLOW, x, y);
    }
  }
}

function getClusters(histogram, radius) {
  let inCluster = false;
  let n = -1;
  const clusters = [];
  for (let i = 0; i < histogram.length; i++) {
    if (inCluster && !histogram[i]) {
      clusters[n].push(i);
      clusters[n].push(radius);
      inCluster = false;
    }
    if (!inCluster && histogram[i]) {
      inCluster = true;
      n++;
      clusters[n] = [i];
    }
  }
  if (n > 0 && clusters[n].length === 1) {
    clusters[0][0] = clusters[n][0];
    clusters.splice(n, 1);
  }
  return clusters;
}

function getHourAndMin(image, center) {
  const n = 12;
  const j = 6;
  const points = [];
  let inPurple = false;
  let inCyan = false;
  let inWhite = false;
  let found = -1;
  const coord = [];
  let c = 0;
  for (let i = 0; i < image.bitmap.height; i++) {
    const color = image.getPixelColor((j * center[0]) / n, i);
    switch (color) {
    case colors.PURPLE:
      if (!inCyan && !inPurple) {
        found++;

        coord[found] = 0;
        inPurple = true;
      }
      break;
    case colors.CYAN:
      inCyan = true;
      break;
    case colors.WHITE:
      if (inPurple) {
          // do something
      }
      inPurple = false;
      inCyan = false;
      inWhite = true;
      break;
    default:
      break;
    }
    if (inPurple) {
      coord[found] += i;
      c++;
    }
  }
  const p = [(j * center[0]) / n, coord[found] / c];
  const vector = Point.getVector(p, center);
  Point.paintLineBetween(image, colors.YELLOW, p, center);
  return vector;
}
