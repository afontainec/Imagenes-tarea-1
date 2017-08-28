const Clock = require('./clock');
const Jimp = require('jimp');
const Center = require('./center');
const Transformation = require('./transformation');

exports.getHour = function (path, image_name) {
  return new Promise((resolve, reject) => {
    openImage(path).then((image) => {
      const clock = Clock.get(image, image_name);  // get an image with the clock
      // const diameter = Center.find(clock, image_name, image);
      const transformedImage = Transformation.perspective(clock, image_name, image);
      const segmentedClock = Clock.segment(transformedImage, image_name);


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
