const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /useEffect\(\(\) => \{[\s\S]*?\}\s*(\)|,)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        if (match[1] === ')') {
            console.log(`Potential issue in ${file}: useEffect missing dependency array`);
            console.log(match[0]);
        }
    }
});
