const { readQrFromPdf } = require('./app');
const path = require('path');

const FILE = 'sample.pdf';

const pdfFilePath = path.resolve(path.join(__dirname ,`/data/${FILE}`));

test('Dado un pdf en base64 y nos el texto dentro del codigoQR', async () => {
  const finalQrTexts = await readQrFromPdf(pdfFilePath);
  expect(finalQrTexts[0]).toBe('Hello from the other side');
});