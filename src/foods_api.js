// Lee el archivo FOOD-DATA-GROUP5.csv y expone endpoints para alimentos y nutrición
const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const csvDir = path.join(__dirname, '../data/CSV');
const groupFiles = [
  'FOOD-DATA-GROUP1.csv',
  'FOOD-DATA-GROUP2.csv',
  'FOOD-DATA-GROUP3.csv',
  'FOOD-DATA-GROUP4.csv',
  'FOOD-DATA-GROUP5.csv',
];
let foods = [];

// Cargar y combinar los datos de todos los archivos GROUP
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


// Endpoint: obtener todos los alimentos
app.get('/foods', (req, res) => {
  res.json(foods);
});

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
app.get('/foods/search', (req, res) => {
  let results = foods;
  if (req.query.minProtein) {
    results = results.filter(f => parseFloat(f.Protein) >= parseFloat(req.query.minProtein));
  }
  if (req.query.maxFat) {
    results = results.filter(f => parseFloat(f.Fat) <= parseFloat(req.query.maxFat));
  }
  if (req.query.maxCalories) {
    results = results.filter(f => parseFloat(f['Caloric Value']) <= parseFloat(req.query.maxCalories));
  }
  res.json(results);
});

// Endpoint: listar ingredientes únicos (usando la columna 'food')
app.get('/ingredients', (req, res) => {
  const uniqueIngredients = Array.from(new Set(foods.map(f => f.food))).filter(Boolean);
  res.json(uniqueIngredients);
});

// Endpoint: sugerencias de recetas simples (alimentos con más proteína y menos grasa)
app.get('/recipes/suggestions', (req, res) => {
  // Sugerir top 5 alimentos con mayor proteína y menor grasa
  const sorted = foods
    .filter(f => f.Protein && f.Fat)
    .sort((a, b) => parseFloat(b.Protein) - parseFloat(a.Protein) || parseFloat(a.Fat) - parseFloat(b.Fat));
  res.json(sorted.slice(0, 5));
});

// Iniciar el servidor después de cargar los datos
loadFoods().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error loading foods:', err);
});
