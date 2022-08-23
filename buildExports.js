const fs = require('fs');
const DJS = require('./dist/index.js');

fs.writeFileSync('./dist/index.mjs', `
import DJS from './index.js';
${Object.keys(DJS).map(key => `export const ${key} = DJS.${key}`).join('\n')}
export default DJS
`.slice(1), 'utf8');