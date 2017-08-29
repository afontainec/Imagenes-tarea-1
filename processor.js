const Clock = require('./clock');
const Jimp = require('jimp');
const TimeBlocks = require('./center');
const Handles = require('./handles');
const Time = require('./Time');
// const Transformation = require('./transformation');

exports.getHour = function (path, image_name) {
  return new Promise((resolve, reject) => {
    openImage(path).then((image) => {
      console.log(`--------------${image_name}: Start----------------`);
      // const isVertical = image.bitmap.width > image.bitmap.height;
      // console.log(image.bitmap.width, image.bitmap.height);
      // console.log(isVertical);
      const clock = Clock.get(image, image_name);  // get an image with the clock
      const segmentedClock = Clock.segment(clock, image_name);
      const points = TimeBlocks.find(segmentedClock, image_name);
      const handles = Handles.getAsVectors(segmentedClock, points.center, image_name);
      const time = Time.read(segmentedClock, image_name, handles, points);
      console.log(`--------------${image_name}: Finished----------------`);
      // resolve();
      resolve(`En la imagen ${image_name} la hora es ${time.hour}:${time.minutes}`);
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
