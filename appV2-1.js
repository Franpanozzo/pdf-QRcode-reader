const { PNG } = require('pngjs');
const jsQR = require('jsqr');
const fs = require('fs')
const path = require('path');

const buffer = fs.readFileSync(path.resolve(path.join(__dirname,'data','Captura.png')))
const png = PNG.sync.read(buffer);

const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
const qrCodeText = code?.data;

console.log('QR code: ',qrCodeText);