// Lee el archivo FOOD-DATA-GROUP5.csv y expone endpoints para alimentos y nutrición
const express = require('express');

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;


// Leer los datos desde los archivos JSON unificados
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


// Endpoint: obtener todos los alimentos

// Endpoint: obtener todos los alimentos
app.get('/foods', (req, res) => {
  res.json(foods);
});

// Endpoint: buscar alimento por nombre (case-insensitive)

// Endpoint: buscar alimento por nombre (case-insensitive)
app.get('/foods/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const food = foods.find(f => f.food && f.food.toLowerCase() === name);
  if (food) {
    res.json(food);
  } else {
    res.status(404).json({ error: 'Food not found' });
  }
});

// Endpoint: búsqueda avanzada por query params (ej: ?minProtein=5&maxFat=10)

// Endpoint: búsqueda avanzada por query params (ej: ?minProtein=5&maxFat=10)
app.get('/foods/search', (req, res) => {
  let results = foods;
  if (req.query.minProtein) {
    results = results.filter(f => parseFloat(f.protein_g) >= parseFloat(req.query.minProtein));
  }
  if (req.query.maxFat) {
    results = results.filter(f => parseFloat(f.fat) <= parseFloat(req.query.maxFat));
  }
  if (req.query.maxCalories) {
    results = results.filter(f => parseFloat(f.energy_kcal) <= parseFloat(req.query.maxCalories));
  }
  res.json(results);
});

// Endpoint: listar ingredientes únicos (usando la columna 'food')

// Endpoint: listar ingredientes únicos (usando la columna 'food')
app.get('/ingredients', (req, res) => {
  const uniqueIngredients = Array.from(new Set(foods.map(f => f.food))).filter(Boolean);
  res.json(uniqueIngredients);
});

// Endpoint: sugerencias de recetas simples (alimentos con más proteína y menos grasa)

// Endpoint: sugerencias de recetas simples (top 5 recetas con más proteína y menos grasa)
app.get('/recipes/suggestions', (req, res) => {
  if (recetas.length > 0) {
    // Si hay recetas, sugerir top 5 por proteína (si existe el campo) y menor grasa
    const sorted = recetas
      .filter(r => r.protein_g && r.fat)
      .sort((a, b) => parseFloat(b.protein_g) - parseFloat(a.protein_g) || parseFloat(a.fat) - parseFloat(b.fat));
    res.json(sorted.slice(0, 5));
  } else {
    // Si no hay recetas, sugerir alimentos
    const sorted = foods
      .filter(f => f.protein_g && f.fat)
      .sort((a, b) => parseFloat(b.protein_g) - parseFloat(a.protein_g) || parseFloat(a.fat) - parseFloat(b.fat));
    res.json(sorted.slice(0, 5));
  }
});

// Endpoint: obtener todas las recetas
app.get('/recipes', (req, res) => {
  res.json(recetas);
});

// Iniciar el servidor después de cargar los datos

loadFoods().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error loading foods:', err);
});
