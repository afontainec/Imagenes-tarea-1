const Point = require('./point');
const colors = require('./colors');
const TimeBlock = require('./center');
const Angle = require('./angle');

exports.readHour = function (image, image_name, handle, points) {
  const center = points.center;
  let comparisonLine = Point.getVector([0, center[1]], center);
  let timeBlocks = innerAngleToLine(points.timeBlocks, center, comparisonLine);
  const twelveOclock = getTwelveOclock(timeBlocks);
  comparisonLine = Point.getVector(twelveOclock.pos, center);
  timeBlocks = angleToLine(points.timeBlocks, center, comparisonLine);
  TimeBlock.print(twelveOclock, `./result/${image_name}/8.twelveOclock.jpg`, image, colors.FULLRED);
  const handleAngle = Point.getAngle(handle, comparisonLine);
  angleToHour(handleAngle, timeBlocks, image, image_name);
  Point.drawVector(image, colors.FULLRED, handle);
  Point.paintLineBetween(image, colors.FULLRED, twelveOclock.pos, center);
  image.write(`./result/${image_name}/9.angle.jpg`);
};

const angleToHour = function (angle, timeBlocks, image) {
  const between = inBetween(angle, timeBlocks);
  const firstAngle = timeBlocks[between[0]].angle - angle;
  const wholeAngle = timeBlocks[between[0]].angle - timeBlocks[between[1]].angle;
  console.log(firstAngle, wholeAngle);
  console.log((60 * firstAngle) / wholeAngle);
};

function inBetween(angle, timeBlocks) {
  for (let i = 0; i < timeBlocks.length; i++) {
    const j = i + 1 >= timeBlocks.length ? 0 : i + 1;
    if (angle < timeBlocks[i].angle && angle > timeBlocks[j].angle) {
      return [i, j];
    }
  }
}

function angleToLine(timeBlocks, center, line, inner) {
  for (let i = 0; i < timeBlocks.length; i++) {
    const timeVector = Point.getVector(timeBlocks[i].pos, center);
    let angle;
    if (inner) {
      angle = Point.getInnerAngle(timeVector, line);
    } else {
      angle = Point.getAngle(timeVector, line);
    }
    timeBlocks[i].angle = angle;
  }
  return timeBlocks;
}

function innerAngleToLine(timeBlocks, center, line) {
  return angleToLine(timeBlocks, center, line, true);
}

function getTwelveOclock(timeBlocks) {
  let minAngle = 100;
  let twelveOclock = null;
  for (let i = 0; i < timeBlocks.length; i++) {
    if (timeBlocks[i].angle < minAngle) {
      minAngle = timeBlocks[i].angle;
      twelveOclock = timeBlocks[i];
    }
  }
  return twelveOclock;
}
