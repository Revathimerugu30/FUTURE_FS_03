const fs = require('fs');
const path = require('path');
const data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
const outPath = path.resolve(__dirname, 'test-upload.png');
fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
console.log(outPath);
