const Point = require('./point');
const colors = require('./colors');
const TimeBlock = require('./center');

exports.read = function (image, image_name, handle, points) {
  const center = points.center;
  // comparar con una línea vertical para ver el orden de los bloques y cual son las 12
  let comparisonLine = Point.getVector([0, center[1]], center);
  // registrar el angulo que tienen a la línea
  let timeBlocks = innerAngleToLine(points.timeBlocks, center, comparisonLine);
  // el con menor ángulo son las 12
  const twelveOclock = getTwelveOclock(timeBlocks);
  // ahora volvemos a repetir lo anterior, pero con un vector que representa las 12
  comparisonLine = Point.getVector(twelveOclock.pos, center);
  timeBlocks = angleToLine(points.timeBlocks, center, comparisonLine);
  // imprimimos una foto resaltando las 12.
  TimeBlock.print(twelveOclock, `./result/${image_name}/8.twelveOclock.jpg`, image, colors.FULLRED);
  const time = getTime(timeBlocks, handle, comparisonLine, twelveOclock);
  return time;
};

function getTime(timeBlocks, handle, comparisonLine, twelveOclock) {
  const hour = getHour(timeBlocks, handle.hourHandle, comparisonLine, twelveOclock);
  const minutes = getMinutes(timeBlocks, handle.minuteHandle, comparisonLine, twelveOclock);
  // const minutes = getMinutes(timeBlocks, handle.minuteHandle, comparisonLine, twelveOclock);

  return {
    hour,
    minutes,
  };
}

function getMinutes(timeBlocks, handle, comparisonLine, twelveOclock) {
  const handleAngle = Point.getAngle(handle, comparisonLine);
  return angleToMinute(handleAngle, timeBlocks, twelveOclock);
}

function angleToMinute(angle, timeBlocks, twelveOclock) {
  const between = inBetween(angle, timeBlocks);
  const firstAngle = timeBlocks[between[0]].angle - angle;
  const wholeAngle = timeBlocks[between[0]].angle - timeBlocks[between[1]].angle;
  let base = between[0];
  base = adjustHour(base, timeBlocks, twelveOclock);
  base *= 5;
  let offset = 5 * (firstAngle / wholeAngle);
  offset = parseInt(offset, 10);
  const minutes = base + offset;
  return minutes;
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
