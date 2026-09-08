const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

// All 34 pages parsed from OCR
const rawLines = [
  // Page 1
  { code: "2394", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE LUZ - PVC - FUNDO MÓVEL DUPLO ( FMD ) VERDE", brand: "RIB. FABRIL", pack: "45 un.", cost: 4.20 },
  { code: "2393", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE LUZ - PVC - FUNDO MÓVEL SIMPLES ( FMS ) VERDE", brand: "RIB. FABRIL", pack: "90 un.", cost: 3.90 },
  { code: "8091", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE LUZ - PVC - FUNDO MÓVEL SIMPLES ( FMS ) VERDE C/SUPORTE P/LAJE", brand: "RIB. FABRIL", pack: "1 un.", cost: 8.30 },
  { code: "2390", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE LUZ 2x4 - PVC - COR VERDE", brand: "RIB. FABRIL", pack: "180 un.", cost: 1.57 },
  { code: "5640", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE LUZ 2x4 - PVC - COR VERDE DRYWALL C/10 UNDS", brand: "RIB. FABRIL", pack: "12 un.", cost: 19.60 },
  { code: "2391", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE LUZ 3x3 - PVC - COR VERDE", brand: "RIBEIRO FABRIL", pack: "60 un.", cost: 2.40 },
  { code: "6111", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE LUZ 4x4 - PVC - COR VERDE DRYWALL C/10 UNDS", brand: "RIB. FABRIL", pack: "80 un.", cost: 39.80 },
  { code: "2392/7227", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE LUZ 4x4 - PVC - COR VERDE OU PRETA DA PIAL", brand: "RIB. FABRIL", pack: "90 un.", cost: 3.60 },
  { code: "7431", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM DE EMBUTIR PVC 10 x 10 C/TAMPA CINZA", brand: "J A", pack: "1 un.", cost: 6.30 },
  { code: "6530", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM DE EMBUTIR PVC 15 x 15 C/TAMPA BRANCA", brand: "TAF", pack: "20 un.", cost: 14.70 },
  { code: "2984", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM DE EMBUTIR PVC 15 x 15 C/TAMPA CINZA", brand: "J A", pack: "1 un.", cost: 8.70 },
  { code: "27", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM DE EMBUTIR CHAPA 15 x 15", brand: "PALOMAR", pack: "40 un.", cost: 21.40 },
  { code: "28", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM DE EMBUTIR CHAPA 20 x 20", brand: "PALOMAR", pack: "10 un.", cost: 33.80 },
  { code: "6470", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM DE EMBUTIR CHAPA 40 x 40", brand: "PALOMAR", pack: "1 un.", cost: 116.00 },
  { code: "7721", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM DE EMBUTIR PVC 20 x 20 Branca", brand: "BIKI", pack: "1 un.", cost: 36.80 },
  { code: "8008", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM DE EMBUTIR PVC 20 x 20 CINZA", brand: "RCA", pack: "1 un.", cost: 17.95 },
  { code: "5395", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM EXTERNA 15 x 15 x 8 PVC BRANCA", brand: "PERLEX", pack: "1 un.", cost: 17.90 },
  { code: "7696", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA DE PASSAGEM EXTERNA 22 x 18 x 8 PVC BRANCA", brand: "PERLEX", pack: "1 un.", cost: 31.70 },
  { code: "7386", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA EXTERNA P/INTERRUPTOR DE VENTILADOR 12CM x 7,50CM", brand: "APLACEL", pack: "1 un.", cost: 5.20 },
  { code: "2180", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA PADRÃO CEMIG C M 1 MONOFÁSICA", brand: "J S A", pack: "1 un.", cost: 99.70 },
  { code: "2181", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA PADRÃO CEMIG C M 13 MONOFÁSICA VIA PÚBLICA", brand: "J S A", pack: "1 un.", cost: 113.60 },
  { code: "1830", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA PADRÃO CEMIG C M 14 TRIFÁSICA VIA PÚBLICA", brand: "J S A", pack: "1 un.", cost: 175.80 },
  { code: "2396", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA PADRÃO CEMIG C M 2 TRIFÁSICA", brand: "J S A", pack: "1 un.", cost: 169.80 },
  { code: "2005", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA PADRÃO CEMIG C M 7 DE DERIVAÇÃO POLIFÁSICA", brand: "J S A", pack: "1 un.", cost: 167.80 },
  { code: "2006", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAIXA PADRÃO CEMIG C M 8 CHAVE GERAL", brand: "J S A", pack: "1 un.", cost: 189.00 },
  { code: "3891", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CALHA SLIM P/LÂMPADA DE LED 2 x 10W 60CM", brand: "BLUMENAU", pack: "10 un.", cost: 22.50 },
  { code: "3893", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CALHA SLIM P/LÂMPADA DE LED 2 x 20W 1,20CM", brand: "BLUMENAU", pack: "10 un.", cost: 33.70 },
  { code: "3441/3314", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAMPAINHA CIGARRA EMBUTIR 127V OU EXTERNA BRANCA 127V", brand: "BIKI", pack: "20 un.", cost: 15.90 },
  { code: "924", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAMPAINHA MUSICAL C/TERMOSTATO BRANCA 127V", brand: "BIKI", pack: "20 un.", cost: 41.00 },
  { code: "2096", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CAMPAINHA MUSICAL S/FIO C/PINO 2PÓLOS 127V", brand: "IMPORTADO", pack: "1 un.", cost: 31.80 },
  { code: "7115", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 10 x 10 (FINA) 2MTS BRANCA C/FITA DUPLA FACE", brand: "ENERBRAS", pack: "20 un.", cost: 6.90 },
  { code: "2064", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 20 x 10 - CONEXÃO COTOVELO 90º", brand: "TRAMONTINA", pack: "50 un.", cost: 1.70 },
  { code: "2060/2061", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 20 x 10 - CONEXÃO LUVA OU JUNÇÃO \"T\"", brand: "TRAMONTINA", pack: "50 un.", cost: 1.20 },
  { code: "5205", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 20 x 10 2MTS BRANCA C/FITA DUPLA FACE", brand: "ENERBRAS", pack: "30 un.", cost: 6.30 },
  { code: "2062/2063", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 20 x 10 CONEXÃO COTOVELO INTERNO OU EXTERNO", brand: "TRAMONTINA", pack: "50 un.", cost: 0.90 },

  // Page 2
  { code: "5809", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 20 x 12 2MTS BRANCA C/FITA DUPLA FACE", brand: "PIAL", pack: "30 un.", cost: 11.40 },
  { code: "PAMP-P02-02", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 40 x 15 - CONEXÕES (COTOVELOS 90º/INT./EXT./\"T\"/LUVA e LUVA P/PONTA)", brand: "ENERBRAS", pack: "25 un.", cost: 2.60 },
  { code: "8048", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 40 x 15 2MTS BRANCA C/FITA DUPLA FACE", brand: "ENEREBRÁS", pack: "10 un.", cost: 21.90 },
  { code: "5571", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 40 x 16 2MTS BRANCA C/FITA DUPLA FACE", brand: "PERLEX", pack: "10 un.", cost: 19.40 },
  { code: "PAMP-P02-05", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 50 x 20 - CONEXÕES (COTOVELOS 90º/INT./EXT./\"T\"/LUVA e LUVA P/PONTA)", brand: "ENERBRAS", pack: "25 un.", cost: 3.70 },
  { code: "7514", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 50 x 20 2MTS BRANCA C/FITA DUPLA FACE", brand: "ENERBRAS", pack: "7 un.", cost: 48.90 },
  { code: "2342", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA 50 x 20 2MTS BRANCA S/FITA DUPLA FACE", brand: "ENERBRÁS", pack: "7 un.", cost: 28.90 },
  { code: "6422", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CANALETA P/PISO 52CM x 14CM 2MTS S/FITA DUPLA FACE", brand: "ENERBRAS", pack: "7 un.", cost: 55.40 },
  { code: "1483/1482", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE BIPOLAR 10A CS-301C OU CHAVE BIPOLAR 15A CS-301B", brand: "MAR-GIRIUS", pack: "1 un.", cost: 52.80 },
  { code: "1490/1491", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE BIPOLAR 15A 14201 OU CHAVE BIPOLAR 15A C/PONTO MORTO 14203", brand: "MAR-GIRIUS", pack: "1 un.", cost: 69.00 },
  { code: "6183", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE BIPOLAR 15A ALVANCA CROMADA 14223", brand: "MAR-GIRIUS", pack: "1 un.", cost: 50.80 },
  { code: "1481", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE BIPOLAR 20A CS-301A", brand: "MAR-GIRIUS", pack: "1 un.", cost: 55.80 },
  { code: "1728", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE BIPOLAR 3A MICRO ALAVANCA METAL 17201", brand: "MAR-GIRIUS", pack: "1 un.", cost: 29.00 },
  { code: "6116", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE BÓIA 1 x 25A 250V INFERIOR / SUPERIOR CB-3001", brand: "MAR-GIRIUS", pack: "1 un.", cost: 54.40 },
  { code: "1738/1739", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE MICRO HASTE CURTA 20A MG2605 OU HASTE CURTA C/RODIZIO 20A MG2606", brand: "MAR-GIRIUS", pack: "1 un.", cost: 34.40 },
  { code: "1736/1737", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE MICRO HASTE LONGA 20A MG2603 OU HASTE LONGA C/RODIZIO 20A MG2604", brand: "MAR-GIRIUS", pack: "1 un.", cost: 56.40 },
  { code: "1741/1742", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE MICRO PINO 15A A1 40108 OU CHAVE MICRO C/HASTE 15A A2 40108", brand: "MAR-GIRIUS", pack: "1 un.", cost: 26.50 },
  { code: "1735", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE MICRO PINO BÁSICO 20A MG2601", brand: "MAR-GIRIUS", pack: "1 un.", cost: 24.20 },
  { code: "1740", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE MICRO PINO BÁSICO 20A MG2607", brand: "MAR-GIRIUS", pack: "1 un.", cost: 51.80 },
  { code: "1722", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE PORTA FUSÍVEL - ROSCA 20AG 11005/F", brand: "MAR-GIRIUS", pack: "1 un.", cost: 11.60 },
  { code: "1499", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE REVERSÃO TRIPOLAR 15A CR-501K", brand: "MAR-GIRIUS", pack: "1 un.", cost: 117.80 },
  { code: "5206", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE REVERSÃO TRIPOLAR 30A CR-603-03/F", brand: "MAR-GIRIUS", pack: "1 un.", cost: 155.80 },
  { code: "3430", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TESTE COMUM", brand: "FERTAK", pack: "12 un.", cost: 1.90 },
  { code: "6875", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TESTE DIGITAL", brand: "MEGA", pack: "1 un.", cost: 5.50 },
  { code: "1264", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TESTE/CONTINUIDADE/TENSÃO", brand: "DIVERSOS", pack: "1 un.", cost: 12.80 },
  { code: "4358", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TOMADA DE PAINEL C/3PÓLOS 10A TPA2", brand: "MAR-GIRIUS", pack: "1 un.", cost: 7.80 },
  { code: "1492", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TRIPOLAR 15A 14301", brand: "MAR-GIRIUS", pack: "1 un.", cost: 114.70 },
  { code: "1497", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TRIPOLAR 15A CS-501KS LIGA - DESLIGA", brand: "MAR-GIRIUS", pack: "1 un.", cost: 119.60 },
  { code: "1477/1478", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TRIPOLAR 20A BOTÃO PRETO/VERMELHO CS-101 OU 30A CS-101 TP/CC", brand: "MAR-GIRIUS", pack: "1 un.", cost: 76.90 },
  { code: "2074/1948", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TRIPOLAR 20A BOTÃO PRETO/VERMELHO CS-102TS OU TRIPOLAR 30A CS-102TP", brand: "MAR-GIRIUS", pack: "1 un.", cost: 59.40 },
  { code: "1479", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TRIPOLAR 20A CS-301", brand: "MAR-GIRIUS", pack: "1 un.", cost: 82.60 },
  { code: "1480", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TRIPOLAR 30A CS-301P", brand: "MAR-GIRIUS", pack: "1 un.", cost: 72.80 },
  { code: "5208", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE TRIPOLAR 30A LIGA-DESLIGA CS-603", brand: "MAR-GIRIUS", pack: "1 un.", cost: 131.70 },
  { code: "1724", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE UNIPOLAR 10A LIGA-DESLIGA 15123", brand: "MAR-GIRIUS", pack: "1 un.", cost: 25.50 },
  { code: "1726", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE UNIPOLAR 10A TECLA REDONDA PRETA 16123", brand: "MAR-GIRIUS", pack: "1 un.", cost: 12.40 },
  { code: "1495", dept: "Materiais Elétricos", cls: "Materiais Elétricos e Ferramentas", name: "CHAVE UNIPOLAR 10A TECLA RETANGULAR PRETA 16123", brand: "MAR-GIRIUS", pack: "1 un.", cost: 8.80 }
];

console.log('Total sample lines:', rawLines.length);
