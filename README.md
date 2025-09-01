# PROY1-REDES

## MCP Local Server Specification

**Endpoint:**  
`POST http://localhost:4000/jsonrpc`

**Supported Methods:**

- `getFoods`
	- **Description:** Returns all foods.
	- **Params:** none
	- **Example request:**
		```json
		{ "jsonrpc": "2.0", "id": 1, "method": "getFoods", "params": {} }
		```

- `getFoodByName`
	- **Description:** Returns a food by exact name.
	- **Params:**
		- `name` (string)
	- **Example request:**
		```json
		{ "jsonrpc": "2.0", "id": 2, "method": "getFoodByName", "params": { "name": "almond butter" } }
		```

- `searchFoods`
	- **Description:** Search foods by protein, fat, and calories.
	- **Params:**
		- `minProtein` (number, optional)
		- `maxFat` (number, optional)
		- `maxCalories` (number, optional)
	- **Example request:**
		```json
		{ "jsonrpc": "2.0", "id": 3, "method": "searchFoods", "params": { "minProtein": 5, "maxFat": 10 } }
		```

- `getIngredients`
	- **Description:** Returns a list of unique ingredients.
	- **Params:** none
	- **Example request:**
		```json
		{ "jsonrpc": "2.0", "id": 4, "method": "getIngredients", "params": {} }
		```

- `getRecipeSuggestions`
	- **Description:** Returns recipe suggestions (top protein, low fat).
	- **Params:** none
	- **Example request:**
		```json
		{ "jsonrpc": "2.0", "id": 5, "method": "getRecipeSuggestions", "params": {} }
		```