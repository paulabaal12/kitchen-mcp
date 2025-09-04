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
  console.log('5. Ver log de interacciones');
  console.log('6. Preguntar a Claude (Anthropic)');
  console.log('7. Salir');
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
  case '5':
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
  case '6':
      rl.question('Pregunta para Claude: ', async (question) => {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 200,
            messages: [
              { role: 'user', content: question }
            ]
          });
          const answer = response.content[0].text;
          console.log('Claude:', answer);
          logInteraction(`Claude: ${question}`, answer);
        } catch (err) {
          console.log('Error consultando a Claude:', err.message || err);
        }
        promptUser();
      });
      break;
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
