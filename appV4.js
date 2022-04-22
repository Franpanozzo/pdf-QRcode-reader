const gm = require('gm').subClass({imageMagick: true});
// Include gm library  
// Import the image
gm('data\Captura.PNG')
  
// Invoke resize function with 1024*768
.setFormat('jpg')
  
// Process and Write the image
.write("data\resize1.PNG", function (err) {
  if (!err) console.log('done');
  console.log('Error:',err);
});