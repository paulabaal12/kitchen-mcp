// Script para leer y combinar todos los CSVs de la carpeta CSV en un solo archivo JSON
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvDir = path.join(__dirname, '../data/CSV');
const outputJson = path.join(__dirname, './data/combined_data.json');

// Filtrar solo archivos .csv (no carpetas ni otros tipos)
function getCsvFiles(dir) {
  return fs.readdirSync(dir).filter(file => file.endsWith('.csv'));
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function processAllCSVs() {
  const files = getCsvFiles(csvDir);
  const combined = {};

  for (const file of files) {
    const filePath = path.join(csvDir, file);
    try {
      const data = await readCSV(filePath);
      combined[file] = data;
      console.log(`Procesado: ${file} (${data.length} filas)`);
    } catch (err) {
      console.error(`Error procesando ${file}:`, err);
    }
  }

  fs.writeFileSync(outputJson, JSON.stringify(combined, null, 2));
  console.log('combined_data.json generado con éxito.');
}

processAllCSVs().catch(console.error);
