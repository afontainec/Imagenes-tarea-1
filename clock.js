
const segmenter = require('./segmenter');
const cropper = require('./cropper');
const colors = require('./colors');


exports.get = function (image, image_name) {
  const border = getRedBorder(image, image_name);  // return binary image with only the red border
  const innerClock = fillClock(image, border, image_name);   // return binary image with the inside of the clock (the clock without border)
  return innerClock;
};


function getRedBorder(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  image = segmenter.getLargestByColor(image, RED, 60, image_name); // get binary image with BLACK whenever the is RED and the rest is white


  console.log('---', `${image_name}: Crop image...`);
  const dimensions = cropper.getBoundingBox(image, colors.BLACK); // Crop image. only appear the clock
  original.crop(dimensions[0], dimensions[1], dimensions[2], dimensions[3]);
  image.crop(dimensions[0], dimensions[1], dimensions[2], dimensions[3]);
  console.log('---', `${image_name}: Ok.`);

  original.write(`./result/${image_name}/1.border.jpg`);  // on this path an image is saved showing the advance
  console.log('---', `${image_name}: border saved`);
  return image;
}


function fillClock(original, image, image_name) {
  console.log('------', `${image_name}: getting innerClock...`);
  const WHITE = [255, 255, 255];
  image = segmenter.getLargestByColor(image, WHITE, 3, image_name); // get binary image where the inner part is black

  const dim = cropper.getBoundingBox(image, colors.BLACK); // Crop image
  original.crop(dim[0], dim[1], dim[2], dim[3]);
  image.crop(dim[0], dim[1], dim[2], dim[3]);

  original = cropper.removeBackgroud(original, image); // Remove the unwanted background

  original.write(`./result/${image_name}/2.innerClock.jpg`);
  console.log('------', `${image_name}: innerClock saved.`);
  return image;
}
