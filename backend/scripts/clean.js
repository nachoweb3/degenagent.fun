const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    console.log(`✅ Deleted dist folder: ${folderPath}`);
  } else {
    console.log('ℹ️  No dist folder to clean');
  }
}

deleteFolderRecursive(distPath);
