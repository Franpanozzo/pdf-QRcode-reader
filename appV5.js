const gs = require('gs');
const path = require('path');
const jimp = require("jimp");
const fs = require('fs')
const qrCode = require('qrcode-reader');

const PDF_NAME = 'sample';

const pdfFilePath = path.resolve(path.join(__dirname ,'data',`${PDF_NAME}.pdf`));
const imagePath = path.resolve(path.join(__dirname ,'data',`${PDF_NAME}.png`));

async function convertPdfToImage() {
  return new Promise((resolve, reject) => {
    gs()
      .batch()
      .nopause()
      .q()
      .device('png16m')
      .executablePath('functions/lambda-gs-win/bin/./gswin64.exe')
      .output(imagePath)
      .input(pdfFilePath)
      .exec((err, stdout, stderr) => {
        if (!err) {
          console.log('gs executed w/o error')
          // console.log('stdout', stdout)
          // console.log('stderr', stderr)
          resolve(imagePath)
        } else {
          console.log('gs error:', err)
          reject(err)
        }
      });
  })
}

function readQrFromImage(image) {
  jimp.read(image, (err, image) => {
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

async function getQrFromPdf() {
  try {
    const image = await convertPdfToImage();
    imageRead = fs.readFileSync(image);
    readQrFromImage(imageRead);
  } catch(err) {
    console.log('Failed to convert PDF to image');
  }
}

getQrFromPdf();
  