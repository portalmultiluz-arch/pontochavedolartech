import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const items = [
  // Chaves Fenda 46.01-46.25
  ['46.01', 'Chave de Fenda 1/8 x 2" (3 x 50 mm)', '8205.40.00', '08.012.00', 9.90, 4.80, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.02', 'Chave de Fenda 1/8 x 3" (3 x 75 mm)', '8205.40.00', '08.012.00', 10.50, 5.10, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.03', 'Chave de Fenda 1/8 x 4" (3 x 100 mm)', '8205.40.00', '08.012.00', 11.20, 5.50, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.04', 'Chave de Fenda 1/8 x 5" (3 x 125 mm)', '8205.40.00', '08.012.00', 11.90, 5.80, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.05', 'Chave de Fenda 1/8 x 6" (3 x 150 mm)', '8205.40.00', '08.012.00', 12.50, 6.10, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.06', 'Chave de Fenda Toco 3/16 x 1.1/2" (5 x 38 mm)', '8205.40.00', '08.012.00', 10.90, 5.30, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.07', 'Chave de Fenda 3/16 x 3" (5 x 75 mm)', '8205.40.00', '08.012.00', 11.50, 5.60, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.08', 'Chave de Fenda 3/16 x 4" (5 x 100 mm)', '8205.40.00', '08.012.00', 12.20, 5.90, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.09', 'Chave de Fenda 3/16 x 5" (5 x 125 mm)', '8205.40.00', '08.012.00', 12.90, 6.30, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.10', 'Chave de Fenda 3/16 x 6" (5 x 150 mm)', '8205.40.00', '08.012.00', 13.50, 6.60, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.11', 'Chave de Fenda Toco 1/4 x 1.1/2" (6 x 38 mm)', '8205.40.00', '08.012.00', 12.90, 6.30, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.12', 'Chave de Fenda 1/4 x 4" (6 x 100 mm)', '8205.40.00', '08.012.00', 13.90, 6.80, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.13', 'Chave de Fenda 1/4 x 5" (6 x 125 mm)', '8205.40.00', '08.012.00', 14.50, 7.10, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.14', 'Chave de Fenda 1/4 x 6" (6 x 150 mm)', '8205.40.00', '08.012.00', 15.20, 7.40, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.15', 'Chave de Fenda 1/4 x 8" (6 x 200 mm)', '8205.40.00', '08.012.00', 16.50, 8.10, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.16', 'Chave de Fenda 1/4 x 10" (6 x 250 mm)', '8205.40.00', '08.012.00', 17.90, 8.80, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.17', 'Chave de Fenda 5/16 x 4" (8 x 100 mm)', '8205.40.00', '08.012.00', 18.50, 9.10, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.18', 'Chave de Fenda 5/16 x 5" (8 x 125 mm)', '8205.40.00', '08.012.00', 19.50, 9.60, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.19', 'Chave de Fenda 5/16 x 6" (8 x 150 mm)', '8205.40.00', '08.012.00', 20.50, 10.10, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.20', 'Chave de Fenda 5/16 x 8" (8 x 200 mm)', '8205.40.00', '08.012.00', 22.00, 10.80, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.21', 'Chave de Fenda 5/16 x 10" (8 x 250 mm)', '8205.40.00', '08.012.00', 23.90, 11.70, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.22', 'Chave de Fenda 3/8 x 6" (10 x 150 mm)', '8205.40.00', '08.012.00', 24.90, 12.20, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.23', 'Chave de Fenda 3/8 x 8" (10 x 200 mm)', '8205.40.00', '08.012.00', 26.50, 13.00, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.24', 'Chave de Fenda 3/8 x 10" (10 x 250 mm)', '8205.40.00', '08.012.00', 28.50, 13.90, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.25', 'Chave de Fenda 3/8 x 12" (10 x 300 mm)', '8205.40.00', '08.012.00', 31.90, 15.60, 'Unidade', 'Middle 6 UN / Master 60 UN'],

  // Chaves Philips 46.51-46.75
  ['46.51', 'Chave Philips 1/8 x 2" (3 x 50 mm)', '8205.40.00', '08.012.00', 9.90, 4.80, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.52', 'Chave Philips 1/8 x 3" (3 x 75 mm)', '8205.40.00', '08.012.00', 10.50, 5.10, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.53', 'Chave Philips 1/8 x 4" (3 x 100 mm)', '8205.40.00', '08.012.00', 11.20, 5.50, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.54', 'Chave Philips 1/8 x 5" (3 x 125 mm)', '8205.40.00', '08.012.00', 11.90, 5.80, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.55', 'Chave Philips 1/8 x 6" (3 x 150 mm)', '8205.40.00', '08.012.00', 12.50, 6.10, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.56', 'Chave Philips Toco 3/16 x 1.1/2" (5 x 38 mm)', '8205.40.00', '08.012.00', 10.90, 5.30, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.57', 'Chave Philips 3/16 x 3" (5 x 75 mm)', '8205.40.00', '08.012.00', 11.50, 5.60, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.58', 'Chave Philips 3/16 x 4" (5 x 100 mm)', '8205.40.00', '08.012.00', 12.20, 5.90, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.59', 'Chave Philips 3/16 x 5" (5 x 125 mm)', '8205.40.00', '08.012.00', 12.90, 6.30, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.60', 'Chave Philips 3/16 x 6" (5 x 150 mm)', '8205.40.00', '08.012.00', 13.50, 6.60, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.61', 'Chave Philips Toco 1/4 x 1.1/2" (6 x 38 mm)', '8205.40.00', '08.012.00', 12.90, 6.30, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.62', 'Chave Philips 1/4 x 4" (6 x 100 mm)', '8205.40.00', '08.012.00', 13.90, 6.80, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.63', 'Chave Philips 1/4 x 5" (6 x 125 mm)', '8205.40.00', '08.012.00', 14.50, 7.10, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.64', 'Chave Philips 1/4 x 6" (6 x 150 mm)', '8205.40.00', '08.012.00', 15.20, 7.40, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.65', 'Chave Philips 1/4 x 8" (6 x 200 mm)', '8205.40.00', '08.012.00', 16.50, 8.10, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.66', 'Chave Philips 1/4 x 10" (6 x 250 mm)', '8205.40.00', '08.012.00', 17.90, 8.80, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['46.67', 'Chave Philips 5/16 x 4" (8 x 100 mm)', '8205.40.00', '08.012.00', 18.50, 9.10, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.68', 'Chave Philips 5/16 x 5" (8 x 125 mm)', '8205.40.00', '08.012.00', 19.50, 9.60, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.69', 'Chave Philips 5/16 x 6" (8 x 150 mm)', '8205.40.00', '08.012.00', 20.50, 10.10, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.70', 'Chave Philips 5/16 x 8" (8 x 200 mm)', '8205.40.00', '08.012.00', 22.00, 10.80, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.71', 'Chave Philips 5/16 x 10" (8 x 250 mm)', '8205.40.00', '08.012.00', 23.90, 11.70, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.72', 'Chave Philips 3/8 x 6" (10 x 150 mm)', '8205.40.00', '08.012.00', 24.90, 12.20, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.73', 'Chave Philips 3/8 x 8" (10 x 200 mm)', '8205.40.00', '08.012.00', 26.50, 13.00, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.74', 'Chave Philips 3/8 x 10" (10 x 250 mm)', '8205.40.00', '08.012.00', 28.50, 13.90, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['46.75', 'Chave Philips 3/8 x 12" (10 x 300 mm)', '8205.40.00', '08.012.00', 31.90, 15.60, 'Unidade', 'Middle 6 UN / Master 60 UN'],

  // Kit Chaves e Isoladas 1000V
  ['53.11', 'Kit de Chaves Philips e Fenda 6 Peças', '8205.40.00', '08.012.00', 59.90, 29.50, 'Kit', 'Middle 6 UN / Master 24 UN'],
  ['F46.10', 'Chave de Fenda Isolada 1000V 1/8 x 3"', '8205.40.00', '08.012.00', 14.90, 7.20, 'Unidade', 'Middle 12 UN / Master 288 UN'],
  ['F46.11', 'Chave de Fenda Isolada 1000V 1/8 x 4"', '8205.40.00', '08.012.00', 15.90, 7.80, 'Unidade', 'Middle 12 UN / Master 288 UN'],
  ['F46.12', 'Chave de Fenda Isolada 1000V 3/16 x 3"', '8205.40.00', '08.012.00', 16.90, 8.20, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.13', 'Chave de Fenda Isolada 1000V 3/16 x 4"', '8205.40.00', '08.012.00', 17.50, 8.50, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.14', 'Chave de Fenda Isolada 1000V 3/16 x 6"', '8205.40.00', '08.012.00', 18.90, 9.20, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.15', 'Chave de Fenda Isolada 1000V 1/4 x 4"', '8205.40.00', '08.012.00', 19.90, 9.70, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.16', 'Chave de Fenda Isolada 1000V 1/4 x 6"', '8205.40.00', '08.012.00', 21.50, 10.50, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.50', 'Chave Philips Isolada 1000V 1/8 x 3"', '8205.40.00', '08.012.00', 14.90, 7.20, 'Unidade', 'Middle 12 UN / Master 288 UN'],
  ['F46.51', 'Chave Philips Isolada 1000V 1/8 x 4"', '8205.40.00', '08.012.00', 15.90, 7.80, 'Unidade', 'Middle 12 UN / Master 288 UN'],
  ['F46.52', 'Chave Philips Isolada 1000V 3/16 x 3"', '8205.40.00', '08.012.00', 16.90, 8.20, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.53', 'Chave Philips Isolada 1000V 3/16 x 4"', '8205.40.00', '08.012.00', 17.50, 8.50, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.54', 'Chave Philips Isolada 1000V 3/16 x 6"', '8205.40.00', '08.012.00', 18.90, 9.20, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.55', 'Chave Philips Isolada 1000V 1/4 x 4"', '8205.40.00', '08.012.00', 19.90, 9.70, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F46.56', 'Chave Philips Isolada 1000V 1/4 x 6"', '8205.40.00', '08.012.00', 21.50, 10.50, 'Unidade', 'Middle 12 UN / Master 144 UN'],

  // Chaves Canhão 47.02 - 47.11
  ['47.02', 'Chave Canhão 5 mm Boca Sextavada', '8205.40.00', '08.012.00', 16.90, 8.30, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['47.03', 'Chave Canhão 6 mm Boca Sextavada', '8205.40.00', '08.012.00', 17.50, 8.50, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['47.04', 'Chave Canhão 7 mm Boca Sextavada', '8205.40.00', '08.012.00', 17.90, 8.70, 'Unidade', 'Middle 6 UN / Master 120 UN'],
  ['47.05', 'Chave Canhão 8 mm Boca Sextavada', '8205.40.00', '08.012.00', 18.50, 9.10, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['47.06', 'Chave Canhão 9 mm Boca Sextavada', '8205.40.00', '08.012.00', 19.50, 9.50, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['47.07', 'Chave Canhão 10 mm Boca Sextavada', '8205.40.00', '08.012.00', 20.50, 10.10, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['47.08', 'Chave Canhão 11 mm Boca Sextavada', '8205.40.00', '08.012.00', 21.50, 10.60, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['47.09', 'Chave Canhão 12 mm Boca Sextavada', '8205.40.00', '08.012.00', 22.50, 11.00, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['47.10', 'Chave Canhão 13 mm Boca Sextavada', '8205.40.00', '08.012.00', 23.50, 11.50, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['47.11', 'Chave Canhão 14 mm Boca Sextavada', '8205.40.00', '08.012.00', 24.90, 12.20, 'Unidade', 'Middle 6 UN / Master 60 UN'],

  // Alicates e Chaves Allen
  ['36.01', 'Alicate de Corte Diagonal 5" Isolado 750V', '8203.20.10', '08.010.00', 25.90, 12.80, 'Unidade', 'Middle 10 UN / Master 80 UN'],
  ['36.02', 'Alicate de Bico Reto 5" Isolado 750V', '8203.20.10', '08.010.00', 25.90, 12.80, 'Unidade', 'Middle 10 UN / Master 80 UN'],
  ['36.03', 'Alicate Universal 5" Isolado 750V', '8203.20.10', '08.010.00', 26.90, 13.20, 'Unidade', 'Middle 10 UN / Master 80 UN'],
  ['36.04', 'Alicate de Corte Diagonal 6" Isolado 750V', '8203.20.10', '08.010.00', 28.90, 14.10, 'Unidade', 'Middle 10 UN / Master 40 UN'],
  ['36.05', 'Alicate de Bico Reto 6" Isolado 750V', '8203.20.10', '08.010.00', 28.90, 14.10, 'Unidade', 'Middle 10 UN / Master 40 UN'],
  ['36.06', 'Alicate Universal 8" Isolado 750V', '8203.20.10', '08.010.00', 34.90, 17.10, 'Unidade', 'Middle 10 UN / Master 40 UN'],
  ['36.08', 'Alicate Bico Torto 5" Isolado 750V', '8203.20.10', '08.010.00', 26.50, 13.00, 'Unidade', 'Middle 10 UN / Master 80 UN'],
  ['36.15', 'Alicate de Bico Redondo 5" Isolado 750V', '8203.20.10', '08.010.00', 26.50, 13.00, 'Unidade', 'Middle 10 UN / Master 80 UN'],
  ['36.30', 'Alicate Profissional 1000V Corte Diagonal 6"', '8203.20.10', '08.010.00', 38.90, 19.00, 'Unidade', 'Middle 10 UN / Master 60 UN'],
  ['36.31', 'Alicate Profissional 1000V Bico Reto 6"', '8203.20.10', '08.010.00', 38.90, 19.00, 'Unidade', 'Middle 10 UN / Master 60 UN'],
  ['36.32', 'Alicate Profissional 1000V Universal 8"', '8203.20.10', '08.010.00', 44.90, 22.00, 'Unidade', 'Middle 10 UN / Master 60 UN'],
  ['41.01', 'Alicate Rebitador 9" Estrutura de Aço', '8205.59.00', '08.012.00', 42.00, 21.00, 'Unidade', 'Middle 10 UN / Master 40 UN'],
  ['36.11', 'Alicate Bomba D\'Água 10" Cromo Vanádio', '8203.20.10', '08.010.00', 49.90, 24.50, 'Unidade', 'Middle 10 UN / Master 60 UN'],
  ['36.13', 'Alicate Bomba D\'Água 12" Cromo Vanádio', '8203.20.10', '08.010.00', 58.90, 28.90, 'Unidade', 'Middle 6 UN / Master 24 UN'],
  ['36.17', 'Alicate de Pressão 10" Mordentes Curvos', '8203.20.10', '08.010.00', 46.90, 23.00, 'Unidade', 'Middle 10 UN / Master 40 UN'],
  ['47.26', 'Jogo de Chave Allen 9 Peças (1,5 a 10 mm)', '8205.40.00', '08.012.00', 24.90, 12.20, 'Kit', 'Middle 10 UN / Master 60 UN'],
  ['47.27', 'Jogo de Chave Allen Abaulada 9 Peças (1,5 a 10 mm)', '8205.40.00', '08.012.00', 29.90, 14.50, 'Kit', 'Middle 10 UN / Master 60 UN'],
  ['47.25', 'Jogo de Chave Torx 9 Peças (T10 a T50)', '8205.40.00', '08.012.00', 36.90, 18.00, 'Kit', 'Middle 10 UN / Master 60 UN'],

  // Chaves Combinadas, Boca e Estrela
  ['53.09', 'Kit Chave Combinada 6 Peças (8 a 17 mm)', '8204.11.00', '08.011.00', 54.90, 27.00, 'Kit', 'Master 10 UN'],
  ['53.10', 'Kit Chave Combinada 9 Peças (8 a 19 mm)', '8204.11.00', '08.011.00', 79.90, 39.00, 'Kit', 'Master 10 UN'],
  ['53.04', 'Kit Chave Combinada com Catraca 8 Peças (8 a 19 mm)', '8204.11.00', '08.011.00', 169.90, 84.00, 'Kit', 'Master 10 UN'],
  ['53.05', 'Kit Chave de Boca Fixa 6 Peças (6x7 a 16x17 mm)', '8204.11.00', '08.011.00', 49.90, 24.50, 'Kit', 'Master 10 KITS'],
  ['53.06', 'Kit Chave de Boca Fixa 8 Peças (6x7 a 20x22 mm)', '8204.11.00', '08.011.00', 69.90, 34.00, 'Kit', 'Master 10 KITS'],
  ['53.07', 'Kit Chave Estrela 6 Peças (6x7 a 16x17 mm)', '8204.11.00', '08.011.00', 54.90, 27.00, 'Kit', 'Master 10 UN'],
  ['53.08', 'Kit Chave Estrela 8 Peças (6x7 a 20x22 mm)', '8204.11.00', '08.011.00', 74.90, 37.00, 'Kit', 'Master 10 UN'],
  ['47.40', 'Chave Grifo 8" (Abertura 30 mm)', '8204.12.00', '08.011.00', 39.90, 19.50, 'Unidade', 'Master 36 UN'],
  ['47.41', 'Chave Grifo 10" (Abertura 35 mm)', '8204.12.00', '08.011.00', 48.90, 24.00, 'Unidade', 'Master 24 UN'],
  ['47.42', 'Chave Grifo 12" (Abertura 45 mm)', '8204.12.00', '08.011.00', 62.90, 31.00, 'Unidade', 'Master 24 UN'],
  ['47.43', 'Chave Grifo 14" (Abertura 50 mm)', '8204.12.00', '08.011.00', 78.90, 39.00, 'Unidade', 'Master 12 UN'],
  ['47.44', 'Chave Grifo 18" (Abertura 75 mm)', '8204.12.00', '08.011.00', 119.90, 59.00, 'Unidade', 'Master 10 UN'],
  ['47.45', 'Chave Grifo 24" (Abertura 90 mm)', '8204.12.00', '08.011.00', 169.90, 84.00, 'Unidade', 'Master 6 UN'],
  ['47.30', 'Chave Inglesa 6" Cromo Vanádio', '8204.12.00', '08.011.00', 29.90, 14.50, 'Unidade', 'Middle 6 UN / Master 72 UN'],
  ['47.31', 'Chave Inglesa 8" Cromo Vanádio', '8204.12.00', '08.011.00', 37.90, 18.50, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['47.32', 'Chave Inglesa 10" Cromo Vanádio', '8204.12.00', '08.011.00', 48.90, 24.00, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['47.33', 'Chave Inglesa 12" Cromo Vanádio', '8204.12.00', '08.011.00', 64.90, 32.00, 'Unidade', 'Middle 6 UN / Master 24 UN'],
  ['47.34', 'Chave Inglesa 15" Cromo Vanádio', '8204.12.00', '08.011.00', 98.90, 49.00, 'Unidade', 'Master 12 UN'],
  ['45.13', 'Chave de Roda Tipo Cruz 17x19x21x23 mm', '8204.11.00', '08.011.00', 58.90, 29.00, 'Unidade', 'Master 10 UN'],
  ['61.01', 'Cabo Chupeta para Bateria 3,5m 300A com Bolsa', '8544.42.00', '08.012.00', 69.90, 34.00, 'Unidade', 'Master 10 UN'],
  ['57.01', 'Jogo de Soquetes 12 Peças com Catraca 1/2"', '8204.20.00', '08.012.00', 119.90, 59.00, 'Kit', 'Master 10 UN'],
  ['57.02', 'Jogo de Soquetes e Chave Catraca 32 Peças na Maleta', '8204.20.00', '08.012.00', 189.90, 94.00, 'Kit', 'Master 5 UN'],
  ['F95.04', 'Jogo de Ferramentas Completo 59 Peças na Maleta', '8206.00.00', '08.012.00', 219.90, 109.00, 'Kit', 'Master 4 UN'],
  ['F95.05', 'Jogo de Ferramentas Completo 110 Peças na Maleta', '8206.00.00', '08.012.00', 369.90, 184.00, 'Kit', 'Master 2 UN'],

  // Martelos e Marretas
  ['F30.30', 'Martelo de Unha 20 mm Aço Forjado Famastil', '8205.20.00', '08.012.00', 28.90, 14.00, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F30.31', 'Martelo de Unha 23 mm Aço Forjado Famastil', '8205.20.00', '08.012.00', 31.90, 15.50, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F30.32', 'Martelo de Unha 25 mm Aço Forjado Famastil', '8205.20.00', '08.012.00', 34.90, 17.00, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F30.33', 'Martelo de Unha 27 mm Aço Forjado Famastil', '8205.20.00', '08.012.00', 38.90, 19.00, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F30.34', 'Martelo de Unha 29 mm Aço Forjado Famastil', '8205.20.00', '08.012.00', 43.90, 21.50, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F30.22', 'Martelo de Unha Alma de Aço 25 mm', '8205.20.00', '08.012.00', 45.90, 22.50, 'Unidade', 'Middle 6 UN / Master 24 UN'],
  ['F30.39', 'Martelo de Unha Cabo Fibra de Vidro 25 mm', '8205.20.00', '08.012.00', 42.90, 21.00, 'Unidade', 'Middle 6 UN / Master 24 UN'],
  ['F30.10', 'Martelo de Borracha Maciça 40 mm Branco', '4016.99.90', '08.012.00', 18.90, 9.20, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F30.12', 'Martelo de Borracha Maciça 40 mm Preto', '4016.99.90', '08.012.00', 16.90, 8.20, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F31.02-N', 'Marreta Oitavada 1000g Cabo Madeira Cunha', '8205.20.00', '08.012.00', 38.90, 19.00, 'Unidade', 'Middle 4 UN / Master 16 UN'],
  ['F31.03-N', 'Marreta Oitavada 1500g Cabo Madeira Cunha', '8205.20.00', '08.012.00', 46.90, 23.00, 'Unidade', 'Middle 4 UN / Master 12 UN'],
  ['F31.16', 'Marreta Oitavada Profissional 1000g Fibra de Vidro', '8205.20.00', '08.012.00', 48.90, 24.00, 'Unidade', 'Middle 4 UN / Master 16 UN'],
  ['F31.17', 'Marreta Oitavada Profissional 1500g Fibra de Vidro', '8205.20.00', '08.012.00', 58.90, 29.00, 'Unidade', 'Middle 4 UN / Master 12 UN'],

  // Construção e Corte
  ['42.01', 'Aplicador de Silicone 9" Chapa de Aço', '8205.59.00', '08.012.00', 21.90, 10.50, 'Unidade', 'Middle 12 UN / Master 24 UN'],
  ['42.02', 'Aplicador Profissional Silicone e PU 9"', '8205.59.00', '08.012.00', 34.90, 17.00, 'Unidade', 'Middle 12 UN / Master 24 UN'],
  ['F47.11', 'Serrote Cabo Plástico 18" 8 DPP Aço Temperado', '8202.10.00', '08.006.00', 34.90, 17.00, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F47.12', 'Serrote Cabo Plástico 20" 8 DPP Aço Temperado', '8202.10.00', '08.006.00', 38.90, 19.00, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F47.30', 'Serrote para Gesso e Drywall 6" (30 cm)', '8202.10.00', '08.006.00', 22.90, 11.00, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['F38.02', 'Colher de Pedreiro Modelo Redondo 8"', '8205.59.00', '08.012.00', 24.90, 12.00, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F38.03', 'Colher de Pedreiro Modelo Redondo 9"', '8205.59.00', '08.012.00', 26.90, 13.00, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F38.12', 'Colher de Pedreiro Modelo Reto 8"', '8205.59.00', '08.012.00', 24.90, 12.00, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F38.13', 'Colher de Pedreiro Modelo Reto 9"', '8205.59.00', '08.012.00', 26.90, 13.00, 'Unidade', 'Middle 6 UN / Master 48 UN'],

  // Medição e Precisão
  ['F25.01', 'Paquímetro Universal 0-150 mm / 0-6" em Aço', '9017.30.10', '08.018.00', 49.90, 24.50, 'Unidade', 'Master 50 UN'],
  ['F28.01', 'Bolsa para Ferramentas 16" 24 Bolsos Poliéster 600D', '4202.92.00', '08.012.00', 89.90, 44.00, 'Unidade', 'Master 10 UN'],
  ['F43.20', 'Trena a Laser Digital 50 Metros Alta Precisão', '9017.80.10', '08.018.00', 149.90, 74.00, 'Unidade', 'Master 20 UN'],
  ['F43.21', 'Trena a Laser Digital 100 Metros Alta Precisão', '9017.80.10', '08.018.00', 199.90, 99.00, 'Unidade', 'Master 20 UN'],
  ['F43.02', 'Trena de Alta Precisão 5m x 19mm ABS', '9017.80.10', '08.018.00', 16.90, 8.20, 'Unidade', 'Middle 12 UN / Master 120 UN'],
  ['F43.04', 'Trena Emborrachada Imantada 5m x 19mm', '9017.80.10', '08.018.00', 22.90, 11.20, 'Unidade', 'Middle 12 UN / Master 120 UN'],
  ['F43.06', 'Trena Emborrachada Imantada 7.5m x 25mm', '9017.80.10', '08.018.00', 32.90, 16.00, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['F43.07', 'Trena Emborrachada Imantada 10m x 25mm', '9017.80.10', '08.018.00', 39.90, 19.50, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F40.50', 'Nível a Laser 20 Metros Autonivelante com Suporte', '9015.30.00', '08.018.00', 189.90, 94.00, 'Unidade', 'Master 10 UN'],
  ['F40.03', 'Nível de Alumínio Magnético 14" (35 cm)', '9017.80.90', '08.018.00', 28.90, 14.00, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['F40.06', 'Nível de Alumínio Magnético 20" (50 cm)', '9017.80.90', '08.018.00', 36.90, 18.00, 'Unidade', 'Middle 6 UN / Master 60 UN'],
  ['F40.07', 'Nível de Alumínio Magnético 24" (60 cm)', '9017.80.90', '08.018.00', 42.90, 21.00, 'Unidade', 'Middle 6 UN / Master 30 UN'],
  ['F24.01', 'Termômetro Medidor Laser Digital -32 a 400°C', '9025.19.90', '08.018.00', 129.90, 64.00, 'Unidade', 'Master 20 UN'],

  // Discos e Abrasivos
  ['80.10', 'Disco Diamantado Segmentado 4 3/8" (110x20mm)', '6804.21.19', '08.008.00', 16.90, 8.10, 'Unidade', 'Middle 10 UN / Master 100 UN'],
  ['80.11', 'Disco Diamantado Liso 4 3/8" (110x20mm)', '6804.21.19', '08.008.00', 16.90, 8.10, 'Unidade', 'Middle 10 UN / Master 100 UN'],
  ['80.12', 'Disco Diamantado Turbo 4 3/8" (110x20mm)', '6804.21.19', '08.008.00', 18.90, 9.20, 'Unidade', 'Middle 10 UN / Master 100 UN'],
  ['80.15', 'Disco Diamantado Porcelanato Fino 4 3/8"', '6804.21.19', '08.008.00', 22.90, 11.00, 'Unidade', 'Middle 10 UN / Master 100 UN'],
  ['80.02', 'Disco de Corte Metal e Inox 4 1/2" (115x1.0mm)', '6804.22.11', '08.007.00', 6.50, 3.10, 'Unidade', 'Middle 50 UN / Master 400 UN'],
  ['80.04', 'Disco de Corte Metal e Inox 7" (178x1.6mm)', '6804.22.11', '08.007.00', 12.90, 6.20, 'Unidade', 'Middle 25 UN / Master 100 UN'],
  ['80.30', 'Disco de Desbaste Metal 4 3/4" (115x4.8mm)', '6804.22.11', '08.007.00', 9.90, 4.80, 'Unidade', 'Middle 25 UN / Master 100 UN'],
  ['80.41', 'Disco Flap 4 1/2" Grão 60 para Desbaste e Acabamento', '6805.10.00', '08.008.00', 11.90, 5.80, 'Unidade', 'Middle 10 UN / Master 200 UN'],
  ['80.42', 'Disco Flap 4 1/2" Grão 80 para Desbaste e Acabamento', '6805.10.00', '08.008.00', 11.90, 5.80, 'Unidade', 'Middle 10 UN / Master 200 UN'],
  ['80.21', 'Serra Circular de Vídea 24 Dentes 7 1/4" Madeira', '8202.39.00', '08.006.00', 38.90, 19.00, 'Unidade', 'Middle 5 UN / Master 50 UN'],
  ['80.22', 'Serra Circular de Vídea 40 Dentes 7 1/4" Madeira e MDF', '8202.39.00', '08.006.00', 46.90, 23.00, 'Unidade', 'Middle 5 UN / Master 50 UN'],
  ['F26.01', 'Moto Esmeril de Bancada 360W Bivolt 2 Rebolos 6"', '8465.93.10', '08.019.00', 299.90, 159.00, 'Unidade', 'Master 1 UN'],

  // Ferramentas Elétricas e Bateria
  ['F23.01', 'Soprador Térmico Portátil 21V 300W Bateria com Bocais', '8467.29.99', '08.019.00', 229.90, 119.00, 'Kit', 'Master 5 UN'],
  ['F21.01', 'Motosserra Portátil 21V Sabre 6" com 2 Baterias e Maleta', '8467.81.00', '08.019.00', 269.90, 139.00, 'Kit', 'Master 5 UN'],
  ['F22.01', 'Compressor de Ar Portátil 12V 150 PSI Veicular com Manômetro', '8414.80.19', '08.019.00', 149.90, 79.00, 'Unidade', 'Master 10 UN'],
  ['F23.05', 'Parafusadeira a Bateria 3.6V USB Kit 50 Peças', '8467.29.93', '08.019.00', 99.90, 49.00, 'Kit', 'Master 10 UN'],
  ['F23.06', 'Parafusadeira e Furadeira 12V Bivolt 2 Baterias Kit 30 Peças', '8467.21.00', '08.019.00', 189.90, 99.00, 'Kit', 'Master 6 UN'],
  ['F23.07', 'Parafusadeira Furadeira de Impacto 21V Bivolt 2 Baterias Kit 35 Peças', '8467.21.00', '08.019.00', 279.90, 149.00, 'Kit', 'Master 5 UN'],

  // Materiais Complementares
  ['F48.20', 'Desempenadeira Plástica com Borracha EVA 27x14 cm', '3926.90.90', '10.015.00', 16.90, 8.20, 'Unidade', 'Middle 12 UN / Master 48 UN'],
  ['F48.16', 'Desempenadeira Plástica para Grafiato 27x14 cm', '3926.90.90', '10.015.00', 14.90, 7.10, 'Unidade', 'Middle 12 UN / Master 48 UN'],
  ['F49.02', 'Espátula de Aço Cabo PVC 6 cm Flexível', '8205.59.00', '08.012.00', 9.90, 4.80, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F49.03', 'Espátula de Aço Cabo PVC 8 cm Flexível', '8205.59.00', '08.012.00', 11.50, 5.60, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F32.10', 'Ponteiro Redondo para Demolição 3/4 x 10"', '8205.59.00', '08.012.00', 18.90, 9.20, 'Unidade', 'Middle 6 UN / Master 24 UN'],
  ['F33.20', 'Talhadeira Chata Aço Temperado 8"', '8205.59.00', '08.012.00', 17.90, 8.70, 'Unidade', 'Middle 6 UN / Master 24 UN'],
  ['F44.11', 'Prumo de Pedreiro Aço Fundido 700g com Corda', '9017.80.90', '08.018.00', 29.90, 14.50, 'Unidade', 'Middle 6 UN / Master 24 UN'],
  ['F92.02', 'Balde Plástico Reforçado para Obra 12 Litros', '3924.90.00', '10.008.00', 14.90, 7.20, 'Unidade', 'Master 25 UN'],
  ['F92.05', 'Caixa de Massa PVC Reforçada 20 Litros', '3924.90.00', '10.008.00', 24.90, 12.00, 'Unidade', 'Master 10 UN'],
  ['60.13', 'Lona de Polietileno Impermeável 3x3 Metros 150 Micras', '3926.90.90', '10.001.00', 39.90, 19.50, 'Unidade', 'Master 20 UN'],
  ['60.15', 'Lona de Polietileno Impermeável 4x4 Metros 150 Micras', '3926.90.90', '10.001.00', 69.90, 34.00, 'Unidade', 'Master 12 UN'],
  ['60.19', 'Lona de Polietileno Impermeável 6x4 Metros 150 Micras', '3926.90.90', '10.001.00', 99.90, 49.00, 'Unidade', 'Master 8 UN'],
  ['F45.01', 'Torquês de Armador 10" Aço Carbono Temperado', '8203.20.90', '08.010.00', 32.90, 16.00, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F34.03', 'Formão para Madeira 5/8" Fio Navalha Cabo de Lei', '8205.30.00', '08.012.00', 22.90, 11.00, 'Unidade', 'Middle 6 UN / Master 72 UN'],
  ['F93.08', 'Espaçador para Revestimento e Piso 1.0mm Pacote c/ 100 UN', '3926.90.90', '10.015.00', 7.90, 3.50, 'Pacote', 'Master 50 PCT'],
  ['F93.01', 'Nivelador Espaçador de Porcelanato 1.0mm Pacote c/ 100 UN', '3926.90.90', '10.015.00', 14.90, 6.80, 'Pacote', 'Master 25 PCT'],
  ['F93.07', 'Cunha Niveladora para Porcelanato Pacote c/ 50 UN', '3926.90.90', '10.015.00', 18.90, 8.50, 'Pacote', 'Master 20 PCT'],
  ['F42.02', 'Cortador de Piso e Azulejo Profissional 75 cm com Esquadro', '8205.59.00', '08.012.00', 199.90, 99.00, 'Unidade', 'Master 2 UN'],
  ['F46.03', 'Corta Vergalhão 18" Cromo Vanádio com Regulagem', '8203.40.00', '08.010.00', 89.90, 44.00, 'Unidade', 'Master 6 UN'],
  ['F58.02', 'Arco de Serra Regulável 12" Estrutura de Aço', '8202.10.00', '08.006.00', 24.90, 12.00, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F41.11', 'Esquadro para Carpinteiro 12" Aço Encruado', '9017.20.00', '08.018.00', 19.90, 9.60, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F41.19', 'Esquadro Magnético para Soldador 12 Kg (3")', '8505.11.00', '08.018.00', 26.90, 13.00, 'Unidade', 'Middle 6 UN / Master 48 UN'],
  ['F29.07', 'Estilete Profissional 18 mm Corpo Emborrachado', '8211.93.20', '08.012.00', 14.90, 7.10, 'Unidade', 'Middle 12 UN / Master 144 UN'],
  ['F57.02', 'Grampo "C" para Carpinteiro 4" Aço Nodular', '8205.70.00', '08.012.00', 22.90, 11.00, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F62.01', 'Tesoura de Aviação 10" Reta com Trava', '8203.30.00', '08.010.00', 36.90, 18.00, 'Unidade', 'Middle 6 UN / Master 36 UN'],
  ['F66.03', 'Pneu para Carrinho de Mão 3.25 x 8" Reforçado', '4011.80.90', '10.008.00', 49.90, 24.50, 'Unidade', 'Master 10 UN'],
  ['F66.04', 'Câmara de Ar para Carrinho de Mão 3.25 x 8" Bico Grosso', '4013.90.00', '10.008.00', 24.90, 12.00, 'Unidade', 'Master 25 UN'],
  ['F59.03', 'Suporte Cantoneira de Aço para Prateleira 30 cm Leve', '7326.90.90', '10.008.00', 8.90, 4.20, 'Unidade', 'Master 50 UN'],
  ['F59.05', 'Suporte Mão Francesa Reforçada em Aço 30 cm Forte', '7326.90.90', '10.008.00', 14.90, 7.00, 'Unidade', 'Master 30 UN'],
  ['F59.16', 'Cantoneira Branca em Aço 6" x 8" Reforçada', '7326.90.90', '10.008.00', 6.90, 3.20, 'Unidade', 'Master 60 UN']
];

async function seed() {
  console.log(`Iniciando importação de ${items.length} produtos da Famastil Ferramentas...`);
  const fullProducts = [];

  for (const item of items) {
    const [code, name, ncm, cest, price, costPrice, packagingType, embalagemInfo] = item;
    const docId = `prod_famastil_${code.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const payload = {
      id: docId,
      code,
      sku: `SKU-${code}`,
      name: `${name} Famastil`,
      category: 'Materiais Construção, Elétricos e Ferramentas',
      description: `${name}; Linha profissional Famastil. Embalagem: ${embalagemInfo}. Codificação legal: NCM ${ncm}, CEST ${cest}, CFOP 5102, ICMS 18%, IPI 5%, PIS 0.65%, COFINS 3.00%.`,
      price,
      costPrice,
      stock: 48,
      minStock: 6,
      packagingType,
      imageUrl: '/ponto_chave_logo.jpg',
      gallery: ['/ponto_chave_logo.jpg'],
      isActive: true,
      showInStore: false,
      isImported: true,
      importBatchId: 'batch_famastil_ferramentas_20260829',
      importBatchName: 'Importação PDF Ferramentas Famastil (29/08/2026)',
      importedAt: '2026-08-29T12:00:00.000Z',
      purchaseDate: '2026-08-29',
      invoiceNumber: 'PDF-FERRAMENTAS-20260829',
      supplierName: 'Materiais Construção e Elétricos Famastil',
      icmsPercent: 18,
      ipiPercent: 5,
      pisPercent: 0.65,
      cofinsPercent: 3.00,
      otherTaxesPercent: 0,
      profitMarginPercent: 45,
      technicalSpecs: `NCM: ${ncm} | CEST: ${cest} | CFOP: 5102 | CST: 102 | ICMS: 18% | IPI: 5% | PIS: 0.65% | COFINS: 3.00% | Embalagem: ${embalagemInfo} | Fornecedor: Famastil`
    };

    fullProducts.push(payload);
    await setDoc(doc(db, 'products', docId), payload);
  }

  console.log(`Importação concluída no Firestore! Total: ${fullProducts.length}`);
  
  // Salva no data/products.ts como catálogo padrão
  const tsContent = `import type { Product } from '../types';\n\nexport const products: Product[] = ${JSON.stringify(fullProducts, null, 2)};\n`;
  fs.writeFileSync('./data/products.ts', tsContent, 'utf8');
  console.log('Arquivo data/products.ts atualizado com sucesso!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Erro ao importar:', err);
  process.exit(1);
});
