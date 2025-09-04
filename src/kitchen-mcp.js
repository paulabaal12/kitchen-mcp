// Función para calcular la distancia de Levenshtein entre dos strings
function levenshtein(a, b) {
  a = a.normalize('NFD').replace(/[^\w\s]/gi, '').toLowerCase();
  b = b.normalize('NFD').replace(/[^\w\s]/gi, '').toLowerCase();
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
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
      case 'getRecipesByIngredients':
        // params.ingredients debe ser un array de strings
        if (!params.ingredients || !Array.isArray(params.ingredients)) {
          error = { code: -32602, message: 'Parámetro ingredients requerido (array de strings)' };
          break;
        }
        // Buscar recetas que contengan al menos uno de los ingredientes dados (case-insensitive)
        const searchIngredients = params.ingredients.map(i => i.trim().toLowerCase());
        // Para cada receta, contar cuántos ingredientes coinciden
        // Permitir errores ortográficos más tolerantes (fuzzy search, tolerancia 3)
        // Limpiar mejor los ingredientes (quitar espacios, tildes, caracteres especiales)
        let recetasCoincidentes = recetas
          .map(r => {
            let recetaIngs = [];
            if (Array.isArray(r.ingredients)) {
              recetaIngs = r.ingredients;
            } else if (typeof r.ingredients === 'string') {
              recetaIngs = r.ingredients.split(',');
            }
            recetaIngs = recetaIngs.map(i => i.trim().toLowerCase().normalize('NFD').replace(/[^\w\s]/gi, ''));
            const coincidencias = searchIngredients.filter(ing => {
              const cleanIng = ing.trim().toLowerCase().normalize('NFD').replace(/[^\w\s]/gi, '');
              return recetaIngs.some(ring => {
                if (ring.includes(cleanIng)) return true;
                // fuzzy: permitir distancia de Levenshtein <= 3
                return levenshtein(ring, cleanIng) <= 3;
              });
            });
            return { receta: r, coincidencias: coincidencias.length };
          })
          .filter(x => x && x.coincidencias > 0);
  // Ordenar por mayor cantidad de coincidencias
  recetasCoincidentes.sort((a, b) => b.coincidencias - a.coincidencias);
  // Devolver solo las 5 mejores coincidencias
  result = recetasCoincidentes.slice(0, 5).map(x => x.receta);
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
