const colors = require('./colors');
const Point = require('./point');
const Mass = require('./mass');
const cropper = require('./cropper');
const math = require('mathjs');


exports.find = function (image, image_name) {
  console.log(image_name, ':', 'searching center');
  const params = findDiameter(image);
  let timeBlocks = orderTimeBlocks(params.timeBlocks, params.center, image, image_name);
  const orphanIndex = removeOneIfOdd(timeBlocks);
  const diameters = getAllDiameters(timeBlocks, orphanIndex);
  const center = getCenter(diameters, image);
  addOrphan(timeBlocks, center, orphanIndex);
  image.setPixelColor(colors.FULLRED, center[0], center[1]);
  timeBlocks = parseTimeBlocks(timeBlocks);
  return {
    timeBlocks,
    center,
  };
};

function parseTimeBlocks(timeBlocks) {
  const array = [];
  for (let i = 0; i < timeBlocks.length; i++) {
    array.push({
      pos: timeBlocks[i].massCenter,
    });
  }
  return array;
}


function printTimeBlock(timeBlock, path, im, color) {
  im.setPixelColor(color, timeBlock.pos[0] + 1, timeBlock.pos[1]);
  im.setPixelColor(color, timeBlock.pos[0] - 1, timeBlock.pos[1]);
  im.setPixelColor(color, timeBlock.pos[0], timeBlock.pos[1]);
  im.write(path);
}

exports.print = printTimeBlock;

function addOrphan(timeBlocks, center, orphanIndex) {
  if (!orphanIndex) {
    return;
  }
  const orphanBlock = timeBlocks[orphanIndex];
  const diameter = Point.getVector(orphanBlock.massCenter, center);
  diameter[0] *= 2;
  diameter[1] *= 2;
  const final = Point.vectorEndPoint(diameter);
  if (orphanIndex >= 6) {
    orphanIndex -= 5;
  } else {
    orphanIndex += 6;
  }
  timeBlocks.splice(orphanIndex, 0, {
    massCenter: final,
  });
}


function getCenter(diameters) {
  const center = [0, 0];
  let n = 0;
  for (let i = 0; i < diameters.length; i++) {
    const line1 = diameters[i];
    for (let j = 0; j < diameters.length; j++) {
      if (i !== j) {
        n++;
        const line2 = diameters[j];
        const mid = math.intersect(line1.p1, line1.p2, line2.p1, line2.p2);
        center[0] += mid[0];
        center[1] += mid[1];
      }
    }
  }
  center[0] /= (n);
  center[1] /= (n);
  return center;
}

function removeOneIfOdd(timeBlocks) {
  if (timeBlocks.length === 12) {
    return;
  }
  const i = biggestAngleChange(timeBlocks);
  let index = ((i + 1) - 6) % timeBlocks.length;
  if (index < 0) {
    index += timeBlocks.length;
  }

  // const orphan = timeBlocks.slice(index, index + 1)[0];
  // timeBlocks.splice(index, 1);
  timeBlocks[index].orphan = true;
  return index;
}

function getAllDiameters(timeBlocks, orphanIndex) {
  const array = timeBlocks.slice(0, timeBlocks.length);
  if (orphanIndex !== undefined) {
    array.splice(orphanIndex, 1);
  }
  const offset = array.length / 2;
  const diameters = [];
  for (let i = 0; i < array.length / 2; i++) {
    const p1 = array[i].massCenter;
    const p2 = array[(i + offset)].massCenter;
    diameters.push({
      p1,
      p2,
    });
  }
  return diameters;
}

function biggestAngleChange(timeBlocks) {
  let maxDiff = -1;
  let start = -1;
  for (let i = 0; i < timeBlocks.length; i++) {
    let difference = timeBlocks[(i + 1) % timeBlocks.length].angle - timeBlocks[i].angle;
    if (i === timeBlocks.length - 1) {
      difference = ((2 * Math.PI) - timeBlocks[i].angle) - timeBlocks[(i + 1) % timeBlocks.length].angle;
    }
    if (maxDiff < difference) {
      maxDiff = difference;
      start = i;
    }
  }
  return start;
}

function orderTimeBlocks(timeBlocks, center) {
  const referenceVector = Point.getVector(center, timeBlocks[0].massCenter);
  for (let i = 0; i < timeBlocks.length; i++) {
    const p = timeBlocks[i].massCenter;
    const vectorI = Point.getVector(center, p);
    timeBlocks[i].angle = Point.getAngle(referenceVector, vectorI);
  }
  timeBlocks.sort((a, b) => {
    return a.angle - b.angle;
  });
  return timeBlocks;
}

function findDiameter(image) {
  const timeBlocks = Mass.center(image, colors.YELLOW);
  timeBlocksToPoints(image, timeBlocks);
  const diameters = getOpositeSide(timeBlocks);
  const center = averageDiameter(diameters);
  return {
    timeBlocks,
    center,
  };
}

function averageDiameter(diameters) {
  const center = [0, 0];
  for (let i = 0; i < diameters.length; i++) {
    const diameter = diameters[i];
    const c = Point.midPoint(diameter.p1, diameter.p2);
    center[0] += c[0];
    center[1] += c[1];
  }
  center[0] /= diameters.length;
  center[1] /= diameters.length;
  return center;
}

function timeBlocksToPoints(image, timeBlocks) {
  cropper.colorWithFilter(image, image, colors.WHITE, colors.YELLOW);
  for (let i = 0; i < timeBlocks.length; i++) {
    image.setPixelColor(colors.BLACK, timeBlocks[i].massCenter[0], timeBlocks[i].massCenter[1]);
  }
  return image;
}


function paintDiameter(image, p1, p2, mainColor, centerColor) {
  const diameter = Point.paintLineBetween(image, mainColor, p1, p2);
  const center = Point.midPoint(p1, p2);
  image.setPixelColor(centerColor, center[0], center[1]);
  image.setPixelColor(centerColor, p1[0], p1[1]);
  image.setPixelColor(centerColor, p2[0], p2[1]);
  diameter.center = center;
  return diameter;
}


function getFurtherAway(timeBlocks) {
  for (let i = 0; i < timeBlocks.length; i++) {
    const start = timeBlocks[i];
    let maxDistance = -1;
    for (let j = 0; j < timeBlocks.length; j++) {
      const end = timeBlocks[j];
      const distance = Point.distance(start.massCenter, end.massCenter);
      if (distance > maxDistance) {
        maxDistance = distance;
        start.opposite = end;
      }
    }
  }
}

function getOpositeSide(timeBlocks) {
  const opposites = [];
  getFurtherAway(timeBlocks);

  for (let i = 0; i < timeBlocks.length; i++) {
    if (timeBlocks[i] === timeBlocks[i].opposite.opposite) {
      opposites.push({
        p1: timeBlocks[i].massCenter,
        p2: timeBlocks[i].opposite.massCenter,
      });
    }
  }
  return opposites;
}
