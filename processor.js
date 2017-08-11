const Clock = require('./clock');
const Jimp = require('jimp');
const Center = require('./center');
const Handles = require('./handles');

exports.getHour = function (path, image_name) {
  return new Promise((resolve, reject) => {
    openImage(path).then((image) => {
      const clock = Clock.get(image, image_name);  // get an image with the clock
      const diameter = Center.find(clock, image_name, image);
      console.log(diameter);
      const handles = Handles.get(image, image_name);
      resolve(handles);
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
