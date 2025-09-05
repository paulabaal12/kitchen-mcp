import csv
import json
from collections import defaultdict

# Cambia estos paths si es necesario
csv_paths = [
    'data/CSV/experts_food_substitions_tobe_verified.csv',
    'data/CSV/final_substitution.csv'
]
json_path = 'src/data/ingredient_substitutions.json'

substitutions = defaultdict(set)

# Procesar el primer CSV (experts_food_substitions_tobe_verified.csv)
try:
    with open(csv_paths[0], newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            food = row.get('Food', '').strip().lower()
            similar = row.get('Similar Food', '').strip()
            if food and similar:
                substitutions[food].add(similar)
except Exception as e:
    print(f"Error procesando {csv_paths[0]}: {e}")

# Procesar el segundo CSV (final_substitution.csv)
try:
    with open(csv_paths[1], newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Busca columnas relevantes
            food = row.get('Ingredient') or row.get('Food') or row.get('Main Ingredient')
            food = (food or '').strip().lower()
            # Puede haber varias columnas de sustitutos
            subs = []
            for key in row:
                if key.lower().startswith('substitute') or key.lower().startswith('similar') or 'substitution' in key.lower():
                    value = row[key].strip()
                    if value:
                        # Puede haber varios sustitutos separados por | o ,
                        for s in value.replace('|', ',').split(','):
                            s = s.strip()
                            if s:
                                subs.append(s)
            if food and subs:
                for s in subs:
                    substitutions[food].add(s)
except Exception as e:
    print(f"Error procesando {csv_paths[1]}: {e}")

# Convertir sets a listas y limpiar duplicados
substitutions = {k: sorted(list(v)) for k, v in substitutions.items() if v}

with open(json_path, 'w', encoding='utf-8') as jsonfile:
    json.dump(substitutions, jsonfile, ensure_ascii=False, indent=2)

print(f"Archivo JSON generado con {len(substitutions)} ingredientes.")
