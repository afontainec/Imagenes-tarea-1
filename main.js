const processor = require('./processor');
const files = require('./files');

const IMAGES = files.IMAGES;
const path = files.PATH;


for (let i = 0; i < IMAGES.length; i++) {
  console.log(IMAGES[i]);
  processor.getHour(path + IMAGES[i], IMAGES[i]).then(() => {
    console.log('-----Finished-----');
  }).catch((err) => {
    console.log('ERROR');
    console.log(err);
  });
}
