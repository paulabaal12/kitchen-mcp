const fs = require('fs');
const path = require('path');
const { levenshtein } = require('./utils');

const dataDir = path.join(__dirname, 'data');
const ingredientesPath = path.join(dataDir, 'ingredientes_unificados.json');
const recetasPath = path.join(dataDir, 'recetas_unificadas.json');

let foods = [];
let recetas = [];

// Cargar los datos JSON
function loadFoods() {
  if (fs.existsSync(ingredientesPath)) {
    try {
      foods = JSON.parse(fs.readFileSync(ingredientesPath, 'utf-8'));
      console.log('Loaded ingredientes_unificados.json:', foods.length, 'items');
    } catch (e) {
      console.error('Error loading ingredientes_unificados.json:', e);
    }
  } else {
    console.warn('ingredientes_unificados.json not found at', ingredientesPath);
  }
  if (fs.existsSync(recetasPath)) {
    try {
      recetas = JSON.parse(fs.readFileSync(recetasPath, 'utf-8'));
      console.log('Loaded recetas_unificadas.json:', recetas.length, 'items');
    } catch (e) {
      console.error('Error loading recetas_unificadas.json:', e);
    }
  } else {
    console.warn('recetas_unificadas.json not found at', recetasPath);
  }
}

// Handlers de métodos JSON-RPC
const handlers = {
  getFoods: () => foods,

  getFoodByName: ({ name }) =>
    foods.find(f => f.food && f.food.toLowerCase() === name.toLowerCase()) || null,

  searchFoods: ({ minProtein, maxFat, maxCalories }) =>
    foods.filter(f => {
      let ok = true;
      if (minProtein) ok = ok && parseFloat(f.protein_g) >= parseFloat(minProtein);
      if (maxFat) ok = ok && parseFloat(f.fat) <= parseFloat(maxFat);
      if (maxCalories) ok = ok && parseFloat(f.energy_kcal) <= parseFloat(maxCalories);
      return ok;
    }),

  getIngredients: () =>
    Array.from(new Set(foods.map(f => f.food))).filter(Boolean),

  getRecipeSuggestions: () => {
    const source = recetas.length > 0 ? recetas : foods;
    return source
      .filter(r => r.protein_g && r.fat)
      .sort((a, b) => parseFloat(b.protein_g) - parseFloat(a.protein_g) ||
                      parseFloat(a.fat) - parseFloat(b.fat))
      .slice(0, 5);
  },

  getRecipes: () => recetas,

  getRecipesByIngredients: ({ ingredients }) => {
    if (!ingredients || !Array.isArray(ingredients)) {
      throw new Error('Parámetro "ingredients" requerido (array de strings)');
    }

    const searchIngredients = ingredients.map(i =>
      i.trim().toLowerCase().normalize('NFD').replace(/[^\w\s]/gi, '')
    );

    let recetasCoincidentes = recetas
      .map(r => {
        let recetaIngs = Array.isArray(r.ingredients)
          ? r.ingredients
          : typeof r.ingredients === 'string'
            ? r.ingredients.split(',')
            : [];

        recetaIngs = recetaIngs.map(i =>
          i.trim().toLowerCase().normalize('NFD').replace(/[^\w\s]/gi, '')
        );

        const coincidencias = searchIngredients.filter(ing => {
          return recetaIngs.some(ring => {
            if (ring.includes(ing)) return true;
            return levenshtein(ring, ing) <= 3; // fuzzy
          });
        });

        return { receta: r, coincidencias: coincidencias.length };
      })
      .filter(x => x.coincidencias > 0);

    recetasCoincidentes.sort((a, b) => b.coincidencias - a.coincidencias);
    return recetasCoincidentes.slice(0, 5).map(x => x.receta);
  }
};

module.exports = { handlers, loadFoods };
