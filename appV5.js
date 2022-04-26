const gs = require('gs');
const path = require('path');
const fs = require('fs')
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const PDF_NAME = 'sample2';
const GS_PATH = 'functions/lambda-gs-win/bin/./gswin64.exe';

const pdfFilePath = path.resolve(path.join(__dirname ,'data',`${PDF_NAME}.pdf`));
const imagePathMultiPage = path.resolve(path.join(__dirname ,'data',`${PDF_NAME}-%03d.png`));

async function convertPdfToImage() {
  return new Promise((resolve, reject) => {
    gs()
      .batch()
      .nopause()
      .q()
      .device('png16m')
      .executablePath(GS_PATH)
      .output(imagePathMultiPage)
      .input(pdfFilePath)
      .exec((err, stdout, stderr) => {
        if (!err) {
          console.log('GS executed successfully!')
          // console.log('stdout', stdout)
          // console.log('stderr', stderr)
          resolve(imagePathMultiPage)
        } else {
          console.log('gs error:', err)
          reject(err)
        }
      });
  })
}

function readQrFromImage() {
  let pageIterator = 1;
  let qrCodeText = undefined;

  try {
    while(1) {
      const buffer = fs.readFileSync(path.resolve(path.join(__dirname,'data',`${PDF_NAME}-00${pageIterator}.png`)))
      const png = PNG.sync.read(buffer);
      const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
      qrCodeText = code?.data;
      pageIterator++;
      if(/afip/.test(qrCodeText)) break;
    }
    console.log(`QR code in page ${pageIterator - 1} :`, qrCodeText);
  } catch (err) {
    console.log('The pdf has no AFIP QR code to read');
  }
}

async function getQrFromPdf() {
  try {
    const image = await convertPdfToImage();
    // imageRead = fs.readFileSync(path.resolve(path.join(__dirname,'data','sample-001.png')));
    readQrFromImage();
  } catch(err) {
    console.log('Failed to convert PDF to image -',err);
  }
}

getQrFromPdf();
  