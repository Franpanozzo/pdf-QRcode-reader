const jimp = require("jimp");
const fs = require('fs')
const qrCode = require('qrcode-reader');
const path = require('path');

var buffer = fs.readFileSync(path.resolve(path.join(__dirname,'/data/Captura2.png')));

function readQrFromImage() {
  jimp.read(buffer, (err, image) => {
    if(err) {
      return console.error(err);
    }
    let qrcode = new qrCode();
  
    qrcode.callback = (err, value) => {
      if(err) {
        return console.error(err);
      }
      console.log(`Codigo QR: ${value.result}`);
    };
  
    qrcode.decode(image.bitmap);
  });
}

readQrFromImage();