const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

const dirs = ['app', 'components'];
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, (filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');
      let newContent = content
        .replace(/#1ed760/g, 'var(--gb-success)')
        .replace(/#ff4b4b/g, 'var(--gb-danger)')
        .replace(/#ffc107/g, 'var(--gb-warning)')
        .replace(/#35d8ff/g, 'var(--gb-blue)')
        .replace(/#ffb3b3/g, 'var(--gb-danger)')
        .replace(/#0fa08a/g, 'var(--gb-copper)')
        .replace(/#dbe7ff/g, 'var(--gb-cream)')
        .replace(/rgba\(255, 75, 75/g, 'rgba(226, 109, 90')
        .replace(/rgba\(30, 215, 96/g, 'rgba(103, 197, 135');
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated: ' + filePath);
      }
    });
  }
});
