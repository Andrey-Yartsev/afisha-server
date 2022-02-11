const fs = require('fs');

const handleFileUpload = file => {
  return new Promise((resolve, reject) => {
    const dir = global.appRoot;
    fs.writeFile(dir + '/upload/test.png', file, err => {
      if (err) {
        reject(err)
      }
      resolve({ message: 'Upload successfully!' })
    })
  })
};

module.exports = handleFileUpload;
