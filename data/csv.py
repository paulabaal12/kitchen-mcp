import csv
import json
from collections import defaultdict


# CONVERTIR All_Diets.csv a All_Diets.json ---
import sys

def csv_to_json(csv_file, json_file):
    data = []
    with open(csv_file, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convierte los valores numéricos si es posible
            for k in row:
                try:
                    if row[k] != '' and k not in ['Diet_type', 'Recipe_name', 'Cuisine_type', 'Extraction_day', 'Extraction_time']:
                        row[k] = float(row[k])
                except Exception:
                    pass
            data.append(row)
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Archivo convertido: {json_file}')

if __name__ == '__main__':
    csv_path = 'data/CSV/All_Diets.csv'
    json_path = 'src/data/All_Diets.json'
    csv_to_json(csv_path, json_path)
