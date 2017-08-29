const Clock = require('./clock');
const Jimp = require('jimp');
const TimeBlocks = require('./center');
const Handles = require('./handles');
const Time = require('./Time');
// const Transformation = require('./transformation');

exports.getHour = function (path, image_name) {
  return new Promise((resolve, reject) => {
    openImage(path).then((image) => {
      const clock = Clock.get(image, image_name);  // get an image with the clock
      const segmentedClock = Clock.segment(clock, image_name);
      const points = TimeBlocks.find(segmentedClock, image_name);
      const handles = Handles.getAsVectors(segmentedClock, points.center, image_name);
      const time = Time.read(segmentedClock, image_name, handles, points);
      console.log(time);
      resolve(clock);
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};


function openImage(path) {
  return new Promise((resolve) => {
    resolve(Jimp.read(path));
  });
}
