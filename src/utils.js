function levenshtein(a, b) {
  a = a.normalize('NFD').replace(/[^\w\s]/gi, '').toLowerCase();
  b = b.normalize('NFD').replace(/[^\w\s]/gi, '').toLowerCase();
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1      // eliminación
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Diccionario extendido de utensilios y palabras clave
const UTENSIL_KEYWORDS = {
    "bench scraper": ["bench scraper"],
    "biscuit cutters": ["biscuit cutter", "biscuit cutters"],
    "bread lame": ["bread lame"],
    "brush, pastry": ["pastry brush", "brush, pastry"],
    "brush, silicone": ["silicone brush", "brush, silicone"],
    "bundt pan": ["bundt pan"],
    "cake pan": ["cake pan", "cake pan, 8-inch", "cake pan, 9-inch", "cake pan, 9x13-inch", "cake pan, square, 8-inch", "cake pan, tube pan", "angel food pan"],
    "cake stand": ["cake stand", "revolving cake stand"],
    "cutting board": ["cutting board", "tabla", "board", "chop board"],
    "disher set": ["disher set"],
    "docking tool": ["docking tool"],
    "dutch oven": ["dutch oven", "dutch oven, 5+ quart"],
    "fine mesh strainer": ["fine mesh strainer", "strainer", "colador", "colander"],
    "flutted pastry wheel": ["flutted pastry wheel"],
    "grater": ["grater", "rallador", "grater, microplane", "microplane"],
    "hand mixer": ["hand mixer"],
    "kitchen scale": ["kitchen scale", "digital scale", "kitchen scale, digital"],
    "knife, bread": ["bread knife", "knife, bread", "serrated knife"],
    "knife, chef's": ["chef's knife", "knife, chef's", "knife, chef's, 8-inch"],
    "knife, paring": ["paring knife", "knife, paring"],
    "ladle": ["ladle", "ladle, 2-ounce", "ladle, 4-ounce", "ladle, 8-ounce"],
    "loaf pan": ["loaf pan", "loaf pan, 1-pound", "loaf pan, 1.5-pound"],
    "measuring cups": ["measuring cup", "measuring cups, dry", "measuring cups, liquid", "taza medidora"],
    "measuring spoons": ["measuring spoon", "measuring spoons (set)", "measuring spoons"],
    "mixing bowls": ["mixing bowl", "mixing bowls", "bowl", "tazón"],
    "muffin pan": ["muffin pan"],
    "pan, saucier": ["pan, saucier", "saucier"],
    "pan, skillet": ["skillet", "pan, skillet", "pan, skillet, stainless steel", "pan, skillet, cast iron", "pan, skillet, nonstick"],
    "pastry bags": ["pastry bag", "pastry bags", "pastry bags, 21-inch"],
    "pie pan": ["pie pan", "pie pan, 9-inch"],
    "pie weights": ["pie weights"],
    "piping tip set": ["piping tip set"],
    "pot, saucepan": ["saucepan", "pot, saucepan", "pot, saucepan, stainless steel", "pot, stainless steel, 2-quart", "pot, stainless steel, 4-quart"],
    "precut parchment": ["precut parchment", "parchment"],
    "rimmed baking sheet": ["rimmed baking sheet", "rimmed baking sheet, 1/2", "rimmed baking sheet, 1/4", "rimmed baking sheet, 1/8"],
    "rolling pin": ["rolling pin"],
    "silicone baking mat": ["silicone baking mat", "silicone baking mat, half-sheet", "silicone baking mat, quarter-sheet"],
    "spatula, offset": ["spatula, offset", "spatula, offset, large", "spatula, offset, mini"],
    "spatulas, silicone": ["spatula", "spatulas, silicone", "spatulas, silicone, flexible", "spatula, nonstick safe", "spatulas, metal", "fish turner", "spatula, metal"],
    "stand mixer": ["stand mixer"],
    "thermometer": ["thermometer", "thermometer, instant read", "thermometer, oven", "thermometer, probe", "thermometer, fridge/freezer"],
    "towels": ["towel", "towels"],
    "whisk": ["whisk", "whisk, balloon", "whisk, dough", "whisk, french", "whisk, french, 12-inch", "whisk, flat", "whisk, french/piano, 12~14-inch"],
    "wire rack": ["wire rack", "wire rack, half-sheet", "wire rack, quarter-sheet"],
    "baking dish": ["baking dish", "baking dish, 9x13-inch", "baking dish, 9x13-inch (glass)", "baking dish, 9x13-inch (ceramic)"],
    "can opener": ["can opener"],
    "colander": ["colander", "colador", "colander, 5-quart"],
    "fire extinguisher": ["fire extinguisher"],
    "glass container": ["glass container", "glass container, 4-cup"],
    "honing steel": ["honing steel"],
    "juicer": ["juicer"],
    "kitchen twine": ["kitchen twine"],
    "knife rack": ["knife rack"],
    "mandoline": ["mandoline"],
    "meat pounder": ["meat pounder"],
    "mortar pestle": ["mortar", "pestle", "mortar pestle"],
    "pan, roasting": ["roasting pan", "pan, roasting"],
    "pan, saute": ["saute pan", "pan, saute"],
    "peeler": ["peeler"],
    "pepper mill": ["pepper mill"],
    "pie weights": ["pie weights"],
    "pizza cutter": ["pizza cutter"],
    "plating spoon": ["plating spoon"],
    "pot, stock": ["stock pot", "pot, stock", "pot, stock, stainless steel, 16-quart"],
    "potato masher": ["potato masher"],
    "potato ricer": ["potato ricer"],
    "pressure cooker": ["pressure cooker"],
    "salad spinner": ["salad spinner"],
    "shears": ["shears"],
    "spider skimmer": ["spider skimmer"],
    "squeeze bottles": ["squeeze bottle", "squeeze bottles"],
    "storage container": ["storage container", "storage container, 12-quart"],
    "torch": ["torch"],
    "tongs": ["tongs", "tongs, 12-inch"],
    "tweezers": ["tweezers", "tweezers, straight, 12-inch"],
    "wok": ["wok", "wok, carbon steel", "wok stirrer"]
};

function getUtensilsByKeywords(recipeName) {
  if (!recipeName || typeof recipeName !== 'string') return [];
  const nameLower = recipeName.toLowerCase();
  const found = new Set();
  for (const [utensil, keywords] of Object.entries(UTENSIL_KEYWORDS)) {
    for (const kw of keywords) {
      if (nameLower.includes(kw)) {
        found.add(utensil);
        break;
      }
    }
  }
  return Array.from(found);
}

function getUtensilsForRecipe(recipeName) {
  if (!recipeName || typeof recipeName !== 'string') return [];
  // Buscar por palabras clave extendidas
  const byKeywords = getUtensilsByKeywords(recipeName);
  if (byKeywords.length) return byKeywords;
  // Si no se encuentra nada, devolver básicos ampliados
  return [
    'knife',
    'cutting board',
    'spoon',
    'fork',
    'bowl',
    'pot',
    'pan',
    'colander',
    'measuring cups',
    'measuring spoons',
    'mixing bowls',
    'whisk',
    'spatula',
    'tongs',
    'oven mitts',
    'peeler',
    'grater',
    'ladle',
    'can opener',
    'tray',
    'storage container'
  ];
}

module.exports = { levenshtein, getUtensilsForRecipe, getUtensilsByKeywords };
