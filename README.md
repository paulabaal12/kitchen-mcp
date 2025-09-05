# Kitchen MCP Server

A Model Context Protocol (MCP) server focused on food, nutrition, and recipe suggestions. This project allows you to query ingredients, get nutritional information, and receive recipe recommendations using the open MCP standard, making it compatible with Claude Desktop and other MCP clients.

## Features

- Query foods and their nutritional information.
- Search for foods by nutritional criteria (protein, fat, calories).
- List available ingredients.
- Get recipe suggestions based on nutrition.
- Find recipes by ingredients.
- All endpoints follow the MCP protocol and are compatible with Claude Desktop.

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

## Project Goals

- Implement a standards-based MCP server for food and nutrition.
- Enable LLMs and agents to access real-time food and recipe data.
- Demonstrate interoperability with Claude Desktop and other MCP clients.

## License

MIT
