const processor = require('./processor');
const files = require('./files');

const IMAGES = files.IMAGES;
const path = files.PATH;
const promises = [];

for (let i = 0; i < IMAGES.length; i++) {
  console.log(IMAGES[i]);
  promises.push(processor.getHour(path + IMAGES[i], IMAGES[i]));
}

Promise.all(promises).then((params) => {
  for (let i = 0; i < params.length; i++) {
    console.log(params[i]);
  }
}).catch((err) => {
  console.log(err);
});
