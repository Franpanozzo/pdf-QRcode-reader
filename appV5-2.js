const path = require('path');
const fs = require('fs');
const { performanceFunc } = require('./appV5');

const directoryPath = path.join(__dirname, 'single-pdf');

async function func() {
  fs.readdir(directoryPath, async function (err, files) {
    if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 

      for (const file of files) {
        console.log(`El path del pdf ${file}: ${path.join(directoryPath,file)}`); 
          const { qrCode, config } = await performanceFunc(directoryPath, file);

          if(qrCode) {
            console.log('QR CODE:', qrCode);
            console.log('CONFIG:', config);
          }
          else console.log('No AFIP QR code for,',file);
      }
  });
}

func();