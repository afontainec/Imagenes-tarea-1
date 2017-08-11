const segmenter = require('./segmenter');


exports.get = function (original, image_name) {
  const secHandle = getRedHandle(original, image_name);
  const blackHandles = getBlackHandles(original, image_name);

  return secHandle;
};


function getRedHandle(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  image = segmenter.getLargestByColor(image, RED, 100, image_name); // get binary image with BLACK whenever the is RED and the rest is white

  image.write(`./result/${image_name}/seconds Handles.jpg`);  // on this path an image is saved showing the advance
  console.log('------', `${image_name}: seconds Handles saved`);
  return image;
}

function getBlackHandles(original, image_name) {
  let image = original.clone();
  const BLACK = [0, 0, 0];
  image = segmenter.getByColor(image, BLACK, 100, image_name); // get binary image with BLACK whenever the is RED and the rest is white

  image.write(`./result/${image_name}/black Handles.jpg`);  // on this path an image is saved showing the advance
  console.log('------', `${image_name}: seconds Handles saved`);
  return image;
}
