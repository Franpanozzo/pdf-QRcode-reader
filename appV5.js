const gs = require('gs');
const path = require('path');
const fs = require('fs')
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const GS_PATH = 'functions/lambda-gs-win/bin/./gswin64.exe';

function convertPdfToImage(conf, pdfFilePath, imagePathMultiPage) {
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
          console.log('GS executed successfully!');
          // console.log('stdout', stdout)
          // console.log('stderr', stderr)
          resolve(pdfFilePath)
        } else {
          console.log('gs error:', err)
          reject(err)
        }
      });
  })
}

function readQrFromImage(pdfName) {
  return new Promise((res, rej) => {
    let pageIterator = 1;
    let qrCodeText = undefined;
  
    try {
      while(1) {
        const buffer = fs.readFileSync(path.join(__dirname,'images',`${pdfName}-00${pageIterator}.png`));
        const png = PNG.sync.read(buffer);
        const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
        qrCodeText = code?.data;
        pageIterator++;
        if(/afip/i.test(qrCodeText)) break;
      }
      res(qrCodeText);
    } catch (err) {
      res(null);
    }
  })
}

function getQrFromPdf(config, directoryPath, pdf) {
  // const PDF_NAME = 'sample10';

  const pdfFilePath = path.join(directoryPath, pdf);
  const pdfName = path.basename(pdfFilePath, '.pdf')
  const imagePathMultiPage = path.join(__dirname ,'images',`${pdfName}-%03d.png`);

  try {
    return convertPdfToImage(config, pdfFilePath, imagePathMultiPage)
      .then(res => {
        const coso = readQrFromImage(pdfName);
        return coso;
      });
  } catch(err) {
    console.log('Failed to convert PDF to image -',err);
    return null;
  }
}

async function performanceFunc(directoryPath, file, configuration) {
  // const configuration = [{r: 300, scaleFactor: 3}, {r: 600, scaleFactor: 2}, {r: 1200, scaleFactor: 3}];
  let iterator = 0;
  let qrCode = undefined, config;

  while(config = configuration[iterator]) {
    qrCode = await getQrFromPdf(config, directoryPath, file);
    if(qrCode) {
      config.processedPdfs++;
      break
    }
    iterator++;
    if(!config) {
      break;
    }
  }

  return {
    qrCode,
    config
  };
}


module.exports = {
  performanceFunc
}
  