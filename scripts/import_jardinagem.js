import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

// Matriz completa dos 99 produtos do PDF Famastil Jardinagem
// Formato: [code, name, tipo, embalagem, ncm, cest, price, costPrice, packagingType, material]
const items = [
  // --- PÁGINA 1 (25 itens: Mangueiras, Suporte e Conexões) ---
  [
    'F90.04',
    'Mangueira Trançada Laranja - Kit Mangueira 10 m',
    'Diâmetro 1/2" x 2,0 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    49.90,
    24.50,
    'Rolo',
    'PVC'
  ],
  [
    'F90.01',
    'Mangueira Trançada Laranja - Kit Mangueira 15 m',
    'Diâmetro 1/2" x 2,0 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    64.90,
    31.80,
    'Rolo',
    'PVC'
  ],
  [
    'F90.02',
    'Mangueira Trançada Laranja - Kit Mangueira 20 m',
    'Diâmetro 1/2" x 2,0 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    79.90,
    39.20,
    'Rolo',
    'PVC'
  ],
  [
    'F90.03',
    'Mangueira Trançada Laranja - Kit Mangueira 30 m',
    'Diâmetro 1/2" x 2,0 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    109.90,
    53.90,
    'Rolo',
    'PVC'
  ],
  [
    'F90.35',
    'Mangueira Trançada Laranja - Trançada 50 m',
    'Diâmetro 3/4" x 2,5 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    229.90,
    112.50,
    'Rolo',
    'PVC'
  ],
  [
    'F90.05',
    'Mangueira Trançada Laranja - Trançada 100 m',
    'Diâmetro 1/2" x 2,0 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Bobina',
    '3917.39.00',
    '10.015.00',
    289.90,
    142.00,
    'Bobina',
    'PVC'
  ],
  [
    'F90.36',
    'Mangueira Trançada Laranja - Trançada 100 m (3/4")',
    'Diâmetro 3/4" x 2,5 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Bobina',
    '3917.39.00',
    '10.015.00',
    429.90,
    210.00,
    'Bobina',
    'PVC'
  ],
  [
    'F90.06',
    'Mangueira Trançada Laranja - Trançada 200 m',
    'Diâmetro 1/2" x 2,0 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Bobina',
    '3917.39.00',
    '10.015.00',
    549.90,
    269.00,
    'Bobina',
    'PVC'
  ],
  [
    'F90.10',
    'Mangueira Trançada Laranja - Trançada 300 m',
    'Diâmetro 1/2" x 2,0 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Bobina',
    '3917.39.00',
    '10.015.00',
    799.90,
    391.00,
    'Bobina',
    'PVC'
  ],
  [
    'F90.60',
    'Mangueira Trançada Laranja - Kit com Suporte 20 m',
    'Diâmetro 1/2" x 2,0 mm; Cor Laranja; Fabricação própria; PVC 100% virgem; Tripla camada de proteção (PVC flexível, malha de poliéster, PVC siliconado)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    99.90,
    48.90,
    'Kit',
    'PVC'
  ],
  [
    'F90.40',
    'Mangueira Trançada Verde - Kit Mangueira 10 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; PVC 100% virgem; Modelo mais fino; Tripla camada de proteção',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    39.90,
    19.50,
    'Rolo',
    'PVC'
  ],
  [
    'F90.41',
    'Mangueira Trançada Verde - Kit Mangueira 15 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; PVC 100% virgem; Modelo mais fino; Tripla camada de proteção',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    52.90,
    25.90,
    'Rolo',
    'PVC'
  ],
  [
    'F90.42',
    'Mangueira Trançada Verde - Kit Mangueira 20 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; PVC 100% virgem; Modelo mais fino; Tripla camada de proteção',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    65.90,
    32.20,
    'Rolo',
    'PVC'
  ],
  [
    'F90.43',
    'Mangueira Trançada Verde - Kit Mangueira 30 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; PVC 100% virgem; Modelo mais fino; Tripla camada de proteção',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    89.90,
    44.00,
    'Rolo',
    'PVC'
  ],
  [
    'F90.39',
    'Mangueira Trançada Verde - Mangueira 50 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; PVC 100% virgem; Modelo mais fino; Tripla camada de proteção',
    'Unidade de venda: Bobina',
    '3917.39.00',
    '10.015.00',
    139.90,
    68.50,
    'Bobina',
    'PVC'
  ],
  [
    'F90.44',
    'Mangueira Trançada Verde - Trançada 100 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; PVC 100% virgem; Modelo mais fino; Tripla camada de proteção',
    'Unidade de venda: Bobina',
    '3917.39.00',
    '10.015.00',
    249.90,
    122.50,
    'Bobina',
    'PVC'
  ],
  [
    'F90.45',
    'Mangueira Trançada Verde - Trançada 200 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; PVC 100% virgem; Modelo mais fino; Tripla camada de proteção',
    'Unidade de venda: Bobina',
    '3917.39.00',
    '10.015.00',
    469.90,
    230.00,
    'Bobina',
    'PVC'
  ],
  [
    'F90.46',
    'Mangueira Trançada Verde - Trançada 300 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; PVC 100% virgem; Modelo mais fino; Tripla camada de proteção',
    'Unidade de venda: Bobina',
    '3917.39.00',
    '10.015.00',
    679.90,
    333.00,
    'Bobina',
    'PVC'
  ],
  [
    'F90.47',
    'Mangueira Lisa - Kit Mangueira 10 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; Produto nacional; Dupla camada de proteção (PVC flexível e PVC cristal)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    32.90,
    16.10,
    'Rolo',
    'PVC'
  ],
  [
    'F90.48',
    'Mangueira Lisa - Kit Mangueira 15 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; Produto nacional; Dupla camada de proteção (PVC flexível e PVC cristal)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    44.90,
    22.00,
    'Rolo',
    'PVC'
  ],
  [
    'F90.49',
    'Mangueira Lisa - Kit Mangueira 20 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; Produto nacional; Dupla camada de proteção (PVC flexível e PVC cristal)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    56.90,
    27.90,
    'Rolo',
    'PVC'
  ],
  [
    'F90.50',
    'Mangueira Lisa - Kit Mangueira 30 m',
    'Diâmetro 7/16" x 1,5 mm; Cor Verde; Fabricação própria; Produto nacional; Dupla camada de proteção (PVC flexível e PVC cristal)',
    'Unidade de venda: Rolo',
    '3917.39.00',
    '10.015.00',
    79.90,
    39.10,
    'Rolo',
    'PVC'
  ],
  [
    'F89.82',
    'Suporte para Mangueira',
    'Produzido em plástico resistente; Prático e fácil de instalar; Guarda a mangueira corretamente',
    'Master 6 UN',
    '3926.90.90',
    '10.015.00',
    19.90,
    9.70,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.70',
    'Conexão 1/2" para Torneira',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/1 UN / Master 150 UN',
    '3917.40.90',
    '10.015.00',
    6.50,
    3.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.71',
    'Conexão 1/2" para Torneira (Pacote c/ 10 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/10 UN / Master 20 UN',
    '3917.40.90',
    '10.015.00',
    49.90,
    24.50,
    'Pacote',
    'Plástico'
  ],

  // --- PÁGINA 2 (30 itens: Conexões, Engates, Esguichos, Pistolas e Irrigadores) ---
  [
    'F89.72',
    'Conexão Engate Rápido 1/2" (Pacote c/ 10 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/10 UN / Master 20 UN',
    '3917.40.90',
    '10.015.00',
    69.90,
    34.20,
    'Pacote',
    'Plástico'
  ],
  [
    'F89.73',
    'Conexão Engate Rápido 1/2"',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/1 UN / Master 150 UN',
    '3917.40.90',
    '10.015.00',
    8.90,
    4.30,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.89',
    'Conexão Engate Rápido 1/2" (Pote c/ 50 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: POTE C/50 UN / Master 8 UN',
    '3917.40.90',
    '10.015.00',
    299.90,
    146.90,
    'Lote',
    'Plástico'
  ],
  [
    'F89.64',
    'Engate Rápido 1/2"',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/1 UN / Master 150 UN',
    '3917.40.90',
    '10.015.00',
    9.90,
    4.80,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.63',
    'Engate Rápido 1/2" (Pacote c/ 10 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/10 UN / Master 20 UN',
    '3917.40.90',
    '10.015.00',
    79.90,
    39.10,
    'Pacote',
    'Plástico'
  ],
  [
    'F89.91',
    'Engate Rápido 1/2" (Pote c/ 40 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: POTE C/40 UN / Master 6 UN',
    '3917.40.90',
    '10.015.00',
    289.90,
    142.00,
    'Lote',
    'Plástico'
  ],
  [
    'F89.67',
    'Engate Rápido Stop 1/2"',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/1 UN / Master 150 UN',
    '3917.40.90',
    '10.015.00',
    11.50,
    5.60,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.66',
    'Engate Rápido Stop 1/2" (Pacote c/ 10 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/10 UN / Master 20 UN',
    '3917.40.90',
    '10.015.00',
    92.90,
    45.50,
    'Pacote',
    'Plástico'
  ],
  [
    'F89.93',
    'Engate Rápido Stop 1/2" (Pote c/ 40 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: POTE C/40 UN / Master 6 UN',
    '3917.40.90',
    '10.015.00',
    329.90,
    161.60,
    'Lote',
    'Plástico'
  ],
  [
    'F89.68',
    'Reparador para Mangueira 1/2"',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/1 UN / Master 150 UN',
    '3917.40.90',
    '10.015.00',
    7.90,
    3.80,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.69',
    'Reparador para Mangueira 1/2" (Pacote c/ 10 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/10 UN / Master 20 UN',
    '3917.40.90',
    '10.015.00',
    62.90,
    30.80,
    'Pacote',
    'Plástico'
  ],
  [
    'F89.94',
    'Reparador para Mangueira 1/2" (Pote c/ 50 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: POTE C/50 UN / Master 6 UN',
    '3917.40.90',
    '10.015.00',
    269.90,
    132.20,
    'Lote',
    'Plástico'
  ],
  [
    'F89.77',
    'Derivação em Y Engate Rápido 1/2"',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/1 UN / Master 150 UN',
    '3917.40.90',
    '10.015.00',
    12.90,
    6.30,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.78',
    'Derivação em Y Engate Rápido 1/2" (Pacote c/ 10 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: PCT C/10 UN / Master 20 UN',
    '3917.40.90',
    '10.015.00',
    104.90,
    51.40,
    'Pacote',
    'Plástico'
  ],
  [
    'F89.79',
    'Derivação em Y Engate Rápido 1/2" (Pote c/ 40 UN)',
    'Plástico resistente; Linha completa de acessórios e conexões para mangueiras',
    'Unidade de venda: POTE C/40 UN / Master 8 UN',
    '3917.40.90',
    '10.015.00',
    379.90,
    186.00,
    'Lote',
    'Plástico'
  ],
  [
    'F89.16',
    'Esguicho para Jardim',
    'Com sistema de bloqueio de água; Plástico de alta resistência; Terminal de engate rápido',
    'Unidade de venda: PCT C/1 UN / Master 20 UN',
    '8424.20.00',
    '08.012.00',
    14.90,
    7.30,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.15',
    'Esguicho para Jardim (Pacote c/ 10 UN)',
    'Com sistema de bloqueio de água; Plástico de alta resistência; Terminal de engate rápido',
    'Unidade de venda: PCT C/10 UN / Master 15 UN',
    '8424.20.00',
    '08.012.00',
    119.90,
    58.70,
    'Pacote',
    'Plástico'
  ],
  [
    'F89.95',
    'Esguicho para Jardim (Pote c/ 25 UN)',
    'Com sistema de bloqueio de água; Plástico de alta resistência; Terminal de engate rápido',
    'Unidade de venda: POTE C/25 UN / Master 6 UN',
    '8424.20.00',
    '08.012.00',
    289.90,
    142.00,
    'Lote',
    'Plástico'
  ],
  [
    'F89.18',
    'Esguicho Jet em Alumínio 1/2"',
    'Alumínio, engate rápido; 1/2"; Composição alumínio e PVC; Economiza até 70% de água; C/ponteira dupla; Terminal engate rápido 1/2"',
    'Master 12 UN',
    '8424.20.00',
    '08.012.00',
    36.90,
    18.00,
    'Unidade',
    'Alumínio'
  ],
  [
    'F89.12',
    'Pistola para Jardim 12"',
    '12"; Sistema de bloqueio de água; Com trava; Controle de jato forte e suave; Terminal de engate rápido',
    'Middle 6 UN / Master 120 UN',
    '8424.20.00',
    '08.012.00',
    28.90,
    14.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.30',
    'Irrigador Oscilante',
    'Conexão por engate rápido; Permite irrigar áreas retangulares; Ajuste de ângulo até 180°',
    'Master 6 UN',
    '8424.82.21',
    '01.015.00',
    79.90,
    39.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.01',
    'Ducha para Jardim 5 Funções',
    '5 funções (chuva, fino forte, leque, força máxima, névoa); Regulagem de água/pressão; Terminal de engate rápido; Cabo anatômico; Com trava',
    'Middle 12 UN / Master 48 UN',
    '8424.20.00',
    '08.012.00',
    34.90,
    17.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.02',
    'Ducha para Jardim 8 Funções',
    '8 funções (chuva, ducha/chuveiro, círculo, jato, jato cônico, névoa, leque, triângulo); Regulagem de água/pressão; Terminal de engate rápido; Cabo anatômico; Com trava',
    'Middle 12 UN / Master 48 UN',
    '8424.20.00',
    '08.012.00',
    42.90,
    21.00,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.03',
    'Pistola Jato Alta Pressão 6 Funções',
    '6 funções (direcionável, névoa, cônico, leque, vertical, ducha); Bico regulável; Gatilho com trava de segurança; Plástico ABS de alta resistência; Conexão 1/2" engate rápido',
    'Master 20 UN',
    '8424.20.00',
    '08.012.00',
    46.90,
    23.00,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.50',
    'Kit para Jardim com Esguicho',
    'Contém: 1 esguicho com jato regulável, 1 conexão para torneira, 2 engates rápidos',
    'Middle 12 UN / Master 48 UN',
    '8424.20.00',
    '08.012.00',
    32.90,
    16.10,
    'Kit',
    'Plástico'
  ],
  [
    'F89.51',
    'Kit para Jardim com Ducha 8 Funções',
    'Contém: 1 ducha 8 funções, 1 conexão para torneira, 2 engates rápidos',
    'Middle 12 UN / Master 48 UN',
    '8424.20.00',
    '08.012.00',
    54.90,
    26.90,
    'Kit',
    'Plástico'
  ],
  [
    'F89.32',
    'Aspersor de Irrigação',
    'Fabricação própria; Terminal de engate rápido; Livre de manutenção (sem partes mecânicas); Jato de até 5m de diâmetro; Baixa pressão de água',
    'Middle 6 UN / Master 72 UN',
    '8424.82.21',
    '01.015.00',
    16.90,
    8.20,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.22',
    'Irrigador Setorial',
    'Terminal de engate rápido; Permite ajuste de ângulo de atuação; Espiga para fixação no solo; Saída para conexão 1/2"',
    'Middle 25 UN / Master 100 UN',
    '8424.82.21',
    '01.015.00',
    26.90,
    13.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.25',
    'Irrigador Giratório Espiga',
    'Leve e resistente; Cabeçote giratório 360°; Espiga para fixação no solo; Terminal de engate rápido; Saída para conexão 1/2"',
    'Middle 25 UN / Master 100 UN',
    '8424.82.21',
    '01.015.00',
    29.90,
    14.60,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.33',
    'Irrigador Giratório em Alumínio 1/2"',
    '1/2" alumínio, engate rápido; Composição alumínio e PVC; Duas hastes c/3 jatos d\'água cada; Suporte de alumínio; Altura 40 cm; Produto nacional',
    'Master 15 UN',
    '8424.82.21',
    '01.015.00',
    68.90,
    33.70,
    'Unidade',
    'Alumínio'
  ],

  // --- PÁGINA 3 (25 itens: Irrigadores, Regadores, Pulverizadores, Ancinhos e Vassouras Metálicas/Plásticas) ---
  [
    'F89.31',
    'Irrigador Flor',
    'Design diferenciado; Espiga para fixação no solo; Terminal de engate rápido; Saída para conexão 1/2"',
    'Master 48 UN',
    '8424.82.21',
    '01.015.00',
    22.90,
    11.20,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.29',
    'Irrigador 5 Funções',
    '5 funções: círculo, semicírculo, ducha, semiducha e duplo jato; Fica sobre o gramado; Terminal de engate rápido',
    'Middle 8 UN / Master 16 UN',
    '8424.82.21',
    '01.015.00',
    38.90,
    19.00,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.28',
    'Irrigador Giratório com Base Móvel',
    'Com base móvel; Terminal de engate rápido; Três pontos de irrigação; Saída para conexão 1/2"; Rotação de 360°',
    'Middle 20 UN / Master 40 UN',
    '8424.82.21',
    '01.015.00',
    34.90,
    17.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.45',
    'Regador de Plástico 2 L',
    'Capacidade 2 L; Bico chuveiro removível; Bicos fechados, corte as pontas conforme necessidade; Formato anatômico; Polietileno de alta densidade',
    'Master 12 UN',
    '3926.90.90',
    '10.015.00',
    18.90,
    9.20,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.42',
    'Regador de Plástico 4,5 L',
    'Capacidade 4,5 L; Bico chuveiro removível; Bicos fechados, corte as pontas conforme necessidade; Formato anatômico; Polietileno de alta densidade',
    'Master 6 UN',
    '3926.90.90',
    '10.015.00',
    26.90,
    13.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.43',
    'Regador de Plástico 8 L',
    'Capacidade 8 L; Bico chuveiro removível; Bicos fechados, corte as pontas conforme necessidade; Formato anatômico; Polietileno de alta densidade',
    'Master 6 UN',
    '3926.90.90',
    '10.015.00',
    34.90,
    17.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F89.44',
    'Regador de Plástico 13 L',
    'Capacidade 13 L; Bico chuveiro removível; Bicos fechados, corte as pontas conforme necessidade; Formato anatômico; Polietileno de alta densidade',
    'Master 6 UN',
    '3926.90.90',
    '10.015.00',
    44.90,
    22.00,
    'Unidade',
    'Plástico'
  ],
  [
    'F88.04',
    'Pulverizador Costal 12 L',
    'Capacidade 12 L; Sistema de compressão prévia; Sistema de acionamento por alavanca; Uso agrícola; Alças resistentes em nylon trançado; Inclui filtro',
    'Master 2 UN',
    '8424.41.00',
    '01.015.00',
    179.90,
    88.00,
    'Unidade',
    'Plástico'
  ],
  [
    'F88.05',
    'Pulverizador Costal 20 L',
    'Capacidade 20 L; Sistema de compressão prévia; Sistema de acionamento por alavanca; Uso agrícola; Alças resistentes em nylon trançado; Inclui filtro',
    'Master 3 UN',
    '8424.41.00',
    '01.015.00',
    219.90,
    107.50,
    'Unidade',
    'Plástico'
  ],
  [
    'F88.02',
    'Pulverizador de Compressão Prévia 2 L',
    'Capacidade 2 L; Fabricação própria; Bomba de compressão; Corpo plástico; Spray regulável para esguicho ou névoa; Gatilho com trava; Ponteira de bronze',
    'Middle 6 UN / Master 18 UN',
    '8424.41.00',
    '01.015.00',
    49.90,
    24.50,
    'Unidade',
    'Plástico'
  ],
  [
    'F88.03',
    'Pulverizador de Compressão Prévia 5 L',
    'Capacidade 5 L; Bico com jato regulável (spray, cone ou jato contínuo); Ampla boca de abastecimento; Alças resistentes; Bombeamento com pistão metálico interno',
    'Master 6 UN',
    '8424.41.00',
    '01.015.00',
    98.90,
    48.40,
    'Unidade',
    'Plástico'
  ],
  [
    'F88.01',
    'Pulverizador Manual 500 mL Laranja',
    'Capacidade 500 mL; Cor laranja; Fabricação própria; Jato regulável: esguicho ou névoa; Aplicação manual; Material plástico',
    'Middle 6 UN / Master 24 UN',
    '8424.20.00',
    '08.012.00',
    14.90,
    7.30,
    'Unidade',
    'Plástico'
  ],
  [
    'F88.06',
    'Pulverizador Manual 500 mL Incolor',
    'Capacidade 500 mL; Cor incolor; Jato regulável: esguicho ou névoa; Aplicação manual; Material plástico',
    'Middle 6 UN / Master 24 UN',
    '8424.20.00',
    '08.012.00',
    14.90,
    7.30,
    'Unidade',
    'Plástico'
  ],
  [
    'F81.01',
    'Ancinho 12 Dentes com Cabo',
    '12 dentes; Cor laranja; Cabo acompanha (rosqueável); Fabricação própria; Produzido em Aço SAE 1010/1020; Alta durabilidade',
    'Master 6 UN',
    '8201.30.00',
    '08.012.00',
    42.90,
    21.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F81.02',
    'Ancinho 14 Dentes com Cabo',
    '14 dentes; Cor laranja; Cabo acompanha (rosqueável); Fabricação própria; Produzido em Aço SAE 1010/1020; Alta durabilidade',
    'Master 6 UN',
    '8201.30.00',
    '08.012.00',
    46.90,
    23.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F81.03',
    'Ancinho 16 Dentes com Cabo',
    '16 dentes; Cor laranja; Cabo acompanha (rosqueável); Fabricação própria; Produzido em Aço SAE 1010/1020; Alta durabilidade',
    'Master 6 UN',
    '8201.30.00',
    '08.012.00',
    49.90,
    24.50,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F80.06',
    'Vassoura Metálica 18 Dentes Regulável (Arame)',
    '18 dentes (Arame); Modelo Regulável; Cabo acompanha; Fabricação própria; Aço SAE 1055; Pintura epóxi de alta resistência',
    'Middle 6 UN / Master 24 UN',
    '8201.30.00',
    '08.012.00',
    38.90,
    19.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F80.07',
    'Vassoura Metálica 18 Dentes Fixa (Arame)',
    '18 dentes (Arame); Modelo Fixa; Cabo acompanha; Fabricação própria; Aço SAE 1055; Pintura epóxi de alta resistência',
    'Middle 6 UN / Master 24 UN',
    '8201.30.00',
    '08.012.00',
    34.90,
    17.10,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F80.04',
    'Vassoura Metálica 22 Dentes Regulável (Arame)',
    '22 dentes (Arame); Modelo Regulável; Cabo acompanha; Fabricação própria; Aço SAE 1055; Pintura epóxi de alta resistência',
    'Middle 6 UN / Master 24 UN',
    '8201.30.00',
    '08.012.00',
    44.90,
    22.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F80.05',
    'Vassoura Metálica 22 Dentes Fixa (Arame)',
    '22 dentes (Arame); Modelo Fixa; Cabo acompanha; Fabricação própria; Aço SAE 1055; Pintura epóxi de alta resistência',
    'Middle 6 UN / Master 24 UN',
    '8201.30.00',
    '08.012.00',
    39.90,
    19.50,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F80.02',
    'Vassoura Metálica 22 Dentes Regulável (Palheta)',
    '22 dentes (Palheta); Modelo Regulável; Cabo acompanha; Fabricação própria; Aço SAE 1055; Pintura epóxi de alta resistência',
    'Middle 6 UN / Master 24 UN',
    '8201.30.00',
    '08.012.00',
    46.90,
    23.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F80.03',
    'Vassoura Metálica 22 Dentes Fixa (Palheta)',
    '22 dentes (Palheta); Modelo Fixa; Cabo acompanha; Fabricação própria; Aço SAE 1055; Pintura epóxi de alta resistência',
    'Middle 6 UN / Master 24 UN',
    '8201.30.00',
    '08.012.00',
    41.90,
    20.50,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F80.11',
    'Vassoura Plástica 15 Dentes Preta com Cabo',
    '15 dentes; Cor Preta; Cabo acompanha; Fabricação própria; Super-resistente; Grande ângulo de abertura',
    'Middle - / Master 6 UN',
    '9603.90.00',
    '10.015.00',
    28.90,
    14.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F80.08',
    'Vassoura Plástica 22 Dentes Laranja com Cabo',
    '22 dentes; Cor Laranja; Cabo acompanha; Fabricação própria; Super-resistente; Grande ângulo de abertura',
    'Middle - / Master 6 UN',
    '9603.90.00',
    '10.015.00',
    34.90,
    17.10,
    'Unidade',
    'Plástico'
  ],
  [
    'F80.09',
    'Vassoura Plástica 22 Dentes Preta com Cabo',
    '22 dentes; Cor Preta; Cabo acompanha; Fabricação própria; Super-resistente; Grande ângulo de abertura',
    'Middle 6 UN / Master 18 UN',
    '9603.90.00',
    '10.015.00',
    34.90,
    17.10,
    'Unidade',
    'Plástico'
  ],

  // --- PÁGINA 4 (19 itens: Vassouras, Conjuntos Jardim, Pás, Sachos, Tesouras, Serrote e Machadinha) ---
  [
    'F80.10',
    'Vassoura Plástica 26 Dentes Laranja com Cabo',
    '26 dentes; Cor Laranja; Cabo acompanha; Fabricação própria; Super-resistente; Grande ângulo de abertura',
    'Middle - / Master 6 UN',
    '9603.90.00',
    '10.015.00',
    39.90,
    19.50,
    'Unidade',
    'Plástico'
  ],
  [
    'F86.20',
    'Conjunto para Jardim 3 Peças (Metal)',
    'Cartela/Solapa; Kit 3 peças: 1 pazinha larga, 1 escardilho, 1 arrancador de inço; Metal',
    'Middle 6 UN / Master 48 UN',
    '8201.90.00',
    '08.012.00',
    42.90,
    21.00,
    'Kit',
    'Metal / Inox'
  ],
  [
    'F86.21',
    'Conjunto para Jardim 4 Peças (Plástico)',
    'Cartela/Solapa; Kit 4 peças: 1 pazinha larga, 1 pazinha estreita, 1 escardilho, 1 arrancador de inço; Plástico',
    'Master 6 UN',
    '3926.90.90',
    '10.015.00',
    29.90,
    14.60,
    'Kit',
    'Plástico'
  ],
  [
    'F86.01',
    'Pazinha para Jardim Estreita',
    'Estreita; Pintura epóxi; Para cavar, remover ou transportar terra',
    'Master 6 UN',
    '8201.10.00',
    '08.012.00',
    15.90,
    7.80,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F86.02',
    'Pazinha para Jardim Larga',
    'Larga; Cabo de madeira encerado; Aço carbono; Pintura epóxi',
    'Middle 6 UN / Master 48 UN',
    '8201.10.00',
    '08.012.00',
    16.90,
    8.30,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F86.10',
    'Escardilho para Jardim',
    'Cabo de madeira encerado; Aço carbono; Pintura epóxi; Para recolher detritos, limpar a grama e espalhar adubo',
    'Middle 6 UN / Master 48 UN',
    '8201.30.00',
    '08.012.00',
    17.90,
    8.70,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F86.15',
    'Arrancador de Inço',
    'Cabo de madeira encerado; Aço carbono; Pintura epóxi; Para eliminar ervas-daninhas e remover plantas desde a raiz',
    'Middle 6 UN / Master 48 UN',
    '8201.90.00',
    '08.012.00',
    16.50,
    8.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F86.05',
    'Ancinho para Jardim 3 Dentes',
    'Rastrillo 3 dentes; Cabo de madeira encerado; Aço carbono; Pintura epóxi; Para recolher folhas',
    'Master 6 UN',
    '8201.30.00',
    '08.012.00',
    18.50,
    9.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F82.02',
    'Sacho 1 Ponta Cabo 40 cm',
    'Cabo: Cabo de madeira 40 cm; Fabricação própria; Aço carbono; Pintura epóxi; Para capinar, abrir valos ou revolver a terra',
    'Master 6 UN',
    '8201.30.00',
    '08.012.00',
    27.90,
    13.60,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F82.01',
    'Sacho 1 Ponta Cabo 110 cm',
    'Cabo: Cabo de madeira 110 cm; Fabricação própria; Aço carbono; Pintura epóxi; Para capinar, abrir valos ou revolver a terra',
    'Master 6 UN',
    '8201.30.00',
    '08.012.00',
    42.90,
    21.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F82.04',
    'Sacho 2 Pontas Cabo 40 cm',
    'Cabo: Cabo de madeira 40 cm; Fabricação própria; Aço carbono; Pintura epóxi; Para capinar, abrir valos ou revolver a terra',
    'Master 6 UN',
    '8201.30.00',
    '08.012.00',
    29.90,
    14.60,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F82.03',
    'Sacho 2 Pontas Cabo 110 cm',
    'Cabo: Cabo de madeira 110 cm; Fabricação própria; Aço carbono; Pintura epóxi; Para capinar, abrir valos ou revolver a terra',
    'Master 6 UN',
    '8201.30.00',
    '08.012.00',
    45.90,
    22.50,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F83.10',
    'Tesoura para Poda 6,5"',
    '6,5"; Cabo ergonômico; Corta galhos de flores de diferentes espessuras; Ângulo de corte 45°',
    'Middle 6 UN / Master 60 UN',
    '8201.50.00',
    '08.012.00',
    34.90,
    17.10,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F83.13',
    'Tesoura Poda Profissional 8"',
    '8"; Cabo ergonômico; Corta galhos de flores de diferentes espessuras; Ângulo de corte 45°',
    'Middle 6 UN / Master 36 UN',
    '8201.50.00',
    '08.012.00',
    49.90,
    24.50,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F83.03',
    'Tesoura para Grama 12"',
    '12"; Aço carbono; Cabo de madeira encerado; Furo autosserviço; Espessura da chapa 3mm; Ângulo de fechamento amortece o impacto',
    'Master 6 UN',
    '8201.60.00',
    '08.012.00',
    56.90,
    27.80,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F83.21',
    'Tesoura Corta Galho 27"',
    '27"; Cabo em madeira; Cortes com precisão e acabamento; Lâmina de alta resistência; Indicada para galhos grossos',
    'Middle 6 UN / Master 24 UN',
    '8201.60.00',
    '08.012.00',
    98.90,
    48.40,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F83.22',
    'Corta Galho com Lâmina de Serra e Cordão',
    'Em aço; Lâmina afiável e flexível; Com lâmina de serra auxiliar (corte nos dois sentidos); Fácil de operar com cordão de corte de 2 metros; Guilhotina para galhos de até 3cm; Cabo não incluso',
    'Middle 6 UN / Master 24 UN',
    '8201.60.00',
    '08.012.00',
    89.90,
    44.00,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F84.02',
    'Serrote de Poda Curvo 12"',
    '12"; Lâmina de aço carbono; Travado; Polido; Cabo de madeira envernizado com 2 parafusos; Corta nos dois sentidos; Com protetor de dentes',
    'Middle 6 UN / Master 72 UN',
    '8202.10.00',
    '08.006.00',
    54.90,
    26.90,
    'Unidade',
    'Metal / Inox'
  ],
  [
    'F85.01',
    'Machadinha com Cabo de Madeira',
    'Em madeira; Com pintura; Linha Jardinagem e Corte Famastil',
    'Master 6 UN',
    '8201.40.00',
    '08.012.00',
    59.90,
    29.30,
    'Unidade',
    'Madeira'
  ]
];

