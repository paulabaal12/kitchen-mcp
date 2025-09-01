// Servidor MCP local básico usando JSON-RPC para exponer alimentos y sugerencias
const express = require('express');
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

const csvDir = path.join(__dirname, '../data/CSV');
const groupFiles = [
  'FOOD-DATA-GROUP1.csv',
  'FOOD-DATA-GROUP2.csv',
  'FOOD-DATA-GROUP3.csv',
  'FOOD-DATA-GROUP4.csv',
  'FOOD-DATA-GROUP5.csv',
  'nutrients_csvfile.csv',
];
let foods = [];

function loadFoods() {
  return new Promise((resolve, reject) => {
    let allFoods = [];
    let filesProcessed = 0;
    groupFiles.forEach(file => {
      const filePath = path.join(csvDir, file);
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          allFoods = allFoods.concat(results);
          filesProcessed++;
          if (filesProcessed === groupFiles.length) {
            foods = allFoods;
            resolve();
          }
        })
        .on('error', reject);
    });
  });
}

// JSON-RPC handler
app.post('/jsonrpc', (req, res) => {
  const { id, method, params } = req.body;
  let result = null;
  let error = null;

  try {
    switch (method) {
      case 'getFoods':
        result = foods;
        break;
      case 'getFoodByName':
        result = foods.find(f => f.food && f.food.toLowerCase() === params.name.toLowerCase()) || null;
        break;
      case 'searchFoods':
        result = foods.filter(f => {
          let ok = true;
          if (params.minProtein) ok = ok && parseFloat(f.Protein) >= parseFloat(params.minProtein);
          if (params.maxFat) ok = ok && parseFloat(f.Fat) <= parseFloat(params.maxFat);
          if (params.maxCalories) ok = ok && parseFloat(f['Caloric Value']) <= parseFloat(params.maxCalories);
          return ok;
        });
        break;
      case 'getIngredients':
        result = Array.from(new Set(foods.map(f => f.food))).filter(Boolean);
        break;
      case 'getRecipeSuggestions':
        result = foods
          .filter(f => f.Protein && f.Fat)
          .sort((a, b) => parseFloat(b.Protein) - parseFloat(a.Protein) || parseFloat(a.Fat) - parseFloat(b.Fat))
          .slice(0, 5);
        break;
      default:
        error = { code: -32601, message: 'Method not found' };
    }
  } catch (e) {
    error = { code: -32000, message: e.message };
  }

  res.json({ jsonrpc: '2.0', id, result, error });
});

loadFoods().then(() => {
  app.listen(PORT, () => {
    console.log(`MCP server running on port ${PORT}`);
  });
});
