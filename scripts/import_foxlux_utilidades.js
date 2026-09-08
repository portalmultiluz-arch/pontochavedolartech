import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

// Matriz dos 32 produtos do PDF FOXLUX UTILIDADES
const items = [
  // --- PÁGINA 1 (21 itens: Pilhas, Baterias, Adesivos Instantâneos, Saco para Lixo 15L) ---
  {
    code: '95.01',
    name: 'Pilha Alcalina Pequena AA (LR6) Blister com 4 Unidades Foxlux',
    shortName: 'Pilha Pequena AA (LR 6) c/ 4 un',
    tipo: 'Modelo Pequena AA (LR 6); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/4 UN / Middle 20 UN / Master 160 UN',
    ncm: '8506.10.10',
    cest: '21.053.00',
    price: 18.90,
    costPrice: 8.90,
    packagingType: 'Blister c/ 4 UN',
    material: 'Dióxido de Manganês / Zinco Alcalino',
    voltage: '1.5V'
  },
  {
    code: '95.02',
    name: 'Pilha Alcalina Pequena AA (LR6) Blister com 2 Unidades Foxlux',
    shortName: 'Pilha Pequena AA (LR 6) c/ 2 un',
    tipo: 'Modelo Pequena AA (LR 6); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/2 UN / Middle 20 UN / Master 160 UN',
    ncm: '8506.10.10',
    cest: '21.053.00',
    price: 10.90,
    costPrice: 4.90,
    packagingType: 'Blister c/ 2 UN',
    material: 'Dióxido de Manganês / Zinco Alcalino',
    voltage: '1.5V'
  },
  {
    code: '95.03',
    name: 'Pilha Alcalina Palito AAA (LR03) Blister com 4 Unidades Foxlux',
    shortName: 'Pilha Palito AAA (LR 03) c/ 4 un',
    tipo: 'Modelo Palito AAA (LR 03); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/4 UN / Middle 20 UN / Master 240 UN',
    ncm: '8506.10.10',
    cest: '21.053.00',
    price: 18.90,
    costPrice: 8.90,
    packagingType: 'Blister c/ 4 UN',
    material: 'Dióxido de Manganês / Zinco Alcalino',
    voltage: '1.5V'
  },
  {
    code: '95.04',
    name: 'Pilha Alcalina Palito AAA (LR03) Blister com 2 Unidades Foxlux',
    shortName: 'Pilha Palito AAA (LR 03) c/ 2 un',
    tipo: 'Modelo Palito AAA (LR 03); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/2 UN / Middle 20 UN / Master 240 UN',
    ncm: '8506.10.10',
    cest: '21.053.00',
    price: 10.90,
    costPrice: 4.90,
    packagingType: 'Blister c/ 2 UN',
    material: 'Dióxido de Manganês / Zinco Alcalino',
    voltage: '1.5V'
  },
  {
    code: '95.05',
    name: 'Pilha Alcalina Média C (LR14) Blister com 2 Unidades Foxlux',
    shortName: 'Pilha Média C (LR 14) c/ 2 un',
    tipo: 'Modelo Média C (LR 14); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/2 UN / Middle 12 UN / Master 96 UN',
    ncm: '8506.10.10',
    cest: '21.053.00',
    price: 22.90,
    costPrice: 10.90,
    packagingType: 'Blister c/ 2 UN',
    material: 'Dióxido de Manganês / Zinco Alcalino',
    voltage: '1.5V'
  },
  {
    code: '95.06',
    name: 'Pilha Alcalina Grande D (LR20) Blister com 2 Unidades Foxlux',
    shortName: 'Pilha Grande D (LR 20) c/ 2 un',
    tipo: 'Modelo Grande D (LR 20); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/2 UN / Middle 12 UN / Master 48 UN',
    ncm: '8506.10.10',
    cest: '21.053.00',
    price: 28.90,
    costPrice: 13.90,
    packagingType: 'Blister c/ 2 UN',
    material: 'Dióxido de Manganês / Zinco Alcalino',
    voltage: '1.5V'
  },
  {
    code: '95.07',
    name: 'Pilha Alcalina 12V (A23) Blister com 5 Unidades Foxlux',
    shortName: 'Pilha 12 V (A 23) c/ 5 un',
    tipo: 'Modelo 12 V (A 23); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 20 UN / Master 200 UN',
    ncm: '8506.80.00',
    cest: '21.054.00',
    price: 24.90,
    costPrice: 11.90,
    packagingType: 'Blister c/ 5 UN',
    material: 'Alcalina / Zinco',
    voltage: '12V'
  },
  {
    code: '95.08',
    name: 'Pilha Alcalina 9V (6LR61) Blister com 1 Unidade Foxlux',
    shortName: 'Pilha 9 V (6LR61) c/ 1 un',
    tipo: 'Modelo 9 V (6LR61); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/1 UN / Middle 10 UN / Master 240 UN',
    ncm: '8506.10.10',
    cest: '21.053.00',
    price: 19.90,
    costPrice: 9.50,
    packagingType: 'Blister c/ 1 UN',
    material: 'Dióxido de Manganês Alcalina',
    voltage: '9V'
  },
  {
    code: '95.09',
    name: 'Pilha Alcalina 12V (A27) Blister com 5 Unidades Foxlux',
    shortName: 'Pilha 12 V (A 27) c/ 5 un',
    tipo: 'Modelo 12 V (A 27); Alta performance e longa duração',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 20 UN / Master 200 UN',
    ncm: '8506.80.00',
    cest: '21.054.00',
    price: 26.90,
    costPrice: 12.90,
    packagingType: 'Blister c/ 5 UN',
    material: 'Alcalina / Zinco',
    voltage: '12V'
  },
  {
    code: '95.10',
    name: 'Bateria de Lítio Moeda 3V (CR2032) Blister com 5 Unidades Foxlux',
    shortName: 'Bateria Lítio 3V (CR2032) c/ 5 un',
    tipo: 'Modelo Lítio 3V (CR2032); Alta performance e longa duração; Indicada p/ controles de portão, alarmes, brinquedos e aparelhos auditivos',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 10 UN / Master 120 UN',
    ncm: '8506.50.10',
    cest: '21.054.00',
    price: 19.90,
    costPrice: 9.50,
    packagingType: 'Blister c/ 5 UN',
    material: 'Dióxido de Manganês Lítio (LiMnO2)',
    voltage: '3V'
  },
  {
    code: '95.11',
    name: 'Bateria de Lítio Moeda 3V (CR2016) Blister com 5 Unidades Foxlux',
    shortName: 'Bateria Lítio 3V (CR2016) c/ 5 un',
    tipo: 'Modelo Lítio 3V (CR2016); Alta performance e longa duração; Indicada p/ controles de portão, alarmes, brinquedos e aparelhos auditivos',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 10 UN / Master 120 UN',
    ncm: '8506.50.10',
    cest: '21.054.00',
    price: 19.90,
    costPrice: 9.50,
    packagingType: 'Blister c/ 5 UN',
    material: 'Dióxido de Manganês Lítio (LiMnO2)',
    voltage: '3V'
  },
  {
    code: '95.12',
    name: 'Bateria de Lítio Moeda 3V (CR2025) Blister com 5 Unidades Foxlux',
    shortName: 'Bateria Lítio 3V (CR2025) c/ 5 un',
    tipo: 'Modelo Lítio 3V (CR2025); Alta performance e longa duração; Indicada p/ controles de portão, alarmes, brinquedos e aparelhos auditivos',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 10 UN / Master 120 UN',
    ncm: '8506.50.10',
    cest: '21.054.00',
    price: 19.90,
    costPrice: 9.50,
    packagingType: 'Blister c/ 5 UN',
    material: 'Dióxido de Manganês Lítio (LiMnO2)',
    voltage: '3V'
  },
  {
    code: '95.13',
    name: 'Bateria Botão Alcalina 1,5V (LR41) Blister com 5 Unidades Foxlux',
    shortName: 'Bateria Alcalina 1,5V (LR41) c/ 5 un',
    tipo: 'Modelo Alcalina 1,5V (LR41); Alta performance e longa duração; Indicada p/ controles de portão, alarmes, brinquedos e aparelhos auditivos',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 10 UN / Master 120 UN',
    ncm: '8506.10.30',
    cest: '21.053.00',
    price: 14.90,
    costPrice: 6.90,
    packagingType: 'Blister c/ 5 UN',
    material: 'Alcalina / Zinco',
    voltage: '1.5V'
  },
  {
    code: '95.14',
    name: 'Bateria Botão Alcalina 1,5V (LR44) Blister com 5 Unidades Foxlux',
    shortName: 'Bateria Alcalina 1,5V (LR44) c/ 5 un',
    tipo: 'Modelo Alcalina 1,5V (LR44); Alta performance e longa duração; Indicada p/ controles de portão, alarmes, brinquedos e aparelhos auditivos',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 10 UN / Master 120 UN',
    ncm: '8506.10.30',
    cest: '21.053.00',
    price: 14.90,
    costPrice: 6.90,
    packagingType: 'Blister c/ 5 UN',
    material: 'Alcalina / Zinco',
    voltage: '1.5V'
  },
  {
    code: '95.18',
    name: 'Bateria Botão Alcalina 1,5V (LR54) Blister com 5 Unidades Foxlux',
    shortName: 'Bateria Alcalina 1,5V (LR54) c/ 5 un',
    tipo: 'Modelo Alcalina 1,5V (LR54); Alta performance e longa duração; Indicada p/ controles de portão, alarmes, brinquedos e aparelhos auditivos',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 10 UN / Master 120 UN',
    ncm: '8506.10.30',
    cest: '21.053.00',
    price: 14.90,
    costPrice: 6.90,
    packagingType: 'Blister c/ 5 UN',
    material: 'Alcalina / Zinco',
    voltage: '1.5V'
  },
  {
    code: '96.01',
    name: 'Adesivo Instantâneo 2g Blister com Bico de Precisão Foxlux',
    shortName: 'Adesivo Instantâneo 2g Blister',
    tipo: 'Adesivo Instantâneo 2 g; Bico de precisão; Ótima durabilidade; Secagem rápida; Indicado para metal, couro, plástico, calçado, madeira, cerâmica e artesanatos',
    embalagem: 'Unidade de venda BLISTER C/1 UN / Middle 24 UN / Master 288 UN',
    ncm: '3506.10.90',
    cest: '10.001.00',
    price: 4.90,
    costPrice: 2.10,
    packagingType: 'Blister c/ 1 UN',
    material: 'Cianoacrilato'
  },
  {
    code: '96.02',
    name: 'Adesivo Instantâneo 20g com Bico de Precisão Foxlux',
    shortName: 'Adesivo Instantâneo 20g',
    tipo: 'Adesivo Instantâneo 20 g; Bico de precisão; Ótima durabilidade; Secagem rápida; Indicado para metal, couro, plástico, calçado, madeira, cerâmica e artesanatos',
    embalagem: 'Unidade de venda 1 UN / Middle 10 UN / Master 160 UN',
    ncm: '3506.10.90',
    cest: '10.001.00',
    price: 12.90,
    costPrice: 5.90,
    packagingType: 'Frasco 1 UN',
    material: 'Cianoacrilato'
  },
  {
    code: '96.03',
    name: 'Adesivo Instantâneo 100g com Bico de Precisão Foxlux',
    shortName: 'Adesivo Instantâneo 100g',
    tipo: 'Adesivo Instantâneo 100 g; Bico de precisão; Ótima durabilidade; Secagem rápida; Indicado para metal, couro, plástico, calçado, madeira, cerâmica e artesanatos',
    embalagem: 'Unidade de venda 1 UN / Middle 5 UN / Master 160 UN',
    ncm: '3506.10.90',
    cest: '10.001.00',
    price: 38.90,
    costPrice: 18.50,
    packagingType: 'Frasco 1 UN',
    material: 'Cianoacrilato'
  },
  {
    code: '96.10',
    name: 'Adesivo Instantâneo 2g Cartela com 12 Unidades Foxlux',
    shortName: 'Adesivo Instantâneo 2g Cartela c/ 12',
    tipo: 'Adesivo Instantâneo 2 g; Bico de precisão; Ótima durabilidade; Secagem rápida; Indicado para metal, couro, plástico, calçado, madeira, cerâmica e artesanatos',
    embalagem: 'Unidade de venda CARTELA C/12 UN / Middle - / Master 30 UN',
    ncm: '3506.10.90',
    cest: '10.001.00',
    price: 39.90,
    costPrice: 19.00,
    packagingType: 'Cartela c/ 12 UN',
    material: 'Cianoacrilato'
  },
  {
    code: '96.11',
    name: 'Adesivo Instantâneo em Gel 3g Blister Foxlux',
    shortName: 'Adesivo Instantâneo Gel 3g',
    tipo: 'Adesivo Instant. Gel 3g; Fórmula gel; Recomendado para colar borracha, couro, madeira, metal, porcelana, papel e plástico; Não recomendado para tecidos, isopor, PE, PP, silicone e PTFE',
    embalagem: 'Unidade de venda BLISTER 1 UN / Middle 24 UN / Master 288 UN',
    ncm: '3506.10.90',
    cest: '10.001.00',
    price: 6.90,
    costPrice: 3.10,
    packagingType: 'Blister 1 UN',
    material: 'Cianoacrilato em Gel'
  },
  {
    code: 'UD05.01-N',
    name: 'Saco para Lixo Reforçado 15 Litros Almofada com 20 Unidades Foxlux',
    shortName: 'Saco para Lixo 15L Almofada c/ 20 un',
    tipo: 'Capacidade 15 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ALMOF. C/20 UN / Middle 25 ALMOF. / Master 100 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 7.90,
    costPrice: 3.60,
    packagingType: 'Pacote Almofada c/ 20 UN',
    material: 'Polietileno e Pigmento'
  },

  // --- PÁGINA 2 (11 itens: Sacos para Lixo) ---
  {
    code: 'UD05.02-N',
    name: 'Saco para Lixo Reforçado 30 Litros Almofada com 10 Unidades Foxlux',
    shortName: 'Saco para Lixo 30L Almofada c/ 10 un',
    tipo: 'Capacidade 30 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ALMOF. C/10 UN / Middle 25 ALMOF. / Master 100 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 8.50,
    costPrice: 3.90,
    packagingType: 'Pacote Almofada c/ 10 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.03-N',
    name: 'Saco para Lixo Reforçado 50 Litros Almofada com 10 Unidades Foxlux',
    shortName: 'Saco para Lixo 50L Almofada c/ 10 un',
    tipo: 'Capacidade 50 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ALMOF. C/10 UN / Middle 25 ALMOF. / Master 100 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 10.90,
    costPrice: 4.90,
    packagingType: 'Pacote Almofada c/ 10 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.04-N',
    name: 'Saco para Lixo Reforçado 100 Litros Almofada com 5 Unidades Foxlux',
    shortName: 'Saco para Lixo 100L Almofada c/ 5 un',
    tipo: 'Capacidade 100 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ALMOF. C/5 UN / Middle 25 ALMOF. / Master 100 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 11.90,
    costPrice: 5.40,
    packagingType: 'Pacote Almofada c/ 5 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.06-N',
    name: 'Saco para Lixo Reforçado 200 Litros Almofada com 5 Unidades Foxlux',
    shortName: 'Saco para Lixo 200L Almofada c/ 5 un',
    tipo: 'Capacidade 200 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ALMOF. C/5 UN / Middle 25 ALMOF. / Master 100 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 15.90,
    costPrice: 7.20,
    packagingType: 'Pacote Almofada c/ 5 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.09-N',
    name: 'Saco para Lixo Reforçado 15 Litros Almofada com 30 Unidades Foxlux',
    shortName: 'Saco para Lixo 15L Almofada c/ 30 un',
    tipo: 'Capacidade 15 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ALMOF. C/30 UN / Middle - / Master 50 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 11.50,
    costPrice: 5.20,
    packagingType: 'Pacote Almofada c/ 30 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.10-N',
    name: 'Saco para Lixo Reforçado em Rolo 30 Litros com 20 Unidades Foxlux',
    shortName: 'Saco para Lixo 30L Rolo c/ 20 un',
    tipo: 'Capacidade 30 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ROLO C/20 UN / Middle - / Master 50 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 14.90,
    costPrice: 6.80,
    packagingType: 'Rolo c/ 20 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.11-N',
    name: 'Saco para Lixo Reforçado em Rolo 50 Litros com 20 Unidades Foxlux',
    shortName: 'Saco para Lixo 50L Rolo c/ 20 un',
    tipo: 'Capacidade 50 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ROLO C/20 UN / Middle - / Master 50 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 18.90,
    costPrice: 8.50,
    packagingType: 'Rolo c/ 20 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.12-N',
    name: 'Saco para Lixo Reforçado em Rolo 100 Litros com 10 Unidades Foxlux',
    shortName: 'Saco para Lixo 100L Rolo c/ 10 un',
    tipo: 'Capacidade 100 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ROLO C/10 UN / Middle - / Master 40 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 19.90,
    costPrice: 9.20,
    packagingType: 'Rolo c/ 10 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.20-N',
    name: 'Saco para Lixo Reforçado em Rolo 105 Litros com 5 Unidades Foxlux',
    shortName: 'Saco para Lixo 105L Rolo c/ 5 un',
    tipo: 'Capacidade 105 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda ROLO C/5 UN / Middle 10 ALMOF. / Master 50 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 13.90,
    costPrice: 6.20,
    packagingType: 'Rolo c/ 5 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.21-N',
    name: 'Saco para Lixo Reforçado 200 Litros Blister com 5 Unidades Foxlux',
    shortName: 'Saco para Lixo 200L Blister c/ 5 un',
    tipo: 'Capacidade 200 Litros; Composição polietileno e pigmento; Modelo reforçado',
    embalagem: 'Unidade de venda BLISTER C/5 UN / Middle 10 ALMOF. / Master 50 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 16.90,
    costPrice: 7.80,
    packagingType: 'Blister c/ 5 UN',
    material: 'Polietileno e Pigmento'
  },
  {
    code: 'UD05.22-N',
    name: 'Saco para Lixo Reforçado 15 Litros Blister com 20 Unidades Cozinha e Banheiro Foxlux',
    shortName: 'Saco para Lixo 15L Blister c/ 20 un',
    tipo: 'Capacidade 15 Litros; Composição polietileno e pigmento; Modelo reforçado; Uso ideal para cozinha e banheiro',
    embalagem: 'Unidade de venda BLISTER C/20 UN / Middle 25 ALMOF. / Master 100 ALMOF.',
    ncm: '3923.21.90',
    cest: '10.027.00',
    price: 8.90,
    costPrice: 3.90,
    packagingType: 'Blister c/ 20 UN',
    material: 'Polietileno e Pigmento'
  }
];