async function runImport() {
  console.log(`Iniciando importação de ${items.length} produtos de Jardinagem Famastil...`);

  // Carrega produtos existentes de data/products.ts para complementar
  let existingProducts = [];
  try {
    const rawTs = fs.readFileSync('./data/products.ts', 'utf8');
    const jsonMatch = rawTs.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
    if (jsonMatch) {
      existingProducts = JSON.parse(jsonMatch[1]);
    }
  } catch (err) {
    console.warn('Não foi possível ler produtos existentes, iniciando lista nova:', err.message);
  }

  const existingMap = new Map();
  existingProducts.forEach(p => existingMap.set(p.id, p));

  const importedJardinagem = [];

  for (const item of items) {
    const [code, name, tipo, embalagemInfo, ncm, cest, price, costPrice, packagingType, material] = item;
    const docId = `prod_famastil_jardinagem_${code.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    const payload = {
      id: docId,
      code,
      sku: `SKU-${code}`,
      name: `${name} Famastil`,
      category: 'Jardinagem',
      description: `${name}. Especificações: ${tipo}. Embalagem: ${embalagemInfo}. Codificação tributária legal: NCM ${ncm}, CEST ${cest}, CFOP 5102, CST 102, ICMS 18%, IPI 5%, PIS 0.65%, COFINS 3.00%.`,
      price,
      costPrice,
      stock: 48,
      minStock: 6,
      packagingType,
      material: material || 'Plástico',
      imageUrl: '/ponto_chave_logo.jpg',
      gallery: ['/ponto_chave_logo.jpg'],
      isActive: true,
      showInStore: false, // CRÍTICO: Não ativo para exibição na página principal
      isImported: true,
      importBatchId: 'batch_famastil_jardinagem_20260829',
      importBatchName: 'Importação PDF Jardinagem Famastil (29/08/2026)',
      importedAt: '2026-08-29T12:00:00.000Z',
      purchaseDate: '2026-08-29',
      invoiceNumber: 'PDF-JARDINAGEM-20260829',
      supplierName: 'Famastil Jardinagem & Ferramentas',
      icmsPercent: 18,
      ipiPercent: 5,
      pisPercent: 0.65,
      cofinsPercent: 3.00,
      otherTaxesPercent: 0,
      profitMarginPercent: 45,
      technicalSpecs: `NCM: ${ncm} | CEST: ${cest} | CFOP: 5102 | CST: 102 | ICMS: 18% | IPI: 5% | PIS: 0.65% | COFINS: 3.00% | Embalagem: ${embalagemInfo} | Linha: Jardinagem Famastil | Fornecedor: Famastil Jardinagem & Ferramentas`
    };

    importedJardinagem.push(payload);
    existingMap.set(docId, payload);

    // Salva no Firestore
    await setDoc(doc(db, 'products', docId), payload);
  }

  console.log(`Firestore atualizado com sucesso com os ${importedJardinagem.length} produtos de Jardinagem!`);

  // Salva no data/products.ts reunindo os produtos
  const allProducts = Array.from(existingMap.values());
  const tsContent = `import type { Product } from '../types';\n\nexport const products: Product[] = ${JSON.stringify(allProducts, null, 2)};\n`;
  fs.writeFileSync('./data/products.ts', tsContent, 'utf8');
  console.log(`Arquivo data/products.ts atualizado com ${allProducts.length} produtos no total!`);

  process.exit(0);
}

runImport().catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
