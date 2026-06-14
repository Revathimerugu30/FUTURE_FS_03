import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
const outPath = resolve('./test-upload.png');
writeFileSync(outPath, Buffer.from(data, 'base64'));
console.log(outPath);