async function runImport() {
  console.log(`Iniciando importação de ${items.length} produtos Foxlux Utilidades...`);

  // Carrega produtos existentes de data/products.ts
  let existingProducts = [];
  try {
    const rawTs = fs.readFileSync('./data/products.ts', 'utf8');
    const jsonMatch = rawTs.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
    if (jsonMatch) {
      existingProducts = JSON.parse(jsonMatch[1]);
    }
  } catch (err) {
    console.warn('Não foi possível ler produtos existentes de data/products.ts:', err.message);
  }

  const existingMap = new Map();
  existingProducts.forEach(p => existingMap.set(p.id, p));

  const importedFoxluxUtilidades = [];

  for (const item of items) {
    const docId = `prod_foxlux_utilidades_${item.code.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    const payload = {
      id: docId,
      code: item.code,
      sku: `SKU-FOXLUX-${item.code}`,
      name: item.name,
      category: 'Utilidades',
      department: 'Materiais Elétricos Foxlux',
      productClass: 'Utilidades',
      description: `${item.name}. Especificações: ${item.tipo}. Embalagem: ${item.embalagem}. Codificação tributária legal: NCM ${item.ncm}, CEST ${item.cest}, CFOP 5102, CST 102, ICMS 18%, IPI 5%, PIS 0.65%, COFINS 3.00%.`,
      price: item.price,
      costPrice: item.costPrice,
      stock: 0, // CRÍTICO: Quantidade do produto no estoque igual a zero
      minStock: 5,
      packagingType: item.packagingType,
      material: item.material,
      voltage: item.voltage || 'Não se aplica',
      imageUrl: '/ponto_chave_logo.jpg', // CRÍTICO: Imagem padrão Ponto Chave do Lar
      gallery: ['/ponto_chave_logo.jpg'],
      isActive: true,
      showInStore: false, // CRÍTICO: Não ativo para exibição na página principal
      isImported: true,
      importBatchId: 'batch_foxlux_utilidades_20260830',
      importBatchName: 'Importação PDF Foxlux Utilidades (30/08/2026)',
      importedAt: '2026-08-30T12:00:00.000Z',
      purchaseDate: '2026-08-30', // CRÍTICO: Data de cadastro de hoje
      invoiceNumber: 'PDF-FOXLUX-UTILIDADES-20260830',
      supplierName: 'Foxlux Utilidades & Materiais Elétricos',
      icmsPercent: 18,
      ipiPercent: 5,
      pisPercent: 0.65,
      cofinsPercent: 3.00,
      otherTaxesPercent: 0,
      profitMarginPercent: 45,
      technicalSpecs: `NCM: ${item.ncm} | CEST: ${item.cest} | CFOP: 5102 | CST: 102 | ICMS: 18% | IPI: 5% | PIS: 0.65% | COFINS: 3.00% | Embalagem: ${item.embalagem} | Linha: Foxlux Utilidades | Departamento: Materiais Elétricos Foxlux | Fornecedor: Foxlux Utilidades & Materiais Elétricos`
    };

    importedFoxluxUtilidades.push(payload);
    existingMap.set(docId, payload);

    // Salva no Firestore
    await setDoc(doc(db, 'products', docId), payload);
    console.log(`Produto gravado no Firestore: [${item.code}] ${item.name}`);
  }

  console.log(`Firestore atualizado com sucesso com os ${importedFoxluxUtilidades.length} produtos Foxlux Utilidades!`);

  // Salva no data/products.ts reunindo todos os produtos
  const allProducts = Array.from(existingMap.values());
  const tsContent = `import type { Product } from '../types';\n\nexport const products: Product[] = ${JSON.stringify(allProducts, null, 2)};\n`;
  fs.writeFileSync('./data/products.ts', tsContent, 'utf8');
  console.log(`Arquivo data/products.ts atualizado com ${allProducts.length} produtos no total!`);

  process.exit(0);
}

runImport().catch(err => {
  console.error('Erro na importação Foxlux Utilidades:', err);
  process.exit(1);
});
