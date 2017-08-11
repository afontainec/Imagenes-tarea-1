const segmenter = require('./segmenter');


exports.get = function (original, image_name) {
  // const secHandle = getRedHandle(original, image_name);
  const blackHandles = getHandles(original, image_name);

  return blackHandles;
};

function getHandles(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  image = segmenter.getLargestByColor(image, RED, 100, image_name); // get binary image with BLACK whenever the is RED and the rest is white

  image.write(`./result/${image_name}/3.Handles.jpg`);  // on this path an image is saved showing the advance
  console.log('------', `${image_name}: seconds Handles saved`);
  return image;
}
