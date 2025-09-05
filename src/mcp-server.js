#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
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
    } catch (e) {
      console.error('Error loading ingredientes_unificados.json:', e);
    }
  }
  if (fs.existsSync(recetasPath)) {
    try {
      recetas = JSON.parse(fs.readFileSync(recetasPath, 'utf-8'));
    } catch (e) {
      console.error('Error loading recetas_unificadas.json:', e);
    }
  }
}

// Crear servidor MCP
const server = new Server(
  {
    name: 'kitchen-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Definir herramientas MCP
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_foods',
        description: 'Obtener todos los alimentos disponibles',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_food_by_name',
        description: 'Buscar un alimento específico por nombre',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del alimento a buscar',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'search_foods',
        description: 'Buscar alimentos por criterios nutricionales',
        inputSchema: {
          type: 'object',
          properties: {
            minProtein: {
              type: 'number',
              description: 'Proteína mínima en gramos',
            },
            maxFat: {
              type: 'number',
              description: 'Grasa máxima en gramos',
            },
            maxCalories: {
              type: 'number',
              description: 'Calorías máximas',
            },
          },
        },
      },
      {
        name: 'get_ingredients',
        description: 'Obtener lista de ingredientes disponibles',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_recipe_suggestions',
        description: 'Obtener sugerencias de recetas basadas en contenido nutricional',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_recipes',
        description: 'Obtener todas las recetas disponibles',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_recipes_by_ingredients',
        description: 'Buscar recetas por ingredientes específicos',
        inputSchema: {
          type: 'object',
          properties: {
            ingredients: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Lista de ingredientes a buscar',
            },
          },
          required: ['ingredients'],
        },
      },
    ],
  };
});

// Implementar manejadores de herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_foods':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(foods, null, 2),
            },
          ],
        };

      case 'get_food_by_name':
        const food = foods.find(f => 
          f.food && f.food.toLowerCase() === args.name.toLowerCase()
        ) || null;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(food, null, 2),
            },
          ],
        };

      case 'search_foods':
        const filtered = foods.filter(f => {
          let ok = true;
          if (args.minProtein) ok = ok && parseFloat(f.protein_g) >= parseFloat(args.minProtein);
          if (args.maxFat) ok = ok && parseFloat(f.fat) <= parseFloat(args.maxFat);
          if (args.maxCalories) ok = ok && parseFloat(f.energy_kcal) <= parseFloat(args.maxCalories);
          return ok;
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(filtered, null, 2),
            },
          ],
        };

      case 'get_ingredients':
        const ingredients = Array.from(new Set(foods.map(f => f.food))).filter(Boolean);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ingredients, null, 2),
            },
          ],
        };

      case 'get_recipe_suggestions':
        const source = recetas.length > 0 ? recetas : foods;
        const suggestions = source
          .filter(r => r.protein_g && r.fat)
          .sort((a, b) => parseFloat(b.protein_g) - parseFloat(a.protein_g) ||
                          parseFloat(a.fat) - parseFloat(b.fat))
          .slice(0, 5);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(suggestions, null, 2),
            },
          ],
        };

      case 'get_recipes':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(recetas, null, 2),
            },
          ],
        };

      case 'get_recipes_by_ingredients':
        if (!args.ingredients || !Array.isArray(args.ingredients)) {
          throw new McpError(ErrorCode.InvalidParams, 'Parámetro "ingredients" requerido (array de strings)');
        }

        const searchIngredients = args.ingredients.map(i =>
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
                return levenshtein(ring, ing) <= 3;
              });
            });

            return { receta: r, coincidencias: coincidencias.length };
          })
          .filter(x => x.coincidencias > 0);

        recetasCoincidentes.sort((a, b) => b.coincidencias - a.coincidencias);
        const result = recetasCoincidentes.slice(0, 5).map(x => x.receta);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Error ejecutando ${name}: ${error.message}`);
  }
});

// Inicializar y ejecutar servidor
async function runServer() {
  loadFoods();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Kitchen MCP Server ejecutándose...');
}

runServer().catch(console.error);