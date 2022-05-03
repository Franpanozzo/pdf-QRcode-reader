const functions = require('firebase-functions');
const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require('fs');
var   gs = require('gs');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

admin.initializeApp();

// const STORAGE_BUCKET_NAME = process.env.STORAGE_BUCKET_NAME;
const STORAGE_BUCKET_NAME = 'arq-fb-test';

exports.makePNG = functions.https.onRequest((req, res) => {

  // ignore delete events
  if (object.resourceState == 'not_exists') return false;
  
  // const filePath = object.name;
  const filePath = req.body.storageFullPath;
  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  // if (fileName.endsWith('.png')) return false;
  // if (!fileName.endsWith('.pdf')) return false;

  const newName = path.basename(filePath, '.pdf') + '-%03d.png';
  const tempNewPathMultiPage = path.join(os.tmpdir(), newName);
  const configuration = [{r: 300, scaleFactor: 3}, {r: 600, scaleFactor: 2}, {r: 1200, scaleFactor: 3}];

  // // Download file from bucket.
  // const bucket = admin.storage().bucket(object.bucket);
  const bucket = admin.storage().bucket(req.body.storageBucket);
  const firestoreDocId = req.body.result.firestoreDocId;

  return bucket.file(filePath).download({
    destination: tempFilePath
  }).then(async () => {
    console.log('Image downloaded locally to', tempFilePath);

    let iterator = 0;
    let qrCode = undefined, config;

    while(config = configuration[iterator]) {
      qrCode = await getQrFromPdf(config, tempFilePath, tempNewPathMultiPage, filePath);
      if(qrCode) {
        config.processedPdfs++;
        break
      }
      iterator++;
      if(!config) {
        break;
      }
    }
    fs.unlinkSync(tempFilePath);

    if(qrCode) {
      const qrInfo = Buffer.from(qrCode.substring(qrCode.indexOf('=') + 1), 'base64').toString('utf-8');
      const afipJson = JSON.parse(qrInfo);

      console.log(`QR CODE INFO: ${afipJson}`);

      admin.firestore().doc(`fb_qr_results/${firestoreDocId}`).set({ 
        sucess: true,
        qrCode,
        data: afipJson
      });
    }
    else {
      console.log('There is QR Code to read from the PDF');
      admin.firestore().doc(`fb_qr_results/${firestoreDocId}`).set({ 
        sucess: false,
        qrCode: '',
        data: {}
      });
    }

  }).catch((err) => {
    console.log('exception:', err);
    return err;
  });

});


function convertPdfToImage(conf, pdfFilePath, imagePathMultiPage) {
  return new Promise((resolve, reject) => {
    gs()
      .batch()
      .nopause()
      .option(`-r${conf.r}`)
      .option(`-dDownScaleFactor=${conf.scaleFactor}`)
      .q()
      .device('pnggray')
      .executablePath('lambda-ghostscript/bin/./gs')
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

function readQrFromImage(filePath) {
  return new Promise((res, rej) => {
    let pageIterator = 1;
    let qrCodeText = undefined;
  
    try {
      while(1) {
        const newNameIterable = path.basename(filePath, '.pdf') + `-00${pageIterator}.png`;
        const tempNewPath = path.join(os.tmpdir(), newNameIterable);
        const buffer = fs.readFileSync(tempNewPath);
        console.log(`Reading page ${pageIterator} of the PDF in ${tempNewPath}`);
        const png = PNG.sync.read(buffer);
        const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
        qrCodeText = code?.data;

        pageIterator++;
        fs.unlinkSync(tempNewPath);
        
        // if(qrCodeText) break;
        if(/afip/.test(qrCodeText)) break;
      }

      res(qrCodeText);
    } catch (err) {
      res(null);
    }
  })
}

function getQrFromPdf(config, tempFilePath, tempNewPathMultiPage, filePath) {
  // const PDF_NAME = 'sample10';

  try {
    return convertPdfToImage(config, tempFilePath, tempNewPathMultiPage)
      .then(res => {
        console.log(`PNG created with r: ${config.r} - scale: ${config.scaleFactor}`);
        const coso = readQrFromImage(filePath);
        return coso;
      });
  } catch(err) {
    console.log('Failed to convert PDF to image -',err);
    return null;
  }
}