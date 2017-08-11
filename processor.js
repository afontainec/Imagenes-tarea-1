const Clock = require('./clock');
const Jimp = require('jimp');

exports.getHour = function (path, image_name) {
  return new Promise((resolve, reject) => {
    openImage(path).then((image) => {
      // const clock = segmenter.getClock(image, image_name);
      const clock = Clock.get(image, image_name);
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
