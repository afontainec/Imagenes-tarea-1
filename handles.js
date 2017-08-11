const segmenter = require('./segmenter');
const colors = require('./colors');
const cropper = require('./cropper');


exports.getHandles = function (original, image_name) {
  const secHandle = getRedHandle(original, image_name);
  const secHandle = geBlackHandle(original, image_name);

  return secHandle;
};


function getRedHandle(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  image = segmenter.getLargestByColor(image, RED, image_name); // get binary image with BLACK whenever the is RED and the rest is white

  image.write(`./result/${image_name}/seconds Handler.jpg`);  // on this path an image is saved showing the advance
  console.log('------', `${image_name}: seconds Handler saved`);
  return image;
}
