const segmenter = require('./segmenter');
const Jimp = require('jimp');

exports.getHour = function(path, image_name) {
  return new Promise(function(resolve, reject) {
    openImage(path).then((image) => {
      const clock = segmenter.getClock(image, image_name);
      resolve(clock);
    }).catch((err) => {
      console.log(err);
    });
  });
};


function openImage(path) {
  return new Promise((resolve, reject) => {
    resolve(Jimp.read(path));
  });
}
