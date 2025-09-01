// Script para procesar los CSVs y generar recipes.json
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Cambia estos nombres según los archivos que quieras procesar
// Ajustar rutas para la estructura actual del proyecto
// Los archivos están en: d:/Documentos/GitHub/PROY1-REDES/data/FoodData_Central_csv_2025-04-24/
const baseDataPath = path.join(__dirname, '../../data/FoodData_Central_csv_2025-04-24');
const foodCsv = path.join(baseDataPath, 'food.csv');
const nutrientCsv = path.join(baseDataPath, 'nutrient.csv');
const foodNutrientCsv = path.join(baseDataPath, 'food_nutrient.csv');

const outputJson = path.join(__dirname, './data/recipes.json');

// Leer food.csv (alimentos)
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

async function processCSVs() {
  const foods = await readCSV(foodCsv);
  const nutrients = await readCSV(nutrientCsv);
  const foodNutrients = await readCSV(foodNutrientCsv);

  // Crear un mapa de nutrientes por food_id
  const foodNutrientMap = {};
  foodNutrients.forEach(fn => {
    if (!foodNutrientMap[fn.food_id]) foodNutrientMap[fn.food_id] = [];
    foodNutrientMap[fn.food_id].push({
      nutrient_id: fn.nutrient_id,
      amount: fn.amount
    });
  });

  // Crear un mapa de nombre de nutriente
  const nutrientMap = {};
  nutrients.forEach(n => {
    nutrientMap[n.id] = n.name;
  });

  // Unificar datos
  const recipes = foods.map(food => {
    const nutrients = (foodNutrientMap[food.id] || []).map(n => ({
      name: nutrientMap[n.nutrient_id] || n.nutrient_id,
      amount: n.amount
    }));
    return {
      id: food.id,
      description: food.description,
      food_category_id: food.food_category_id,
      publication_date: food.publication_date,
      nutrients
    };
  });

  fs.writeFileSync(outputJson, JSON.stringify(recipes, null, 2));
  console.log('recipes.json generado con éxito.');
}

processCSVs().catch(console.error);
