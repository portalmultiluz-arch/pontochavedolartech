import csv
import os

os.makedirs('public/modelos', exist_ok=True)
csv_file = 'public/modelos/material_eletrico_pampulha.csv'

# Escreve cabeçalho oficial
with open(csv_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Código', 'Departamento', 'Classe', 'Produto', 'Tipo', 'Embalagem', 'Preço (R$)'])

print("Cabeçalho CSV criado com sucesso.")
