const Point = require('./point');
const colors = require('./colors');
const TimeBlock = require('./center');

exports.read = function (image, image_name, handle, points) {
  const center = points.center;

  let comparisonLine = Point.getVector([0, center[1]], center);
  let timeBlocks = innerAngleToLine(points.timeBlocks, center, comparisonLine);
  const twelveOclock = getTwelveOclock(timeBlocks);
  comparisonLine = Point.getVector(twelveOclock.pos, center);
  timeBlocks = angleToLine(points.timeBlocks, center, comparisonLine);
  TimeBlock.print(timeBlocks[0], `./result/${image_name}/8.block0.jpg`, image.clone(), colors.FULLRED);
  TimeBlock.print(timeBlocks[1], `./result/${image_name}/8.block1.jpg`, image.clone(), colors.FULLRED);

  TimeBlock.print(twelveOclock, `./result/${image_name}/8.twelveOclock.jpg`, image, colors.FULLRED);
  console.log('hour');
  const hour = getHour(timeBlocks, handle.hourHandle, comparisonLine, twelveOclock);
  console.log('adjusted hour', hour);
  console.log('minutes');
  const minutes = getMinutes(timeBlocks, handle.minuteHandle, comparisonLine, twelveOclock);
  image.write(`./result/${image_name}/9.angle.jpg`);
  return `${hour}:${minutes}`;
};

function getMinutes(timeBlocks, handle, comparisonLine, twelveOclock) {
  const handleAngle = Point.getAngle(handle, comparisonLine);
  const closest = angleToHour(handleAngle, timeBlocks, twelveOclock);
  console.log('final', closest);
  return 5 * closest;
}

function getHour(timeBlocks, handle, comparisonLine, twelveOclock) {
  const handleAngle = Point.getAngle(handle, comparisonLine);
  return angleToHour(handleAngle, timeBlocks, twelveOclock);
}

const angleToHour = function (angle, timeBlocks, twelve) {
  const between = inBetween(angle, timeBlocks);
  // const firstAngle = timeBlocks[between[0]].angle - angle;
  // const wholeAngle = timeBlocks[between[0]].angle - timeBlocks[between[1]].angle;
  const hour = between[0];
  console.log('not adjusted', hour);
  return adjustHour(hour, timeBlocks, twelve);
};

function adjustHour(hour, timeBlocks, twelveOclock) {
  const index = getTwelveOclockIndex(timeBlocks, twelveOclock);
  console.log('idex ', index);
  const c = 12 - index;
  return (hour + c) % 12;
}

function getTwelveOclockIndex(timeBlocks, twelveOclock) {
  for (let i = 0; i < timeBlocks.length; i++) {
    if (timeBlocks[i].angle === twelveOclock.angle) {
      return i;
    }
  }
}

function inBetween(angle, timeBlocks) {
  for (let i = 0; i < timeBlocks.length; i++) {
    const j = i + 1 >= timeBlocks.length ? 0 : i + 1;
    if (angle < timeBlocks[i].angle && angle > timeBlocks[j].angle) {
      return [i, j];
    }
  }
  timeBlocks[0].angle = 2 * Math.PI;
  return [0, 11];
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
