const { fromPath } = require('pdf2pic');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');
const path = require('path');

const FILE = 'sample3.pdf';

const pdfFilePath = path.resolve(path.join(__dirname ,`/data/${FILE}`));

const pdf2picOptions = {
  quality: 100,
  density: 300,
  format: 'png',
  width: 2000,
  height: 2000,
};

async function readQrFromPdf(pdfFile) {
  const base64ResponseArray = await fromPath(pdfFile, pdf2picOptions).bulk(-1, true);
  // console.log(base64ResponseArray);
  const finalQrTexts = []

  base64ResponseArray.forEach(base64Response => {
    const stringCodigoQR = readQr(base64Response?.base64);
    if(stringCodigoQR) finalQrTexts.push(stringCodigoQR);
  });

  return finalQrTexts;
}

function readQr(dataUri) {
  const buffer = Buffer.from(dataUri, 'base64');
  const png = PNG.sync.read(buffer);

  const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
  const qrCodeText = code?.data;

  return qrCodeText;
}

async function main() {
  const algo = await readQrFromPdf(pdfFilePath);
  console.log('QR codes:', algo);
}

main();

module.exports = {
  readQrFromPdf
}
