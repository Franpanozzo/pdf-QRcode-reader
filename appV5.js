const gs = require('gs');
const path = require('path');
const fs = require('fs')
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const PDF_NAME = 'sample7';
const GS_PATH = 'functions/lambda-gs-win/bin/./gswin64.exe';

const pdfFilePath = path.resolve(path.join(__dirname ,'data',`${PDF_NAME}.pdf`));
const imagePathMultiPage = path.resolve(path.join(__dirname ,'data',`${PDF_NAME}-%03d.png`));

async function convertPdfToImage(conf) {
  return new Promise((resolve, reject) => {
    gs()
      .batch()
      .nopause()
      .option(`-r${conf.r}`)
      .option(`-dDownScaleFactor=${conf.scaleFactor}`)
      .q()
      .device('pnggray')
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
      if(/afip/i.test(qrCodeText)) break;
    }
    return qrCodeText;
  } catch (err) {
    return null;
  }
}

async function getQrFromPdf(config) {
  try {
    await convertPdfToImage(config);
    return readQrFromImage();
  } catch(err) {
    console.log('Failed to convert PDF to image -',err);
    return null;
  }
}

async function performanceFunc() {
  const configuration = [{r: 300, scaleFactor: 3}, {r: 600, scaleFactor: 2}, {r: 1200, scaleFactor: 3}];
  let iterator = 0;
  let qrCode = undefined, config;

  while(config = configuration[iterator]) {
    console.log(`GETTING QR CODE WITH - r:${config.r}, scaleFactor:${config.scaleFactor}`);
    qrCode = await getQrFromPdf(config);
    if(qrCode) break
    iterator++;
    if(!config) {
      break;
    }
  }

  if(qrCode) console.log('QR code:', qrCode);
  else console.log('The pdf has no AFIP QR code to read');
}

performanceFunc();
  