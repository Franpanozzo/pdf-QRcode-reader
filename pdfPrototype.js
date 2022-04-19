const { fromPath } = require('pdf2pic');
const { PNG } = require('pngjs');
const path = require('path');

require('dotenv').config();

const FILE = 'sample2.pdf';

const pdfFilePath = path.resolve(path.join(__dirname ,`/data/${FILE}`));

const pdf2picOptions = {
  quality: 100,
  density: 300,
  format: 'png',
  width: 2000,
  height: 2000,
};

async function func() {
  const base64Response = await fromPath(pdfFilePath, pdf2picOptions)(1, true);
  console.log(base64Response);

  const dataUri = base64Response?.base64;

  const buffer = Buffer.from(dataUri, 'base64');
  const png = PNG.sync.read(buffer);

  console.log(`la foto: ${png}`);
}

func();
