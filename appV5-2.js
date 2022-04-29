const path = require('path');
const fs = require('fs');
const { performanceFunc } = require('./appV5');
const util = require('util');

const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
const log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

const directoryPath = path.join(__dirname, 'single-pdf');
const configuration = [{r: 300, scaleFactor: 3, processedPdfs: 0}, {r: 600, scaleFactor: 2,  processedPdfs: 0}, {r: 1200, scaleFactor: 3,  processedPdfs: 0}];

async function func() {
  let pdfConQrNoProcesados = [];
  fs.readdir(directoryPath, async function (err, files) {
    if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 
      // console.time("Tiempo");
      const begin =Date.now();
      for (const file of files) {
        console.log(`El path del pdf ${file}: ${path.join(directoryPath,file)}`); 
          const pdfInfo = await performanceFunc(directoryPath, file, configuration);

          if(!pdfInfo.qrCode) {
            pdfConQrNoProcesados.push(file);
          }
          // else pdfConQrNoProcesados.push(file);
      }
      const end = Date.now();

      const timeSpent =(end-begin)/1000+" secs";
      console.log(`Time: ${timeSpent}`);
      // console.timeEnd("Tiempo");
      console.log(configuration);
      console.log(`PDFs with no QR CODE: ${pdfConQrNoProcesados.length}`);
      console.log(pdfConQrNoProcesados);
      // console.log('PDFs WITH QR CODES: ');
      // for (const pdf of pdfConQrProcesados) {
      //   console.log(pdf)
      // }
      // console.log('PDFs WITHOUT QR CODES: ');
      // for (const pdf of pdfConQrNoProcesados) {
      //   console.log(pdf)
      // }
  });

}

func();