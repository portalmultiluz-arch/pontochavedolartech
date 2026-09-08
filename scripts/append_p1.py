import csv

rows = [
    # Página 1
    ["2394", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE LUZ - PVC - FUNDO MÓVEL DUPLO ( FMD ) VERDE", "RIB. FABRIL", "45 un.", "4,20"],
    ["2393", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE LUZ - PVC - FUNDO MÓVEL SIMPLES ( FMS ) VERDE", "RIB. FABRIL", "90 un.", "3,90"],
    ["8091", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE LUZ - PVC - FUNDO MÓVEL SIMPLES ( FMS ) VERDE C/SUPORTE P/LAJE", "RIB. FABRIL", "1 un.", "8,30"],
    ["2390", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE LUZ 2x4 - PVC - COR VERDE", "RIB. FABRIL", "180 un.", "1,57"],
    ["5640", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE LUZ 2x4 - PVC - COR VERDE DRYWALL C/10 UNDS", "RIB. FABRIL", "12 un.", "19,60"],
    ["2391", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE LUZ 3x3 - PVC - COR VERDE", "RIBEIRO FABRIL", "60 un.", "2,40"],
    ["6111", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE LUZ 4x4 - PVC - COR VERDE DRYWALL C/10 UNDS", "RIB. FABRIL", "80 un.", "39,80"],
    ["2392/7227", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE LUZ 4x4 - PVC - COR VERDE OU PRETA DA PIAL", "RIB. FABRIL", "90 un.", "3,60"],
    ["7431", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM DE EMBUTIR PVC 10 x 10 C/TAMPA CINZA", "J A", "1 un.", "6,30"],
    ["6530", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM DE EMBUTIR PVC 15 x 15 C/TAMPA BRANCA", "TAF", "20 un.", "14,70"],
    ["2984", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM DE EMBUTIR PVC 15 x 15 C/TAMPA CINZA", "J A", "1 un.", "8,70"],
    ["27", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM DE EMBUTIR CHAPA 15 x 15", "PALOMAR", "40 un.", "21,40"],
    ["28", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM DE EMBUTIR CHAPA 20 x 20", "PALOMAR", "10 un.", "33,80"],
    ["6470", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM DE EMBUTIR CHAPA 40 x 40", "PALOMAR", "1 un.", "116,00"],
    ["7721", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM DE EMBUTIR PVC 20 x 20 Branca", "BIKI", "1 un.", "36,80"],
    ["8008", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM DE EMBUTIR PVC 20 x 20 CINZA", "RCA", "1 un.", "17,95"],
    ["5395", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM EXTERNA 15 x 15 x 8 PVC BRANCA", "PERLEX", "1 un.", "17,90"],
    ["7696", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA DE PASSAGEM EXTERNA 22 x 18 x 8 PVC BRANCA", "PERLEX", "1 un.", "31,70"],
    ["7386", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA EXTERNA P/INTERRUPTOR DE VENTILADOR 12CM x 7,50CM", "APLACEL", "1 un.", "5,20"],
    ["2180", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA PADRÃO CEMIG C M 1 MONOFÁSICA", "J S A", "1 un.", "99,70"],
    ["2181", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA PADRÃO CEMIG C M 13 MONOFÁSICA VIA PÚBLICA", "J S A", "1 un.", "113,60"],
    ["1830", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA PADRÃO CEMIG C M 14 TRIFÁSICA VIA PÚBLICA", "J S A", "1 un.", "175,80"],
    ["2396", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA PADRÃO CEMIG C M 2 TRIFÁSICA", "J S A", "1 un.", "169,80"],
    ["2005", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA PADRÃO CEMIG C M 7 DE DERIVAÇÃO POLIFÁSICA", "J S A", "1 un.", "167,80"],
    ["2006", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAIXA PADRÃO CEMIG C M 8 CHAVE GERAL", "J S A", "1 un.", "189,00"],
    ["3891", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CALHA SLIM P/LÂMPADA DE LED 2 x 10W 60CM", "BLUMENAU", "10 un.", "22,50"],
    ["3893", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CALHA SLIM P/LÂMPADA DE LED 2 x 20W 1,20CM", "BLUMENAU", "10 un.", "33,70"],
    ["3441/3314", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAMPAINHA CIGARRA EMBUTIR 127V OU EXTERNA BRANCA 127V", "BIKI", "20 un.", "15,90"],
    ["924", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAMPAINHA MUSICAL C/TERMOSTATO BRANCA 127V", "BIKI", "20 un.", "41,00"],
    ["2096", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CAMPAINHA MUSICAL S/FIO C/PINO 2PÓLOS 127V", "IMPORTADO", "1 un.", "31,80"],
    ["7115", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CANALETA 10 x 10 (FINA) 2MTS BRANCA C/FITA DUPLA FACE", "ENERBRAS", "20 un.", "6,90"],
    ["2064", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CANALETA 20 x 10 - CONEXÃO COTOVELO 90º", "TRAMONTINA", "50 un.", "1,70"],
    ["2060/2061", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CANALETA 20 x 10 - CONEXÃO LUVA OU JUNÇÃO \"T\"", "TRAMONTINA", "50 un.", "1,20"],
    ["5205", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CANALETA 20 x 10 2MTS BRANCA C/FITA DUPLA FACE", "ENERBRAS", "30 un.", "6,30"],
    ["2062/2063", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CANALETA 20 x 10 CONEXÃO COTOVELO INTERNO OU EXTERNO", "TRAMONTINA", "50 un.", "0,90"],
    ["5809", "Materiais Elétricos PAMPULHA", "Materiais Elétricos e Ferramentas", "CANALETA 20 x 12 2MTS BRANCA C/FITA DUPLA FACE", "PIAL", "30 un.", "11,40"]
]

with open('public/modelos/material_eletrico_pampulha.csv', 'a', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(f"Página 1 adicionada: {len(rows)} itens.")
