const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'Apresentação Sistema');
const scriptPath = path.join(__dirname, 'apresentacao-sistema', 'script.js');

function normalizeName(name) {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/\+/g, "e") // replace +
        .trim() // remove trailing spaces
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .toLowerCase();
}

let scriptContent = fs.readFileSync(scriptPath, 'utf8');

function processDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        let newName = normalizeName(item);
        
        if (stat.isDirectory()) {
            // First process children
            processDir(itemPath);
        }
        
        if (newName !== item) {
            const newPath = path.join(currentPath, newName);
            console.log(`Renaming ${itemPath} to ${newPath}`);
            fs.renameSync(itemPath, newPath);
            
            // Replace in script.js (simple string replace for the folder or file name)
            // We need to be careful with replace to not break other things, but here it's specific enough.
            // A better way is to rely on our knowledge of the array.
        }
    }
}

processDir(baseDir);

// Now let's rename the baseDir itself
const newBaseDir = path.join(__dirname, normalizeName('Apresentação Sistema'));
console.log(`Renaming ${baseDir} to ${newBaseDir}`);
fs.renameSync(baseDir, newBaseDir);

// Now update script.js properly
// Let's replace the whole array with the normalized paths
scriptContent = scriptContent.replace(/src:\s*"([^"]+)"/g, (match, p1) => {
    // p1 is the path like "../Apresentação Sistema/Introdução/Introdução-1.mp4"
    const parts = p1.split('/');
    const normalizedParts = parts.map(part => {
        if (part === '..') return part;
        return normalizeName(part);
    });
    return `src: "${normalizedParts.join('/')}"`;
});

fs.writeFileSync(scriptPath, scriptContent);
console.log("Renaming complete. Script updated.");
