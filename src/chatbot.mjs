import readline from 'readline';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Anthropic } from "@anthropic-ai/sdk";
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = 'http://localhost:3001';
const LOG_FILE = path.join(path.resolve(), 'src', 'chatbot_log.json');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function logInteraction(question, answer) {
  let log = [];
  if (fs.existsSync(LOG_FILE)) {
    log = JSON.parse(fs.readFileSync(LOG_FILE));
  }
  log.push({ timestamp: new Date().toISOString(), question, answer });
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function showMenu() {
  console.log('\n=== Food & Nutrition Chatbot (MCP) ===');
  console.log('1. Buscar alimento por nombre (MCP)');
  console.log('2. Buscar alimentos por proteína/grasa/calorías (MCP)');
  console.log('3. Sugerencias de recetas (MCP)');
  console.log('4. Listar ingredientes únicos (MCP)');
  console.log('5. Buscar recetas por ingredientes (MCP)');
  console.log('6. Ver log de interacciones');
  console.log('7. Preguntar a Claude (Anthropic)');
  console.log('8. Salir');
}

const MCP_URL = 'http://localhost:4000/jsonrpc';

async function callMCP(method, params = {}) {
  try {
    const res = await axios.post(MCP_URL, {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    });
    return res.data.result;
  } catch (err) {
    return `Error MCP: ${err.message || err}`;
  }
}

// Historial de mensajes para Claude (solo sesión actual)
let claudeHistory = [];

async function handleOption(option) {
  switch(option) {
    case '1':
      rl.question('Nombre del alimento: ', async (name) => {
        const result = await callMCP('getFoodByName', { name });
          if (!result) {
            console.log('No se encontró el alimento.');
          } else {
            console.log('Resultado (MCP):');
            console.log(result);
          }
          logInteraction(`MCP: getFoodByName ${name}`, result);
          promptUser();
      });
      break;
    case '2': {
      rl.question('Mínimo de proteína: ', (minProtein) => {
        if (isNaN(parseFloat(minProtein))) {
          console.log('Por favor ingresa un número válido para proteína.');
          return promptUser();
        }
        rl.question('Máximo de grasa: ', (maxFat) => {
          if (isNaN(parseFloat(maxFat))) {
            console.log('Por favor ingresa un número válido para grasa.');
            return promptUser();
          }
          rl.question('Máximo de calorías: ', async (maxCalories) => {
            if (isNaN(parseFloat(maxCalories))) {
              console.log('Por favor ingresa un número válido para calorías.');
              return promptUser();
            }
            const params = { minProtein, maxFat, maxCalories };
            const result = await callMCP('searchFoods', params);
            if (!result || result.length === 0) {
              console.log('No se encontraron alimentos con esos criterios.');
            } else {
              console.log('Resultados (MCP):');
              console.log(result);
            }
            logInteraction(`MCP: searchFoods minProtein=${minProtein}, maxFat=${maxFat}, maxCalories=${maxCalories}`, result);
            promptUser();
          });
        });
      });
      return;
    }
      break;

    case '3': {
      const result = await callMCP('getRecipeSuggestions');
      if (!result || result.length === 0) {
        console.log('No hay sugerencias de recetas disponibles.');
      } else {
        console.log('Sugerencias de recetas (MCP):');
        console.log(result);
      }
      logInteraction('MCP: getRecipeSuggestions', result);
      promptUser();
      return;
    }
    case '4': {
      const result = await callMCP('getIngredients');
      if (!result || result.length === 0) {
        console.log('No hay ingredientes disponibles.');
      } else {
        console.log('Ingredientes únicos (MCP):');
        console.log(result);
      }
      logInteraction('MCP: getIngredients', result);
      promptUser();
      return;
    }
    case '5': {
      rl.question('Ingresa los ingredientes separados por coma (ej: manzana, canela): ', async (input) => {
        const ingredients = input.split(',').map(i => i.trim()).filter(Boolean);
        if (ingredients.length === 0) {
          console.log('Debes ingresar al menos un ingrediente.');
          return promptUser();
        }
        const result = await callMCP('getRecipesByIngredients', { ingredients });
        if (!result || result.length === 0) {
          console.log('No se encontraron recetas con esos ingredientes.');
        } else {
          console.log('Recetas sugeridas:');
          result.forEach((receta, idx) => {
            // Calcular coincidencias
            let recetaIngs = [];
            if (Array.isArray(receta.ingredients)) {
              recetaIngs = receta.ingredients;
            } else if (typeof receta.ingredients === 'string') {
              recetaIngs = receta.ingredients.split(',');
            }
            recetaIngs = recetaIngs.map(i => i.trim().toLowerCase());
            const coincidencias = ingredients.filter(ing => recetaIngs.some(ring => ring.includes(ing.toLowerCase())));
            console.log(`\n[${idx+1}] ${receta.name || receta.title || 'Receta sin nombre'}`);
            console.log(`Coincidencias: ${coincidencias.length} (${coincidencias.join(', ')})`);
            if (receta.ingredients) console.log('Ingredientes:', Array.isArray(receta.ingredients) ? receta.ingredients.join(', ') : receta.ingredients);
            if (receta.instructions) console.log('Instrucciones:', receta.instructions);
          });
        }
        logInteraction(`MCP: getRecipesByIngredients ${ingredients.join(', ')}`, result);
        promptUser();
      });
      return;
    }
    case '6':
      if (fs.existsSync(LOG_FILE)) {
        const log = JSON.parse(fs.readFileSync(LOG_FILE));
        console.log('=== Log de interacciones ===');
        log.forEach((entry, i) => {
          console.log(`\n[${i+1}] ${entry.timestamp}`);
          console.log('Pregunta:', entry.question);
          console.log('Respuesta:', entry.answer);
        });
      } else {
        console.log('No hay interacciones registradas.');
      }
      promptUser();
      break;
    case '7': {
      async function converseWithClaude() {
        rl.question("Pregunta para Claude (escribe 'salir' para volver al menú): ", async (question) => {
          if (question.trim().toLowerCase() === 'salir' || question.trim().toLowerCase() === 'volver') {
            promptUser();
            return;
          }
          try {
            claudeHistory.push({ role: 'user', content: question });
            // Limitar historial a los últimos 10 mensajes
            const historyToSend = claudeHistory.slice(-10);
            const response = await anthropic.messages.create({
              model: 'claude-3-haiku-20240307',
              max_tokens: 200,
              messages: historyToSend
            });
            const answer = response.content[0].text;
            claudeHistory.push({ role: 'assistant', content: answer });
            console.log('Claude:', answer);
            logInteraction(`Claude: ${question}`, answer);
          } catch (err) {
            console.log('Error consultando a Claude:', err.message || err);
          }
          converseWithClaude();
        });
      }
      converseWithClaude();
      break;
    }
    case '8':
      console.log('¡Hasta luego!');
      rl.close();
      break;
    case '6': {
      async function converseWithClaude() {
        rl.question("Pregunta para Claude (escribe 'salir' para volver al menú): ", async (question) => {
          if (question.trim().toLowerCase() === 'salir' || question.trim().toLowerCase() === 'volver') {
            promptUser();
            return;
          }
          try {
            claudeHistory.push({ role: 'user', content: question });
            // Limitar historial a los últimos 10 mensajes
            const historyToSend = claudeHistory.slice(-10);
            const response = await anthropic.messages.create({
              model: 'claude-3-haiku-20240307',
              max_tokens: 200,
              messages: historyToSend
            });
            const answer = response.content[0].text;
            claudeHistory.push({ role: 'assistant', content: answer });
            console.log('Claude:', answer);
            logInteraction(`Claude: ${question}`, answer);
          } catch (err) {
            console.log('Error consultando a Claude:', err.message || err);
          }
          converseWithClaude();
        });
      }
      converseWithClaude();
      break;
    }
    case '7':
      console.log('¡Hasta luego!');
      rl.close();
      break;
    default:
      console.log('Opción no válida.');
      promptUser();
  }
}

function promptUser() {
  showMenu();
  rl.question('Elige una opción: ', handleOption);
}

promptUser();
