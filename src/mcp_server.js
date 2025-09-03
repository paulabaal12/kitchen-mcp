// Servidor MCP local básico usando JSON-RPC para exponer alimentos y sugerencias
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());


// Usar los archivos JSON unificados
const dataDir = path.join(__dirname, 'data');
const ingredientesPath = path.join(dataDir, 'ingredientes_unificados.json');
const recetasPath = path.join(dataDir, 'recetas_unificadas.json');

let foods = [];
let recetas = [];
function loadFoods() {
  return new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(ingredientesPath)) {
        foods = JSON.parse(fs.readFileSync(ingredientesPath, 'utf-8'));
      }
      if (fs.existsSync(recetasPath)) {
        recetas = JSON.parse(fs.readFileSync(recetasPath, 'utf-8'));
      }
      resolve();
    } catch (err) {
      reject(err);
    }
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
          if (params.minProtein) ok = ok && parseFloat(f.protein_g) >= parseFloat(params.minProtein);
          if (params.maxFat) ok = ok && parseFloat(f.fat) <= parseFloat(params.maxFat);
          if (params.maxCalories) ok = ok && parseFloat(f.energy_kcal) <= parseFloat(params.maxCalories);
          return ok;
        });
        break;
      case 'getIngredients':
        result = Array.from(new Set(foods.map(f => f.food))).filter(Boolean);
        break;
      case 'getRecipeSuggestions':
        if (recetas.length > 0) {
          result = recetas
            .filter(r => r.protein_g && r.fat)
            .sort((a, b) => parseFloat(b.protein_g) - parseFloat(a.protein_g) || parseFloat(a.fat) - parseFloat(b.fat))
            .slice(0, 5);
        } else {
          result = foods
            .filter(f => f.protein_g && f.fat)
            .sort((a, b) => parseFloat(b.protein_g) - parseFloat(a.protein_g) || parseFloat(a.fat) - parseFloat(b.fat))
            .slice(0, 5);
        }
        break;
      case 'getRecipes':
        result = recetas;
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
