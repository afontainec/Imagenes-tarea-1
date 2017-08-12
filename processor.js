const Clock = require('./clock');
const Jimp = require('jimp');
const Center = require('./center');
const Handles = require('./handles');

exports.getHour = function (path, image_name) {
  return new Promise((resolve, reject) => {
    openImage(path).then((image) => {
      const clock = Clock.get(image, image_name);  // get an image with the clock
      const segmentedClock = Clock.segment(clock, image_name);
      const diameter = Center.find(segmentedClock, image_name, image);
      // let handles = Handles.get(image, image_name);
      // handles = Handles.getOrientation(diameter, handles, image_name);
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
