import csv
import json

csv_path = 'public/modelos/material_eletrico_pampulha.csv'
ts_path = 'data/pampulhaCatalogFull.ts'

products = []

def parse_price(p_str):
    try:
        clean = p_str.replace('R$', '').replace(' ', '').replace('.', '').replace(',', '.')
        return float(clean)
    except:
        return 10.0

def detect_packaging(name, emb):
    combined = (name + ' ' + emb).lower()
    if 'caixa' in combined or 'cx' in combined:
        return 'Caixa'
    if 'pacote' in combined or 'pct' in combined or 'pcte' in combined:
        return 'Pacote'
    if 'lote' in combined:
        return 'Lote'
    if 'metro' in combined or ' mt' in combined or ' m ' in combined:
        return 'Metro'
    if 'kit' in combined or 'jogo' in combined:
        return 'Kit'
    return 'Unidade'

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    for idx, row in enumerate(reader):
        if not row or len(row) < 5:
            continue
        code = row[0].strip()
        dept = row[1].strip() if len(row) > 1 else 'Materiais Elétricos PAMPULHA'
        category = row[2].strip() if len(row) > 2 else 'Materiais Elétricos e Ferramentas'
        name = row[3].strip() if len(row) > 3 else ''
        brand = row[4].strip() if len(row) > 4 else 'Pampulha'
        emb = row[5].strip() if len(row) > 5 else '1 un.'
        price_str = row[6].strip() if len(row) > 6 else '0'

        if not name:
            continue

        cost_price = parse_price(price_str)
        # Preço de venda com 45% de margem padrão
        sale_price = round(cost_price * 1.45, 2) if cost_price > 0 else 19.90

        pkg_type = detect_packaging(name, emb)

        prod = {
            "id": f"pamp_{code.replace('/', '_').replace(' ', '_').lower()}_{idx}",
            "code": code,
            "sku": f"SKU-PAMP-{code.replace('/', '-')}",
            "name": name,
            "category": category,
            "department": dept,
            "brand": brand,
            "supplierName": "Pampulha Condutores",
            "packagingType": pkg_type,
            "packagingDetail": emb,
            "price": sale_price,
            "costPrice": cost_price,
            "stock": 50,
            "minStock": 5,
            "imageUrl": "/ponto_chave_logo.jpg",
            "description": f"{name}. Fabricante/Marca: {brand}. Embalagem oficial: {emb}. Tabela Oficial Pampulha Condutores.",
            "voltage": "220V" if "220v" in name.lower() else ("127V" if "127v" in name.lower() else "Bivolt (110V/220V)"),
            "nature": "Não-inflamável",
            "material": "PVC" if "pvc" in name.lower() else ("Cobre" if "cobre" in name.lower() else "Metal / Termoplástico"),
            "isActive": True,
            "showInStore": False,
            "isImported": True,
            "table": "pampulha",
            "importBatchId": "batch_pampulha_oficial",
            "importBatchName": "Tabela Oficial Pampulha Condutores",
            "importedAt": "2026-09-06T00:00:00.000Z",
            "icmsPercent": 18,
            "ipiPercent": 5,
            "pisPercent": 1.65,
            "cofinsPercent": 7.60,
            "otherTaxesPercent": 0,
            "profitMarginPercent": 45
        }
        products.append(prod)

print(f"Total processados: {len(products)}")

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write('import { Product } from "../types";\n\n')
    f.write('export const pampulhaCatalogFull: Product[] = ')
    json.dump(products, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print("Arquivo data/pampulhaCatalogFull.ts gerado com sucesso!")
