const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'apresentacao-sistema', 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

function normalizeName(name) {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/\+/g, "e") // replace +
        .trim() // remove trailing spaces
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .toLowerCase();
}

scriptContent = scriptContent.replace(/src:\s*"([^"]+)"/g, (match, p1) => {
    // p1 is the path like "../Apresentação Sistema/Introdução/Introdução-1.mp4"
    const parts = p1.split('/');
    const normalizedParts = parts.map(part => {
        if (part === '..') return part;
        if (part === 'Apresentação Sistema') return 'videos';
        return normalizeName(part);
    });
    return `src: "${normalizedParts.join('/')}"`;
});

fs.writeFileSync(scriptPath, scriptContent);
console.log("Script updated.");
