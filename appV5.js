const gs = require('gs');
const path = require('path');

const pdfFilePath = path.resolve(path.join(__dirname ,`/data/sample.pdf`));

const imagePath = path.resolve(path.join(__dirname ,`/data/sample.png`));

gs()
  .batch()
  .nopause()
  .device('png16m')
  .output(imagePath)
  .input(pdfFilePath)
  .exec((err, stdout, stderr) => {
    if (!err) {
      console.log('gs executed w/o error')
      console.log('stdout', stdout)
      console.log('stderr', stderr)
      // resolve(imagePath)
    } else {
      console.log('gs error:', err)
      // reject(err)
    }
  });
  