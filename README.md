
# 🥗 Kitchen MCP Server

<div align="center">
<b>Model Context Protocol server for food, nutrition, and smart recipe recommendations</b>
</div>

A Model Context Protocol (MCP) server focused on food, nutrition, and recipe suggestions. This project allows you to query ingredients, get nutritional information, and receive recipe recommendations using the open MCP standard, making it compatible with Claude Desktop and other MCP clients.

## Features

- Query foods and their nutritional information.
- Search for foods by nutritional criteria (protein, fat, calories).
- List available ingredients.
- Get all available recipes.
- Get recipe suggestions based on nutrition.
- Find recipes by ingredients.
- Suggest recipes by diet type (vegan, keto, etc.) and calories.
- Suggest substitutes for a given ingredient.
- Suggest necessary kitchen utensils for a recipe.
- Recommend foods or recipes based on your mood and optionally the season.
- All endpoints follow the MCP protocol and are compatible with Claude Desktop and other MCP clients.

## Project Structure

- `src/mcp-server.js`: Main MCP server implementation (Node.js).
- `src/utils.js`: Utility functions (e.g., Levenshtein distance).
- `data/`: Contains JSON and CSV files with food and recipe data.

## Requirements

- Node.js 18 or higher
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/paulabaal12/kitchen-mcp.git
   cd kitchen-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure your data files (`ingredientes_unificados.json`, `recetas_unificadas.json`) are present in the `src/data/` directory.

## Usage

### Running the MCP Server

To start the server for use with Claude Desktop:

```bash
node src/mcp-server.js
```

### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kitchen": {
      "command": "node",
      "args": [
        "D:/Documentos/GitHub/kitchen-mcp/src/mcp-server.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```
> Adjust the path if your project is in a different location.

### Example: Get Recipes by Ingredients

**Prompt in Claude Desktop:**
```
I want to cook something with apple, sugar and butter.
```

**Sample MCP Tool Call:**
```json
{
  "method": "get_recipes_by_ingredients",
  "params": {
    "ingredients": ["apple", "sugar", "butter"]
  }
}
```

**Sample Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "[\n  {\n    \"name\": \"Fruit Galette\",\n    \"ingredients\": [\"apple\", \"sugar\", \"butter\", ...],\n    ...\n  },\n  ...\n]"
    }
  ]
}
```

### Example Recipe: Creole Cream Cheesecake With Caramel-Apple Topping

**Ingredients:**
- Graham cracker crumbs, sugar, butter, cream cheese, eggs, apples, honey, cinnamon, cardamom, ginger, vanilla, lemon.

**Preparation:**
1. Prepare the crust and bake.
2. Mix and bake the cheesecake filling.
3. Make the caramel-apple topping in a pan.
4. Chill the cheesecake, then top with apples before serving.

**Approximate Calories:**  
~7,700 calories for the whole cheesecake (about 480–640 per slice).

## MCP Tools (Endpoints)

The following MCP tools are available:

| Name                              | Description                                                                                 |
|------------------------------------|---------------------------------------------------------------------------------------------|
| `get_foods`                       | Get all available foods.                                                                    |
| `get_food_by_name`                | Find a specific food by name.                                                               |
| `search_foods`                    | Search foods by nutritional criteria (minProtein, maxFat, maxCalories).                     |
| `get_ingredients`                 | Get list of available ingredients.                                                          |
| `get_recipe_suggestions`          | Get recipe suggestions based on nutritional content.                                        |
| `get_recipes`                     | Get all available recipes.                                                                  |
| `get_recipes_by_ingredients`      | Find recipes by specific ingredients.                                                       |
| `suggest_recipe_by_diet`          | Suggest recipes by diet type (vegan, keto, etc). Optionally filter by calories.             |
| `suggest_ingredient_substitution` | Suggest substitutes for a given ingredient (e.g., orange juice).                            |
| `suggest_utensils_for_recipe`     | Suggest necessary kitchen utensils for a given recipe (by name).                            |
| `recommend_by_mood_and_season`    | Recommends foods or recipes based on mood and optionally season (e.g., happy + summer).      |

### Example: Recommend by Mood and Season

**Prompt:**
```
I feel happy, what can I eat?
```

**Sample MCP Tool Call:**
```json
{
  "method": "recommend_by_mood_and_season",
  "params": {
    "mood": "happy"
  }
}
```

**Sample Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "[\n  {\"name\": \"Fruit Salad\", ...}, ...]"
    }
  ]
}
```

- If you add a `season` (e.g., `"season": "autumn"`), the recommendations will also consider seasonal foods.
- You can set `type` to `food` or `recipe` (default is recipe).

### Example: Suggest Utensils for a Recipe

**Prompt:**
```
What utensils do I need for lasagna?
```

**Sample MCP Tool Call:**
```json
{
  "method": "suggest_utensils_for_recipe",
  "params": {
    "recipe_name": "lasagna"
  }
}
```

**Sample Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"recipe\": \"lasagna\",\n  \"utensils\": [\"pan\", \"pot\", ...]\n}"
    }
  ]
}
```

## Visual Examples with Claude Desktop

### Example: Recipe search by ingredients or diet

![alt text](image-1.png)
*Recipe search using ingredients in Claude Desktop.*

---

### Example: Recommendation by mood

![alt text](image.png)
*Food recommendation based on mood in Claude Desktop.*

---

### Example: Utensil suggestion
![alt text](image-2.png)
*Automatic utensil suggestion for a recipe in Claude Desktop.*

---
### Example: Ingredient substitution

![alt text](image-3.png)
*Ingredient substitution suggestion in Claude Desktop*