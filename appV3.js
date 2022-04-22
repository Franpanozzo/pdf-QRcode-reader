const jimp = require("jimp");
const fs = require('fs')
const qrCode = require('qrcode-reader');
const { format } = require("path");
const gm = require('gm').subClass({imageMagick: true});
const path = require('path');

const pdfFilePath = path.resolve(path.join(__dirname ,`/data/Captura7.png`));

var buffer = fs.readFileSync(__dirname + '/data/Captura7.png');

gm(pdfFilePath).selectFrame(0).toBuffer((err, buffer) => {
  if(err) {
    return console.error(err);
  }
  console.log(buffer);
})

// jimp.read(buffer, (err, image) => {
//   if(err) {
//     return console.error(err);
//   }
//   let qrcode = new qrCode();

//   qrcode.callback = (err, value) => {
//     if(err) {
//       return console.error(err);
//     }
//     console.log(`Codigo QR: ${value.result}`);
//   };

//   qrcode.decode(image.bitmap);
// });
