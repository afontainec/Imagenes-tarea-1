const segmenter = require('./segmenter');


exports.get = function (original, image_name) {
  // const secHandle = getRedHandle(original, image_name);
  const handles = getHandles(original, image_name);

  return handles;
};

exports.getOrientation = function (diameter, image, image_name) {
  return image;
};

function getHandles(original, image_name) {
  const red = getRedHandle(original, image_name);
  const black = getBlackHandles(original, image_name);
  const handles = segmenter.merge(red, black); // merge both binary to get all the handles
  handles.write(`./result/${image_name}/6.Handles.jpg`);  // on this path an image is saved showing the advance
  console.log('------', `${image_name}: all Handles saved`);
  return handles;
}


function getRedHandle(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  image = segmenter.getLargestByColor(image, RED, 2, image_name); // get binary image with BLACK whenever the is RED and the rest is white

  image.write(`./result/${image_name}/4.Red Handle.jpg`);  // on this path an image is saved showing the advance
  console.log('------', `${image_name}: Red Handles saved`);
  return image;
}

function getBlackHandles(original, image_name) {
  let image = original.clone();
  const BLACK = [25, 29, 28];
  image = segmenter.getLargestByColor(image, BLACK, 3, image_name); // get binary image with BLACK whenever the is RED and the rest is white

  image.write(`./result/${image_name}/5. Black Handles.jpg`);  // on this path an image is saved showing the advance
  console.log('------', `${image_name}: Black Handles saved`);
  return image;
}
