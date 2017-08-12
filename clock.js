const segmenter = require('./segmenter');
const cropper = require('./cropper');
const colors = require('./colors');


exports.get = function (image, image_name) {
  console.log(image_name, ': ', 'getting border');
  const border = getRedBorder(image, image_name); // return binary image with only the red border
  console.log(image_name, ': ', 'getting inner clock');
  const innerClock = fillClock(image, border, image_name); // return binary image with the inside of the clock (the clock without border)
  return innerClock;
};


exports.segment = function (original, image_name) {
  original.write('debug.jpg');

  console.log(image_name, ': ', 'dividing inner clock');
  let image = getRedHandle(original, image_name);
  image = segmentBlacks(original, image, image_name);
  return image;
};

function segmentBlacks(original, outlineImage, image_name) {
  let image = original.clone();
  image.write('debug.jpg');
  image = segmenter.innerClock(image, 90, image_name);  // divide the inner clock by handles and 'hour blocks' (blocks representing each hour)

  // paint images
  original = cropper.colorWithFilter(original, image, colors.PURPLE, colors.PURPLE);
  original = cropper.colorWithFilter(original, image, colors.YELLOW, colors.YELLOW);
  outlineImage = cropper.colorWithFilter(outlineImage, image, colors.PURPLE, colors.PURPLE);
  outlineImage = cropper.colorWithFilter(outlineImage, image, colors.YELLOW, colors.YELLOW);

  // crop
  const dim = cropper.getBoundingBox(image, colors.YELLOW);
  image.crop(dim[0], dim[1], dim[2], dim[3]);
  original.crop(dim[0], dim[1], dim[2], dim[3]);
  outlineImage.crop(dim[0], dim[1], dim[2], dim[3]);

  // save images
  image.write(`./result/${image_name}/4.black_parts_outline.jpg`);
  original.write(`./result/${image_name}/5.paintedInnerClock.jpg`);
  outlineImage.write(`./result/${image_name}/6.outlined.jpg`);
  return outlineImage;
}

function getRedHandle(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  image = segmenter.getLargestByColor(image, RED, 80, image_name);
  original = cropper.colorWithFilter(original, image, colors.CYAN);
  image = cropper.colorWithFilter(image, image, colors.CYAN);


  original.write(`./result/${image_name}/3.red_handle.jpg`); // on this path an image is saved showing the advance
  image.write(`./result/${image_name}/3.red_handle_outline.jpg`); // on this path an image is saved showing the advance

  return image;
}

function getRedBorder(original, image_name) {
  let image = original.clone();
  const RED = [139, 29, 45];
  image = segmenter.getLargestByColor(image, RED, 60, image_name); // get binary image with BLACK whenever the is RED and the rest is white

  const dimensions = cropper.getBoundingBox(image, colors.BLACK); // Crop image. only appear the clock
  original.crop(dimensions[0], dimensions[1], dimensions[2], dimensions[3]);
  image.crop(dimensions[0], dimensions[1], dimensions[2], dimensions[3]);

  original.write(`./result/${image_name}/1.border.jpg`); // on this path an image is saved showing the advance
  return image;
}


function fillClock(original, image, image_name) {
  const WHITE = [255, 255, 255];
  image = segmenter.getLargestByColor(image, WHITE, 3, image_name); // get binary image where the inner part is black

  const dim = cropper.getBoundingBox(image, colors.BLACK); // Crop image
  original.crop(dim[0], dim[1], dim[2], dim[3]);
  image.crop(dim[0], dim[1], dim[2], dim[3]);

  original = cropper.removeBackgroud(original, image); // Remove the unwanted background

  original.write(`./result/${image_name}/2.innerClock.jpg`);
  return original;
}
