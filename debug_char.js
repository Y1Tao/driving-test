
import fs from 'fs';

const content = fs.readFileSync('d:\\Trae\\project\\ex\\src\\assets\\题库.md', 'utf-8');
const lines = content.split('\n');

let targetLine = '';
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('国家安全生产的基本方针')) {
        targetLine = lines[i+1]; // The next line has options
        break;
    }
}

if (targetLine) {
    console.log('Target Line:', targetLine.trim());
    const firstChar = targetLine.trim()[1]; // "A" is 0, "." is 1
    console.log('Char at index 1:', firstChar);
    console.log('Char Code at index 1:', firstChar.charCodeAt(0));
    
    // Check regex
    const regex = /([A-F])[.、]/g;
    const matches = [...targetLine.matchAll(regex)];
    console.log('Matches:', matches.length);
} else {
    console.log('Target line not found');
}
