const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, writeBatch, doc } = require('firebase/firestore');

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

// 233 itens de Materiais Elétricos Foxlux extraídos das 10 páginas do catálogo oficial
const rawItems = [
  // Página 1 (27 itens)
  { code: '10.01', name: 'Fita Isolante de PVC 5 m Preta', type: 'Tamanho 5 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 40 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.19', name: 'Fita Isolante de PVC 5 m 6 Cores', type: 'Tamanho 5 m; Cor 6 Cores; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'BLISTER C/6 UN / Middle 10 UN / Master 30 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.44', name: 'Fita Isolante de PVC Pote 5 m Preta', type: 'Tamanho POTE 5 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'POTE C/50 UN / Master 6 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.02', name: 'Fita Isolante de PVC 10 m Preta', type: 'Tamanho 10 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 30 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.05', name: 'Fita Isolante de PVC 10 m Branca', type: 'Tamanho 10 m; Cor Branca; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 30 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.08', name: 'Fita Isolante de PVC 10 m Azul', type: 'Tamanho 10 m; Cor Azul; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 30 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.11', name: 'Fita Isolante de PVC 10 m Amarela', type: 'Tamanho 10 m; Cor Amarela; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 30 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.14', name: 'Fita Isolante de PVC 10 m Verde', type: 'Tamanho 10 m; Cor Verde; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 30 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.17', name: 'Fita Isolante de PVC 10 m Vermelha', type: 'Tamanho 10 m; Cor Vermelha; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 30 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.45', name: 'Fita Isolante de PVC Pote 10 m Preta', type: 'Tamanho POTE 10 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'POTE C/35 UN / Master 6 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.03', name: 'Fita Isolante de PVC 20 m Preta', type: 'Tamanho 20 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 20 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.46', name: 'Fita Isolante de PVC Pote 20 m Preta', type: 'Tamanho POTE 20 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'POTE C/25 UN / Master 6 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.04', name: 'Fita Isolante de PVC 30 m Preta', type: 'Tamanho 30 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'TUBO C/10 UN / Master 10 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.47', name: 'Fita Isolante de PVC Pote 30 m Preta', type: 'Tamanho POTE 30 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'POTE C/20 UN / Master 6 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '24.32', name: 'Fita Isolante de PVC AS 5 m Preta', type: 'Tamanho AS 5 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '24.10', name: 'Fita Isolante de PVC AS 10 m Preta', type: 'Tamanho AS 10 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '24.12', name: 'Fita Isolante de PVC AS 10 m Branca', type: 'Tamanho AS 10 m; Cor Branca; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '24.14', name: 'Fita Isolante de PVC AS 10 m Azul', type: 'Tamanho AS 10 m; Cor Azul; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '24.16', name: 'Fita Isolante de PVC AS 10 m Amarela', type: 'Tamanho AS 10 m; Cor Amarelo; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '24.18', name: 'Fita Isolante de PVC AS 10 m Verde', type: 'Tamanho AS 10 m; Cor Verde; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '24.20', name: 'Fita Isolante de PVC AS 10 m Vermelha', type: 'Tamanho AS 10 m; Cor Vermelha; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '24.11', name: 'Fita Isolante de PVC AS 20 m Preta', type: 'Tamanho AS 20 m; Cor Preta; Largura 19mm; Espessura 0,15mm; Antichamas; Isola até 600V', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.51', name: 'Fita Isolante Autofusão 2 m Preta', type: 'Tamanho 2 m; Cor Preta; Largura 19mm; Espessura 0,76mm; Alta tensão; Resistente a raios UV', packaging: 'TUBO C/10 UN / Master 12 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.52', name: 'Fita Isolante Autofusão 5 m Preta', type: 'Tamanho 5 m; Cor Preta; Largura 19mm; Espessura 0,76mm; Alta tensão; Resistente a raios UV', packaging: 'ROLO / Master 120 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '10.53', name: 'Fita Isolante Autofusão 10 m Preta', type: 'Tamanho 10 m; Cor Preta; Largura 19mm; Espessura 0,76mm; Alta tensão; Resistente a raios UV', packaging: 'ROLO / Master 120 UN', ncm: '3919.10.20', cest: '10.003.00' },
  { code: '18.01', name: 'Abraçadeiras de Nylon 100 x 2,5 mm Branca', type: 'Tamanho 100 x 2,5 mm; Cor Branca; Nylon de alta resistência; Proteção UV; Embalagem Ziploc', packaging: 'PCT C/100 UN / Master 300 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.11', name: 'Abraçadeiras de Nylon 100 x 2,5 mm Preta', type: 'Tamanho 100 x 2,5 mm; Cor Preta; Nylon de alta resistência; Proteção UV; Embalagem Ziploc', packaging: 'PCT C/100 UN / Master 300 UN', ncm: '3926.90.90', cest: '10.004.00' },

  // Página 2 (27 itens)
  { code: '18.02', name: 'Abraçadeiras de Nylon 140 x 2,5 mm Branca', type: 'Tamanho 140 x 2,5 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 300 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.12', name: 'Abraçadeiras de Nylon 140 x 2,5 mm Preta', type: 'Tamanho 140 x 2,5 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 300 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.04', name: 'Abraçadeiras de Nylon 140 x 3,5 mm Branca', type: 'Tamanho 140 x 3,5 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 200 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.14', name: 'Abraçadeiras de Nylon 140 x 3,5 mm Preta', type: 'Tamanho 140 x 3,5 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 200 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.03', name: 'Abraçadeiras de Nylon 200 x 2,5 mm Branca', type: 'Tamanho 200 x 2,5 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 200 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.13', name: 'Abraçadeiras de Nylon 200 x 2,5 mm Preta', type: 'Tamanho 200 x 2,5 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 200 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.05', name: 'Abraçadeiras de Nylon 200 x 3,5 mm Branca', type: 'Tamanho 200 x 3,5 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 160 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.15', name: 'Abraçadeiras de Nylon 200 x 3,5 mm Preta', type: 'Tamanho 200 x 3,5 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 160 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.07', name: 'Abraçadeiras de Nylon 200 x 4,8 mm Branca', type: 'Tamanho 200 x 4,8 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 100 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.17', name: 'Abraçadeiras de Nylon 200 x 4,8 mm Preta', type: 'Tamanho 200 x 4,8 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 100 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.06', name: 'Abraçadeiras de Nylon 280 x 3,5 mm Branca', type: 'Tamanho 280 x 3,5 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 120 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.16', name: 'Abraçadeiras de Nylon 280 x 3,5 mm Preta', type: 'Tamanho 280 x 3,5 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 120 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.08', name: 'Abraçadeiras de Nylon 280 x 4,8 mm Branca', type: 'Tamanho 280 x 4,8 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 80 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.18', name: 'Abraçadeiras de Nylon 280 x 4,8 mm Preta', type: 'Tamanho 280 x 4,8 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/100 UN / Master 80 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.10', name: 'Abraçadeiras de Nylon 370 x 7,0 mm Branca', type: 'Tamanho 370 x 7,0 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/50 UN / Master 80 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.20', name: 'Abraçadeiras de Nylon 370 x 7,0 mm Preta', type: 'Tamanho 370 x 7,0 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/50 UN / Master 80 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.09', name: 'Abraçadeiras de Nylon 380 x 4,8 mm Branca', type: 'Tamanho 380 x 4,8 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/50 UN / Master 100 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.19', name: 'Abraçadeiras de Nylon 380 x 4,8 mm Preta', type: 'Tamanho 380 x 4,8 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/50 UN / Master 100 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.25', name: 'Abraçadeiras de Nylon 450 x 6,5 mm Branca', type: 'Tamanho 450 x 6,5 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/50 UN / Master 80 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.26', name: 'Abraçadeiras de Nylon 450 x 6,5 mm Preta', type: 'Tamanho 450 x 6,5 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/50 UN / Master 80 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.23', name: 'Abraçadeiras de Nylon 530 x 12,7 mm Branca', type: 'Tamanho 530 x 12,7 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/25 UN / Master 40 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.24', name: 'Abraçadeiras de Nylon 530 x 12,7 mm Preta', type: 'Tamanho 530 x 12,7 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/25 UN / Master 40 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.21', name: 'Abraçadeiras de Nylon 760 x 9,0 mm Branca', type: 'Tamanho 760 x 9,0 mm; Cor Branca; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/25 UN / Master 40 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.22', name: 'Abraçadeiras de Nylon 760 x 9,0 mm Preta', type: 'Tamanho 760 x 9,0 mm; Cor Preta; Nylon alta resistência; UV; Ziploc', packaging: 'PCT C/25 UN / Master 40 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '18.50', name: 'Abraçadeiras de Nylon Diversos Pote c/ 600', type: 'Tamanho Diversos; Cor Preta/Branca; Nylon de alta resistência; Proteção UV', packaging: 'POTE C/600 UN / Master 20 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '66.40', name: 'Fio Cristal 0,75 mm 100 m Rolo', type: 'Espessura 0,75 mm; Tamanho 100 m; PVC especial incolor; Capa PVC cristal; Tarja colorida', packaging: '1 ROLO', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.46', name: 'Fio Cristal 0,75 mm 300 m Bobina', type: 'Espessura 0,75 mm; Tamanho 300 m; PVC especial incolor; Capa PVC cristal; Tarja colorida', packaging: '1 BOBINA', ncm: '8544.49.00', cest: '12.001.00' },

  // Página 3 (25 itens)
  { code: '66.41', name: 'Fio Cristal 1,00 mm 100 m Rolo', type: 'Espessura 1,00 mm; Tamanho 100 m; PVC especial incolor; Capa PVC cristal; Tarja colorida', packaging: '1 ROLO', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.47', name: 'Fio Cristal 1,00 mm 300 m Bobina', type: 'Espessura 1,00 mm; Tamanho 300 m; PVC especial incolor; Capa PVC cristal; Tarja colorida', packaging: '1 BOBINA', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.42', name: 'Fio Cristal 1,5 mm 100 m Rolo', type: 'Espessura 1,5 mm; Tamanho 100 m; PVC especial incolor; Capa PVC cristal; Tarja colorida', packaging: '1 ROLO', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.48', name: 'Fio Cristal 1,5 mm 300 m Bobina', type: 'Espessura 1,5 mm; Tamanho 300 m; PVC especial incolor; Capa PVC cristal; Tarja colorida', packaging: '1 BOBINA', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.43', name: 'Fio Cristal 2,5 mm 100 m Rolo', type: 'Espessura 2,5 mm; Tamanho 100 m; PVC especial incolor; Capa PVC cristal; Tarja colorida', packaging: '1 ROLO', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.49', name: 'Fio Cristal 2,5 mm 300 m Bobina', type: 'Espessura 2,5 mm; Tamanho 300 m; PVC especial incolor; Capa PVC cristal; Tarja colorida', packaging: '1 BOBINA', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.50', name: 'Fio Bicolor para Áudio 0,75 mm 100 m Rolo', type: 'Espessura 0,75 mm; Tamanho 100 m; Cabo paralelo bicolor; Tarja preta p/ identificação', packaging: '1 ROLO', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.56', name: 'Fio Bicolor para Áudio 0,75 mm 300 m Bobina', type: 'Espessura 0,75 mm; Tamanho 300 m; Cabo paralelo bicolor; Tarja preta p/ identificação', packaging: '1 BOBINA', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.51', name: 'Fio Bicolor para Áudio 1,00 mm 100 m Rolo', type: 'Espessura 1,00 mm; Tamanho 100 m; Cabo paralelo bicolor; Tarja preta p/ identificação', packaging: '1 ROLO', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.57', name: 'Fio Bicolor para Áudio 1,00 mm 300 m Bobina', type: 'Espessura 1,00 mm; Tamanho 300 m; Cabo paralelo bicolor; Tarja preta p/ identificação', packaging: '1 BOBINA', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.52', name: 'Fio Bicolor para Áudio 1,5 mm 100 m Rolo', type: 'Espessura 1,5 mm; Tamanho 100 m; Cabo paralelo bicolor; Tarja preta p/ identificação', packaging: '1 ROLO', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.58', name: 'Fio Bicolor para Áudio 1,5 mm 300 m Bobina', type: 'Espessura 1,5 mm; Tamanho 300 m; Cabo paralelo bicolor; Tarja preta p/ identificação', packaging: '1 BOBINA', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.53', name: 'Fio Bicolor para Áudio 2,5 mm 100 m Rolo', type: 'Espessura 2,5 mm; Tamanho 100 m; Cabo paralelo bicolor; Tarja preta p/ identificação', packaging: '1 ROLO', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.59', name: 'Fio Bicolor para Áudio 2,5 mm 300 m Bobina', type: 'Espessura 2,5 mm; Tamanho 300 m; Cabo paralelo bicolor; Tarja preta p/ identificação', packaging: '1 BOBINA', ncm: '8544.49.00', cest: '12.001.00' },
  { code: '66.03', name: 'Cabo Coaxial RG 59 47% 100 m Rolo', type: 'Modelo RG 59 47%; Tamanho 100 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 6 ROLOS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.04', name: 'Cabo Coaxial RG 6 67% 100 m Rolo', type: 'Modelo RG 6 67%; Tamanho 100 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 6 ROLOS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.05', name: 'Cabo Coaxial RG 59 67% 100 m Rolo', type: 'Modelo RG 59 67%; Tamanho 100 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 6 ROLOS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.06', name: 'Cabo Coaxial RG 59 95% 100 m Rolo', type: 'Modelo RG 59 95%; Tamanho 100 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 6 ROLOS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.07', name: 'Cabo Coaxial RG 6 95% 100 m Rolo', type: 'Modelo RG 6 95%; Tamanho 100 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 6 ROLOS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.08', name: 'Cabo Coaxial RG 59 67% 300 m Bobina', type: 'Modelo RG 59 67%; Tamanho 300 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 2 BOBINAS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.09', name: 'Cabo Coaxial RG 59 95% 300 m Bobina', type: 'Modelo RG 59 95%; Tamanho 300 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 2 BOBINAS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.10', name: 'Cabo Coaxial RG 6 95% 300 m Bobina', type: 'Modelo RG 6 95%; Tamanho 300 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 2 BOBINAS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.11', name: 'Cabo Coaxial RG 59 47% 300 m Bobina', type: 'Modelo RG 59 47%; Tamanho 300 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 2 BOBINAS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.12', name: 'Cabo Coaxial RG 6 67% 300 m Bobina', type: 'Modelo RG 6 67%; Tamanho 300 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 2 BOBINAS', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.15', name: 'Cabo Coaxial Bipolar 80% 100 m', type: 'Modelo Bipolar 80%; Tamanho 100 m; P/ antenas individuais/coletivas e CFTV; Matéria prima virgem', packaging: 'Master 6 UN', ncm: '8544.20.00', cest: '12.002.00' },

  // Página 4 (27 itens)
  { code: '66.16', name: 'Cabo Coaxial RG 59 67% 7 m Montado', type: 'Modelo RG 59 67%; Tamanho 7 m; Recomendado p/ antenas e CFTV; Matéria prima virgem', packaging: 'Master 20 UN', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.17', name: 'Cabo Coaxial RG 59 67% 15 m Montado', type: 'Modelo RG 59 67%; Tamanho 15 m; Recomendado p/ antenas e CFTV; Matéria prima virgem', packaging: 'Master 20 UN', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.29', name: 'Cabo Coaxial RG 6 67% 1200 m Bobina', type: 'Modelo RG 6 67%; Tamanho 1200 m; Recomendado p/ antenas e CFTV; Matéria prima virgem', packaging: 'Master 1 BOBINA', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.30', name: 'Cabo Coaxial RG 59 95% 1200 m Bobina', type: 'Modelo RG 59 95%; Tamanho 1200 m; Recomendado p/ antenas e CFTV; Matéria prima virgem', packaging: 'Master 1 BOBINA', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.31', name: 'Cabo Coaxial RG 6 95% 1200 m Bobina', type: 'Modelo RG 6 95%; Tamanho 1200 m; Recomendado p/ antenas e CFTV; Matéria prima virgem', packaging: 'Master 1 BOBINA', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.32', name: 'Cabo Coaxial RG 59 67% 1200 m Bobina', type: 'Modelo RG 59 67%; Tamanho 1200 m; Recomendado p/ antenas e CFTV; Matéria prima virgem', packaging: 'Master 1 BOBINA', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.33', name: 'Cabo Coaxial RG 59 1 m Conectorizado', type: 'Modelo RG 59; Tamanho 1 m; Recomendado p/ antenas individuais/coletivas e CFTV', packaging: 'Master 50 UN', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.34', name: 'Cabo Coaxial RG 59 3 m Conectorizado', type: 'Modelo RG 59; Tamanho 3 m; Recomendado p/ antenas individuais/coletivas e CFTV', packaging: 'Master 50 UN', ncm: '8544.20.00', cest: '12.002.00' },
  { code: '66.68', name: 'Cabo de Rede CFTV 100 m 4 Pares 24AWG Caixa', type: 'Tamanho 100 m; Revestimento em PVC; Diâmetro 8x24 AWG (0,48mm); Impedância 100 ohms', packaging: 'CX / Master 4 UN', ncm: '8544.49.00', cest: '21.055.00' },
  { code: '66.67', name: 'Cabo de Rede CFTV 305 m 4 Pares 24AWG Caixa', type: 'Tamanho 305 m; Revestimento em PVC; Diâmetro 8x24 AWG (0,48mm); Impedância 100 ohms', packaging: 'CX / Master 2 UN', ncm: '8544.49.00', cest: '21.055.00' },
  { code: '37.10', name: 'Alicate Decapador Giratório para Cabo Coaxial', type: '2 lâminas precisas; Chave para ajuste; Conectores compatíveis RG6 e RG59; Pequeno e ágil', packaging: 'Middle 10 UN / Master 60 UN', ncm: '8203.20.10', cest: '08.001.00' },
  { code: '37.01', name: 'Alicate de Crimpar RJ-45 Rede e Telefone', type: 'Cabo antideslizante; 2 lâminas resistentes; Trava fechamento; Crimpa/decapa/corta cabos; RJ-45', packaging: 'Middle 10 UN / Master 60 UN', ncm: '8203.20.10', cest: '08.001.00' },
  { code: '37.07', name: 'Alicate de Crimpar Conector Coaxial RG6 e RG59', type: 'Crimpagem profissional TV a cabo; Conectores compatíveis RG6 e RG59', packaging: 'Middle 10 UN / Master 60 UN', ncm: '8203.20.10', cest: '08.001.00' },
  { code: '37.09', name: 'Alicate Decapador com Regulagem RG6 e RG59', type: '2 lâminas precisas; Botão de ajuste de pressão das lâminas; Compatível RG6 e RG59', packaging: 'Middle 10 UN / Master 60 UN', ncm: '8203.20.10', cest: '08.001.00' },
  { code: '65.01', name: 'Passa Fio com Alma de Aço 10 m', type: 'Tamanho 10 m; Produzido em polipropileno; Alma de aço; Ponta boleada e ponta com abertura', packaging: 'Master 30 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '65.02', name: 'Passa Fio com Alma de Aço 15 m', type: 'Tamanho 15 m; Produzido em polipropileno; Alma de aço; Ponta boleada e ponta com abertura', packaging: 'Master 30 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '65.03', name: 'Passa Fio com Alma de Aço 20 m', type: 'Tamanho 20 m; Produzido em polipropileno; Alma de aço; Ponta boleada e ponta com abertura', packaging: 'Master 20 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '65.04', name: 'Passa Fio com Alma de Aço 30 m', type: 'Tamanho 30 m; Produzido em polipropileno; Alma de aço; Ponta boleada e ponta com abertura', packaging: 'Master 20 UN', ncm: '3926.90.90', cest: '10.004.00' },
  { code: '40.01', name: 'Bocal em Porcelana Cônico Reforçado Base E-27', type: 'Bocal de Porcelana Cônico Reforçado; Base E-27; Alta temperatura; Material reforçado', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.02', name: 'Bocal em Porcelana para Lâmpadas Base E-40', type: 'Bocal Porcelana p/ Lâmpadas; Base E-40; Resistente a altas temperaturas; Material reforçado', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.03', name: 'Bocal em Porcelana de Tempo Base E-27', type: 'Bocal Porcelana de Tempo; Base E-27; Resistente a altas temperaturas; Material reforçado', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.04', name: 'Adaptador Porcelana E-27 para E-40', type: 'Adaptador Porcelana E-27 p/ E-40; Base E-27; Resistente a altas temperaturas', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.05', name: 'Bocal em Porcelana Angular Base E-27', type: 'Bocal Porcelana Angular; Base E-27; Resistente a altas temperaturas; Material reforçado', packaging: 'UN / Middle 10 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.06', name: 'Bocal em Porcelana Fixo para Teto Base E-27', type: 'Bocal Porcelana Fixo p/ Teto; Base E-27; Resistente a altas temperaturas; Material reforçado', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.07', name: 'Bocal em Porcelana Fixo para Teto Base E-14', type: 'Bocal Porcelana Fixo p/ Teto; Base E-14; Resistente a altas temperaturas; Material reforçado', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.08', name: 'Adaptador Porcelana E-40 para E-27', type: 'Adaptador Porcelana E-40 p/ E-27; Base E-40; Resistente a altas temperaturas', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.09', name: 'Bocal em Porcelana para Plafonier Base E-27', type: 'Bocal Porcelana p/ Plafonier; Base E-27; Resistente a altas temperaturas; Material reforçado', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },

  // Página 5 (28 itens)
  { code: '40.10', name: 'Bocal Porcelana para Spot Liso Base E-27', type: 'Bocal Porcelana p/ Spot Liso; Base E-27; Resistente a altas temperaturas', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.11', name: 'Bocal Porcelana Spot com Alça Base E-27', type: 'Bocal Porcelana Spot c/ Alça; Base E-27; Resistente a altas temperaturas', packaging: 'UN / Middle 25 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '40.14', name: 'Plafon de Plástico com Bocal de Porcelana E-27', type: 'Plafon de Plástico c/ Bocal de Porcelana; Base E-27', packaging: 'UN / Master 50 UN', ncm: '9405.10.99', cest: '21.048.00' },
  { code: '40.14-P', name: 'Plafon Plástico Preto com Bocal Porcelana E-27', type: 'Plafon Plástico Preto c/ Bocal de Porcelana; Base E-27', packaging: 'UN / Master 50 UN', ncm: '9405.10.99', cest: '21.048.00' },
  { code: '24.48', name: 'AS Bocal Porcelana para Plafonier E-27', type: 'AS Bocal Porcelana p/ Plafonier; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.49', name: 'AS Bocal Porcelana para Spot Liso E-27', type: 'AS Bocal Porcelana p/ Spot Liso; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.68', name: 'AS Adaptador Porcelana E-27 para E-40', type: 'AS Adaptador Porcelana E-27 p/ E-40; Base E-27; Embalagem PCT', packaging: 'PCT / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.69', name: 'AS Bocal Porcelana Fixo para Teto E-27', type: 'AS Bocal Porcelana Fixo p/ Teto; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.72', name: 'AS Bocal Porcelana Spot com Alça E-27', type: 'AS Bocal Porcelana Spot c/ Alça; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.01T', name: 'Bocal Termoplástico Pendente com Rabicho Preto E-27', type: 'Pendente c/ Rabicho; Cor Preto; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 25 UN / Master 500 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.01TB', name: 'Bocal Termoplástico Pendente com Rabicho Branco E-27', type: 'Pendente c/ Rabicho; Cor Branco; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 25 UN / Master 500 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.02B', name: 'Bocal Termoplástico Pendente sem Chave Preto E-27', type: 'Pendente s/ Chave; Cor Preto; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 25 UN / Master 500 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.02BB', name: 'Bocal Termoplástico Pendente sem Chave Branco E-27', type: 'Pendente s/Chave; Cor Branco; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 25 UN / Master 500 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.03T', name: 'Bocal Termoplástico Pendente para Abajur Preto E-27', type: 'Pendente p/ Abajur; Cor Preto; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 20 UN / Master 300 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.03TB', name: 'Bocal Termoplástico Pendente para Abajur Branco E-27', type: 'Pendente p/ Abajur; Cor Branco; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 20 UN / Master 300 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.04T', name: 'Bocal Termoplástico Fixo de Teto Preto E-27', type: 'Fixo de Teto; Cor Preto; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 20 UN / Master 300 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.04TB', name: 'Bocal Termoplástico Fixo de Teto Branco E-27', type: 'Fixo de Teto; Cor Branco; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 20 UN / Master 300 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.05T', name: 'Bocal Termoplástico Pendente com Chave Preto E-27', type: 'Pendente c/ Chave; Cor Preto; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 20 UN / Master 300 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.06T', name: 'Bocal Termoplástico Adaptador com Plug Macho Preto E-27', type: 'Adap. c/ Plug Macho; Cor Preto; Base E-27; Nylon termoplástico; Até 250V / 4A', packaging: 'UN / Middle 20 UN / Master 300 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.09T', name: 'Bocal Borracha com Rabicho Preto E-27', type: 'Bocal Borracha c/ Rabicho; Cor Preto; Base E-27; Até 250V / 4A', packaging: 'UN / Middle 20 UN / Master 300 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.10T', name: 'Bocal Termoplástico Pendente com Rabicho Pote c/ 50', type: 'Pendente c/ Rabicho Pote; Cor Preto; Base E-27; Nylon termoplástico', packaging: 'POTE C/50 UN / Master 6 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.11B', name: 'Bocal Termoplástico Pendente sem Chave Pote c/ 50', type: 'Pendente s/ Chave Pote; Cor Preto; Base E-27; Nylon termoplástico', packaging: 'POTE C/50 UN / Master 6 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '43.12T', name: 'Bocal Termoplástico Adaptador com Plug Macho Pote c/ 50', type: 'Adap. c/ Plug Macho Pote; Cor Preto; Base E-27; Nylon termoplástico', packaging: 'POTE C/50 UN / Master 6 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.50', name: 'AS Pendente com Rabicho Preto E-27', type: 'AS Pendente c/ Rabicho; Cor Preto; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.51', name: 'AS Pendente sem Chave Preto E-27', type: 'AS Pendente s/ Chave; Cor Preto; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.52', name: 'AS Fixo de Teto Preto E-27', type: 'AS Fixo de Teto; Cor Preto; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.53', name: 'AS Pendente com Chave Preto E-27', type: 'AS Pendente c/ Chave; Cor Preto; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '24.54', name: 'AS Adaptador com Plug Macho Preto E-27', type: 'AS Adap. c/ Plug Macho; Cor Preto; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },

  // Página 6 (26 itens)
  { code: '24.73', name: 'AS Bocal Pendente para Abajur Preto E-27', type: 'AS Bocal Pendente p/ Abajur; Cor Preto; Base E-27; Embalagem PCT', packaging: 'PCT / Master 150 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '32.09', name: 'Sensor de Presença Teto Embutir 360° Bivolt 6 m', type: 'Tensão Bivolt; Alcance 6 m; Ângulo 360°; Presença ou luminosidade', packaging: 'Middle 20 UN / Master 120 UN', ncm: '8536.50.90', cest: '21.050.00' },
  { code: '32.03', name: 'Sensor de Presença Teto Sobrepor 360° Bivolt 8 m', type: 'Tensão Bivolt; Alcance 8 m; Ângulo 360°; Presença ou luminosidade', packaging: 'Middle 20 UN / Master 120 UN', ncm: '8536.50.90', cest: '21.050.00' },
  { code: '32.06', name: 'Sensor de Presença Parede/Teto Sobrepor 360° Bivolt 8 m', type: 'Tensão Bivolt; Alcance 8 m; Ângulo 360°; Presença ou luminosidade', packaging: 'Middle 20 UN / Master 120 UN', ncm: '8536.50.90', cest: '21.050.00' },
  { code: '32.07', name: 'Sensor de Presença com Soquete Bocal E-27 Bivolt 6 m', type: 'Tensão Bivolt; Alcance 6 m; Ângulo 360°; Base E-27 acende automático', packaging: 'Middle 20 UN / Master 120 UN', ncm: '8536.50.90', cest: '21.050.00' },
  { code: '32.11', name: 'Sensor / Bocal de Fotocélula E-27 Bivolt 6 m', type: 'Bocal E-27 com fotocélula; Bivolt; Alcance 6m; Acende ao anoitecer e apaga ao amanhecer', packaging: 'Middle 20 UN / Master 120 UN', ncm: '8536.50.90', cest: '21.050.00' },
  { code: '43.13', name: 'Varal de Luzes 10 m 120W 10 Bocais Bivolt IP65', type: 'Tamanho 10 m; Potência 120 W; 10 Bocais; Bivolt; Conexões impermeáveis IP65; E-27', packaging: 'Master 10 UN', ncm: '9405.40.90', cest: '21.050.00' },
  { code: '43.14', name: 'Varal de Luzes 20 m 240W 20 Bocais Bivolt IP65', type: 'Tamanho 20 m; Potência 240 W; 20 Bocais; Bivolt; Conexões impermeáveis IP65; E-27', packaging: 'Master 8 UN', ncm: '9405.40.90', cest: '21.050.00' },
  { code: '43.15', name: 'Varal de Luzes 30 m 360W 30 Bocais Bivolt IP65', type: 'Tamanho 30 m; Potência 360 W; 30 Bocais; Bivolt; Conexões impermeáveis IP65; E-27', packaging: 'Master 4 UN', ncm: '9405.40.90', cest: '21.050.00' },
  { code: '04.11', name: 'Conector de Porcelana Bipolar 10 mm Caixa c/ 50', type: 'Modelo Bipolar 10 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros elétricos', packaging: 'CX C/50 UN / Master 10 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '04.13', name: 'Conector de Porcelana Bipolar 16 mm Caixa c/ 50', type: 'Modelo Bipolar 16 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros elétricos', packaging: 'CX C/50 UN / Master 6 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '24.05', name: 'Conector de Porcelana Bipolar 10 mm Pacote c/ 1', type: 'Modelo Bipolar 10 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '24.23', name: 'Conector de Porcelana Bipolar 10 mm Pacote c/ 2', type: 'Modelo Bipolar 10 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros', packaging: 'PCT C/2 UN / Master 50 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '24.07', name: 'Conector de Porcelana Bipolar 16 mm Pacote c/ 1', type: 'Modelo Bipolar 16 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '24.24', name: 'Conector de Porcelana Bipolar 16 mm Pacote c/ 2', type: 'Modelo Bipolar 16 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros', packaging: 'PCT C/2 UN / Master 50 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '04.12', name: 'Conector de Porcelana Tripolar 10 mm Caixa c/ 50', type: 'Modelo Tripolar 10 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros elétricos', packaging: 'CX C/50 UN / Master 10 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '04.14', name: 'Conector de Porcelana Tripolar 16 mm Caixa c/ 12', type: 'Modelo Tripolar 16 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros elétricos', packaging: 'CX C/12 UN / Master 27 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '24.06', name: 'Conector de Porcelana Tripolar 10 mm Pacote c/ 1', type: 'Modelo Tripolar 10 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '24.25', name: 'Conector de Porcelana Tripolar 10 mm Pacote c/ 2', type: 'Modelo Tripolar 10 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros', packaging: 'PCT C/2 UN / Master 50 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '24.43', name: 'Conector de Porcelana Tripolar 16 mm Pacote c/ 1', type: 'Modelo Tripolar 16 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros', packaging: 'PCT C/1 UN / Master 150 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '24.47', name: 'Conector de Porcelana Tripolar 16 mm Pacote c/ 2', type: 'Modelo Tripolar 16 mm; Até 350°C; Isolação até 600V; Ideal p/ chuveiros', packaging: 'PCT C/2 UN / Master 50 UN', ncm: '8536.90.90', cest: '21.049.00' },
  { code: '40.30', name: 'Isolador de Porcelana Roldana 67 x 72 mm', type: 'Modelo Isolador Roldana; Tamanho 67 x 72 mm; Porcelana esmaltada; Uso industrial rede elétrica', packaging: 'Middle 10 UN / Master 40 UN', ncm: '8546.20.00', cest: '21.049.00' },
  { code: '40.31', name: 'Isolador de Porcelana Pimentão 54 x 72 mm', type: 'Modelo Isolador Pimentão; Tamanho 54 x 72 mm; Porcelana esmaltada; Uso industrial rede elétrica', packaging: 'Middle 10 UN / Master 40 UN', ncm: '8546.20.00', cest: '21.049.00' },
  { code: '40.32', name: 'Isolador de Porcelana Roldana 54 x 57 mm', type: 'Modelo Isolador Roldana; Tamanho 54 x 57 mm; Porcelana esmaltada; Uso industrial rede elétrica', packaging: 'Middle 10 UN / Master 60 UN', ncm: '8546.20.00', cest: '21.049.00' },
  { code: '40.16', name: 'Pino Polarizado de Porcelana Bipolar 20A 380V', type: 'Modelo Bipolar; Corrente 20 A; Tensão até 380V; Pinos com borne interno', packaging: 'Middle 10 UN / Master 80 UN', ncm: '8536.69.10', cest: '21.048.00' },
  { code: '40.20', name: 'Pino Polarizado de Porcelana Bipolar 30A 380V', type: 'Modelo Bipolar; Corrente 30 A; Tensão até 380V; Pinos com borne interno', packaging: 'Middle 10 UN / Master 80 UN', ncm: '8536.69.10', cest: '21.048.00' },

  // Página 7 (24 itens)
  { code: '40.18', name: 'Pino Polarizado de Porcelana Tripolar 20A 380V', type: 'Modelo Tripolar; Corrente 20 A; Tensão até 380V; Pinos com borne interno', packaging: 'Middle 10 UN / Master 80 UN', ncm: '8536.69.10', cest: '21.048.00' },
  { code: '40.22', name: 'Pino Polarizado de Porcelana Tripolar 30A 380V', type: 'Modelo Tripolar; Corrente 30 A; Tensão até 380V; Pinos com borne interno', packaging: 'Middle 10 UN / Master 80 UN', ncm: '8536.69.10', cest: '21.048.00' },
  { code: '40.17', name: 'Tomada Polarizada de Porcelana Bipolar 20A 380V', type: 'Modelo Bipolar; Corrente 20 A; Tensão até 380V; Porcelana reforçada', packaging: 'Middle 10 UN / Master 80 UN', ncm: '8536.69.10', cest: '21.048.00' },
  { code: '40.21', name: 'Tomada Polarizada de Porcelana Bipolar 30A 380V', type: 'Modelo Bipolar; Corrente 30 A; Tensão até 380V; Porcelana reforçada', packaging: 'Middle 10 UN / Master 80 UN', ncm: '8536.69.10', cest: '21.048.00' },
  { code: '40.19', name: 'Tomada Polarizada de Porcelana Tripolar 20A 380V', type: 'Modelo Tripolar; Corrente 20 A; Tensão até 380V; Porcelana reforçada', packaging: 'Middle 10 UN / Master 80 UN', ncm: '8536.69.10', cest: '21.048.00' },
  { code: '40.23', name: 'Tomada Polarizada de Porcelana Tripolar 30A 380V', type: 'Modelo Tripolar; Corrente 30 A; Tensão até 380V; Porcelana reforçada', packaging: 'Middle 10 UN / Master 80 UN', ncm: '8536.69.10', cest: '21.048.00' },
  { code: '40.25', name: 'Tomada Industrial de Porcelana Sobrepor 25A 250V', type: 'Dimensão 6,5x6,5x5 cm; Corrente 25A; Tensão máx. 250V; Alta temperatura; Sobrepor', packaging: 'Middle 25 UN / Master 100 UN', ncm: '8536.69.10', cest: '21.048.00' },
  { code: '13.03', name: 'Soquete para Lâmpada Tubular G13 Foxlux c/ 50', type: 'Tensão máx. 250V; Potência 200W; Corrente 4A; Rabicho 10cm; Base G-13', packaging: 'PCT C/50 UN / Master 20 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '13.04', name: 'Soquete para Lâmpada Dicróica GU10 Porcelana c/ 10', type: 'Corpo em porcelana; Tensão 250V; Compatível com lâmpadas GU10', packaging: 'PCT C/10 UN / Master 100 UN', ncm: '8536.61.00', cest: '21.048.00' },
  { code: '03.02', name: 'Chave Teste 100V a 500V Foxlux Unidade', type: 'Corrente 100V-500V; Cabo injetado em PVC; Haste em aço carbono; Medições e aferições', packaging: 'UN / Middle 50 UN / Master 300 UN', ncm: '9030.33.10', cest: '08.001.00' },
  { code: '03.03', name: 'Chave Teste 100V a 500V Foxlux Pacote c/ 12', type: 'Corrente 100V-500V; Cabo injetado em PVC; Haste em aço carbono; Medições e aferições', packaging: 'PCT C/12 UN / Master 50 UN', ncm: '9030.33.10', cest: '08.001.00' },
  { code: '03.05', name: 'Chave Teste 100V a 500V Foxlux Caixa Master', type: 'Corrente 100V-500V; Cabo injetado em PVC; Haste em aço carbono; Medições e aferições', packaging: 'UN / Middle 100 UN / Master 1000 UN', ncm: '9030.33.10', cest: '08.001.00' },
  { code: '03.06', name: 'Chave Teste 100V a 500V Foxlux Pacote c/ 10', type: 'Corrente 100V-500V; Cabo injetado em PVC; Haste em aço carbono; Medições e aferições', packaging: 'PCT C/10 UN / Master 60 UN', ncm: '9030.33.10', cest: '08.001.00' },
  { code: '03.07', name: 'Chave Teste Digital 12V a 220V com Display LCD', type: 'Corrente 12V-220V (Digital); Cabo injetado em PVC; Haste aço carbono; Display LCD', packaging: 'BLISTER / Middle 50 UN / Master 500 UN', ncm: '9030.33.10', cest: '08.001.00' },
  { code: '03.08', name: 'Chave Teste 100V a 500V Foxlux Pote c/ 50', type: 'Corrente 100V-500V; Cabo injetado em PVC; Haste em aço carbono; Pote com 50 unidades', packaging: 'POTE C/50 UN / Master 8 UN', ncm: '9030.33.10', cest: '08.001.00' },
  { code: '03.09', name: 'Testador de Continuidade e Tensão AC 70V a 600V', type: 'Circuito contínuo; Identifica polaridade; Detecta fase 70VAC a 600VAC sem contato', packaging: 'BLISTER / Middle 10 UN / Master 120 UN', ncm: '9030.33.10', cest: '08.001.00' },
  { code: '16.01', name: 'Programador de Tempo Timer Analógico Bivolt 15min', type: 'Modelo Analógico; Bivolt; Intervalos 15min; Potência 1300W(127V)/2200W(220V); Fuse box', packaging: 'BLISTER / Middle 6 UN / Master 48 UN', ncm: '9107.00.10', cest: '21.050.00' },
  { code: '16.02', name: 'Programador de Tempo Timer Digital Bivolt 20 Prog', type: 'Modelo Digital; Bivolt; 20 programações intervalo 1min; Bateria interna p/ memória', packaging: 'BLISTER / Middle 6 UN / Master 48 UN', ncm: '9107.00.10', cest: '21.050.00' },
  { code: '16.08', name: 'Programador de Tempo Timer Industrial Digital 220V 16A', type: 'Modelo Industrial Digital; Tensão 220V; 28 programações; Potência resistiva 3000W(16A)', packaging: 'CAIXA / Middle 5 UN / Master 50 UN', ncm: '9107.00.10', cest: '21.050.00' },
  { code: '12.01', name: 'Campainha Sem Fio FX CAD 3 Bivolt 36 Toques', type: 'Modelo FX CAD 3 (36 toques); Alimentação Bivolt; Acionador resistente à chuva IP-44; Anatel', packaging: 'BLISTER / Middle 10 UN / Master 60 UN', ncm: '8531.80.00', cest: '21.051.00' },
  { code: '12.19', name: 'Campainha Sem Fio FX CAD 6 a Pilha 36 Toques', type: 'Modelo FX CAD 6 (36 toques); Alimentação 3 pilhas AAA; Acionador chuva IP-44; Anatel', packaging: 'BLISTER / Middle 10 UN / Master 60 UN', ncm: '8531.80.00', cest: '21.051.00' },
  { code: '30.04', name: 'Alicate Amperímetro com Multímetro Profissional', type: 'Alimentação 9V; Bip sonoro continuidade; Detecção NCV acima 90V; Data Hold', packaging: 'CX / Master 10 UN', ncm: '9030.31.00', cest: '08.001.00' },
  { code: '30.05', name: 'Alicate Amperímetro com Multímetro Profissional Mini', type: 'Alimentação 2 pilhas AAA; Alta precisão; Bip sonoro; NCV acima 90V; Data Hold', packaging: 'CX / Master 10 UN', ncm: '9030.31.00', cest: '08.001.00' },
  { code: '30.02', name: 'Multímetro Digital com Alicate Amperímetro 1000A', type: 'Alimentação 9V; Tensão DC/AC até 1000A; Cat II; Congelamento de leitura; MÁX/MÍN', packaging: 'CX / Master 20 UN', ncm: '9030.31.00', cest: '08.001.00' },

  // Página 8 (19 itens)
  { code: '30.01', name: 'Multímetro Digital Foxlux DC/AC HFE Diodo', type: 'Alimentação 9V; Mede tensão DC/AC, corrente contínua e resistência; Testes diodo e transistor', packaging: 'BLISTER / Middle 10 UN / Master 60 UN', ncm: '9030.31.00', cest: '08.001.00' },
  { code: '30.03', name: 'Multímetro Digital com Testador de Cabos de Rede', type: 'Alimentação 9V; Com testador cabos RJ45, RJ12 e RJ11; Multímetro digital completo', packaging: 'BLISTER / Middle 10 UN / Master 60 UN', ncm: '9030.31.00', cest: '08.001.00' },
  { code: '30.07', name: 'Multímetro Profissional Digital 10A DC com Lanterna', type: '10 A DC; 2 pilhas AAA; Pontas reforçadas; NCV teste por aproximação; Imã fixação; Lanterna', packaging: 'UN / Master 24 UN', ncm: '9030.31.00', cest: '08.001.00' },
  { code: '30.20', name: 'Luxímetro Digital Medidor de Luminosidade Lux/FC', type: 'Alimentação 2 pilhas AAA; Detecção mín/máx; Display iluminado; Unidades Lux/FC; Data Hold', packaging: 'CX / Middle 10 UN / Master 40 UN', ncm: '9027.80.99', cest: '08.001.00' },
  { code: '64.07', name: 'Bomba D\'Água Submersível Tipo Sapo 1 CV 750W 127V', type: 'Potência 1 CV (750W); Tensão 127V; Boia automática; IP68; Vazão 13.000L/h; Altura 8mca', packaging: 'CX / Master 4 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.08', name: 'Bomba D\'Água Submersível Tipo Sapo 1 CV 750W 220V', type: 'Potência 1 CV (750W); Tensão 220V; Boia automática; IP68; Vazão 13.000L/h; Altura 8mca', packaging: 'CX / Master 4 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.24', name: 'Chave Boia Eletrônica Automática Bivolt 16A IP68', type: 'Tensão Bivolt; Corrente 16A; IP68; Cabo 1,5m; Temp máx 55°C; 2 níveis superior/inferior', packaging: 'CX / Middle 30 UN', ncm: '9032.89.82', cest: '21.050.00' },
  { code: '64.03', name: 'Bomba D\'Água Periférica 1/2 CV 127V 30 mca', type: 'Potência 1/2 CV; 127V; Consumo 0.37 KHW; Sucção 1 pol; Altura manométrica 30mca; Até 7m profundidade', packaging: 'CX / Master 6 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.04', name: 'Bomba D\'Água Periférica 1/2 CV 220V 30 mca', type: 'Potência 1/2 CV; 220V; Consumo 0.37 KHW; Sucção 1 pol; Altura manométrica 30mca; Até 7m profundidade', packaging: 'CX / Master 6 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.02', name: 'Bomba D\'Água Periférica 1 CV Bivolt 50 mca', type: 'Potência 1 CV; Bivolt; Consumo 0.75 KHW; Sucção 1 pol; Altura manométrica até 50mca; Até 7m profundidade', packaging: 'CX / Master 1 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.30', name: 'Bomba Pressurizadora de Água 120W 127V Fluxostato', type: 'Potência 120 W; 127 V; Fluxostato incorporado; Altura 9mca; Vazão 1800L/h; Silenciosa', packaging: 'Master 8 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.31', name: 'Bomba Pressurizadora de Água 120W 220V Fluxostato', type: 'Potência 120 W; 220 V; Fluxostato incorporado; Altura 9mca; Vazão 1800L/h; Silenciosa', packaging: 'Master 8 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.33', name: 'Bomba Pressurizadora de Água 360W 127V Fluxostato', type: 'Potência 360 W; 127 V; Fluxostato incorporado; Altura 12mca; Vazão 3600L/h; Silenciosa', packaging: 'Master 4 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.34', name: 'Bomba Pressurizadora de Água 360W 220V Fluxostato', type: 'Potência 360 W; 220 V; Fluxostato incorporado; Altura 12mca; Vazão 3600L/h; Silenciosa', packaging: 'Master 4 UN', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.60', name: 'Bomba Caneta Submersa Poço 0,33 CV 220V 30 mca', type: 'Tensão 220 V; Potência 0,33 CV - 250 W; 30 mca; 6 rotores; Imersão 80m; Vazão 4200L/h; Caixa comando', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.62', name: 'Bomba Caneta Submersa Poço 0,5 CV 220V 43 mca', type: 'Tensão 220 V; Potência 0,5 CV - 370 W; 43 mca; 5 rotores; Imersão 80m; Vazão 4200L/h; Caixa comando', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.66', name: 'Bomba Caneta Submersa Poço 1 CV 220V 73 mca', type: 'Tensão 220 V; Potência 1 CV - 750 W; 73 mca; 9 rotores; Imersão 80m; Vazão 4200L/h; Caixa comando', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.68', name: 'Bomba Caneta Submersa Poço 1,5 CV 220V 101 mca', type: 'Tensão 220 V; Potência 1,5 CV - 1100 W; 101 mca; 13 rotores; Imersão 80m; Vazão 4200L/h; Caixa comando', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.70', name: 'Bomba Caneta Submersa Poço 2 CV 220V 118 mca', type: 'Tensão 220 V; Potência 2 CV - 1500 W; 118 mca; 20 rotores; Imersão 80m; Vazão 4200L/h; Caixa comando', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },

  // Página 9 (20 itens)
  { code: '64.72', name: 'Bomba Caneta Submersa Poço 0,5 CV 127V 43 mca', type: 'Tensão 127 V; Potência 0,5 CV - 370 W; 43 mca; 5 rotores; Imersão 80m; Vazão 4200L/h; Caixa comando', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.73', name: 'Bomba Caneta Submersa Poço 1 CV 127V 73 mca', type: 'Tensão 127 V; Potência 1 CV - 750 W; 73 mca; 9 rotores; Imersão 80m; Vazão 4200L/h; Caixa comando', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.74', name: 'Bomba Caneta Submersa Poço 1,5 CV 127V 101 mca', type: 'Tensão 127 V; Potência 1,5 CV - 1100 W; 101 mca; 13 rotores; Imersão 80m; Vazão 4200L/h; Caixa comando', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.40', name: 'Bomba Autoaspirante 1/2 CV 220V 37 mca', type: 'Tensão 220 V; Potência 1/2 CV; Sucção 8 mca; Altura 37 mca; Vazão 2.200 L/h; Termostato', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.41', name: 'Bomba Autoaspirante 1/2 CV Bivolt 37 mca', type: 'Tensão Bivolt; Potência 1/2 CV; Sucção 8 mca; Altura 37 mca; Vazão 2.200 L/h; Termostato', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.42', name: 'Bomba Autoaspirante 1 CV Bivolt 55 mca', type: 'Tensão Bivolt; Potência 1 CV; Sucção 8 mca; Altura 55 mca; Vazão 3.300 L/h; Termostato', packaging: 'CAIXA', ncm: '8413.70.80', cest: '10.025.00' },
  { code: '64.52', name: 'Pressostato Eletrônico de Nível e Pressão Bivolt', type: 'Tensão Bivolt; Potência 550W/1100W; Corrente 10A; Pressão 1,5-10 BAR; Conexões 1"x1"; Proteção a seco', packaging: 'Master 12 UN', ncm: '9032.20.00', cest: '21.050.00' },
  { code: '52.03', name: 'Relé Fotoelétrico 127V 1000W NF IP-54', type: 'Tensão 127 V; Potência 1000 W (1200 VA); Contatos NF; Proteção partida; Latão estanhado; IP-54', packaging: 'CX / Middle 20 UN / Master 80 UN', ncm: '8536.49.00', cest: '21.050.00' },
  { code: '52.04', name: 'Relé Fotoelétrico 220V 1000W NF IP-54', type: 'Tensão 220 V; Potência 1000 W (1800 VA); Contatos NF; Proteção partida; Latão estanhado; IP-54', packaging: 'CX / Middle 20 UN / Master 80 UN', ncm: '8536.49.00', cest: '21.050.00' },
  { code: '52.05', name: 'Relé Fotoelétrico Bivolt 1000W NF IP-54', type: 'Tensão Bivolt; Potência 1000 W (1800 VA); Contatos NF; Proteção partida; Latão estanhado; IP-54', packaging: 'CX / Middle 20 UN / Master 80 UN', ncm: '8536.49.00', cest: '21.050.00' },
  { code: '52.08', name: 'Relé Fotoelétrico Bivolt 6A 600W/1000W IP-54', type: 'Tensão Bivolt; Potência 600W(127V)/1000W(220V); Corrente 6A; Proteção IP-54', packaging: 'Middle 20 UN / Master 120 UN', ncm: '8536.49.00', cest: '21.050.00' },
  { code: '52.07', name: 'Base para Fixação e Instalação de Relé Fotoelétrico', type: 'Fio diâmetro 1mm e 25cm comprimento; Uso externo; Base ajustável', packaging: 'Middle 20 UN / Master 120 UN', ncm: '8538.90.90', cest: '21.050.00' },
  { code: '26.01', name: 'Pistola de Cola Quente 15 W Bivolt Pequena', type: 'Tamanho Pequeno; Bico latão; Cabo e plugue normatizado; Bivolt automático; Aquecimento 3-5 min', packaging: 'BLISTER / Middle 12 UN / Master 48 UN', ncm: '8419.89.99', cest: '08.001.00' },
  { code: '26.02', name: 'Pistola de Cola Quente 40 W Bivolt Média', type: 'Tamanho Médio; Proteção borracha; Cabo e plugue normatizado; Bivolt; Aquecimento 3-5 min', packaging: 'BLISTER / Middle 12 UN / Master 48 UN', ncm: '8419.89.99', cest: '08.001.00' },
  { code: '26.03', name: 'Pistola de Cola Quente 80 W Bivolt Grande', type: 'Tamanho Grande; Proteção borracha; Cabo e plugue normatizado; Bivolt; Aquecimento 3-5 min', packaging: 'BLISTER / Middle 12 UN / Master 48 UN', ncm: '8419.89.99', cest: '08.001.00' },
  { code: '24.45', name: 'Bastão de Cola de Silicone 11,2 x 100 mm c/ 6', type: 'Dimensão 11,2 x 100 mm; Adesivo termoplástico de alta fixação', packaging: 'PCT 6 UN / Master 150 UN', ncm: '3506.10.90', cest: '10.001.00' },
  { code: '24.46', name: 'Bastão de Cola de Silicone 7,2 x 100 mm c/ 12', type: 'Dimensão 7,2 x 100 mm; Adesivo termoplástico de alta fixação', packaging: 'PCT 12 UN / Master 150 UN', ncm: '3506.10.90', cest: '10.001.00' },
  { code: '26.04', name: 'Bastão de Cola de Silicone 7,2 x 300 mm 1 Kg', type: 'Dimensão 7,2 x 300 mm; Pacote com 1 KG de bastões', packaging: 'PCT C/1 KG / Master 20 UN', ncm: '3506.10.90', cest: '10.001.00' },
  { code: '26.05', name: 'Bastão de Cola de Silicone 11,2 x 300 mm 1 Kg', type: 'Dimensão 11,2 x 300 mm; Pacote com 1 KG de bastões', packaging: 'PCT C/1 KG / Master 20 UN', ncm: '3506.10.90', cest: '10.001.00' },
  { code: '25.01', name: 'Ferro de Soldar 30 W 127 V com Ponteira Inox', type: 'Potência 30 W; Tensão 127 V; Ponteira rosqueável de aço inox; Cabo emborrachado; Suporte incluso', packaging: 'BLISTER / Middle 20 UN / Master 80 UN', ncm: '8515.11.00', cest: '08.001.00' },

  // Página 10 (10 itens)
  { code: '25.04', name: 'Ferro de Soldar 30 W 220 V com Ponteira Inox', type: 'Potência 30 W; Tensão 220 V; Ponteira rosqueável de aço inox; Cabo emborrachado; Suporte incluso', packaging: 'BLISTER / Middle 20 UN / Master 80 UN', ncm: '8515.11.00', cest: '08.001.00' },
  { code: '25.02', name: 'Ferro de Soldar 40 W 127 V com Ponteira Inox', type: 'Potência 40 W; Tensão 127 V; Ponteira rosqueável de aço inox; Cabo emborrachado; Suporte incluso', packaging: 'BLISTER / Middle 20 UN / Master 80 UN', ncm: '8515.11.00', cest: '08.001.00' },
  { code: '25.05', name: 'Ferro de Soldar 40 W 220 V com Ponteira Inox', type: 'Potência 40 W; Tensão 220 V; Ponteira rosqueável de aço inox; Cabo emborrachado; Suporte incluso', packaging: 'BLISTER / Middle 20 UN / Master 80 UN', ncm: '8515.11.00', cest: '08.001.00' },
  { code: '25.03', name: 'Ferro de Soldar 60 W 127 V com Ponteira Inox', type: 'Potência 60 W; Tensão 127 V; Ponteira rosqueável de aço inox; Cabo emborrachado; Suporte incluso', packaging: 'BLISTER / Middle 20 UN / Master 80 UN', ncm: '8515.11.00', cest: '08.001.00' },
  { code: '25.06', name: 'Ferro de Soldar 60 W 220 V com Ponteira Inox', type: 'Potência 60 W; Tensão 220 V; Ponteira rosqueável de aço inox; Cabo emborrachado; Suporte incluso', packaging: 'BLISTER / Middle 20 UN / Master 80 UN', ncm: '8515.11.00', cest: '08.001.00' },
  { code: '25.07', name: 'Suporte para Ferro de Soldar Foxlux', type: 'Suporte metálico reforçado para descanso seguro de ferro de soldar', packaging: 'UN / Middle 10 UN / Master 40 UN', ncm: '8515.90.00', cest: '08.001.00' },
  { code: '25.08', name: 'Sugador de Solda com Corpo de Alumínio', type: 'Sugador de solda com alta sucção; Bico resistente a altas temperaturas', packaging: 'UN / Middle 50 UN / Master 200 UN', ncm: '8205.59.00', cest: '08.001.00' },
  { code: '25.11', name: 'Estanho Liga 63/37 Tubo com 4 m Foxlux', type: 'Estanho Liga 63/37 (Tubo c/4m); Fluxo resinoso ativo; Soldagem de precisão', packaging: 'CX C/36 UN / Master 4 UN', ncm: '8311.30.00', cest: '08.001.00' },
  { code: '25.12', name: 'Estanho Liga 63/37 Carretel 250 g Foxlux', type: 'Estanho Liga 63/37 Carretel 250g; Fluxo resinoso ativado; Uso profissional', packaging: 'UN / Master 30 UN', ncm: '8311.30.00', cest: '08.001.00' },
  { code: '24.80', name: 'AS Estanho Liga 63/37 Pacote c/ 12', type: 'AS Estanho Liga 63/37; Embalagem Pacote com 12 unidades', packaging: 'PCT C/12 UN / Master 12 UN', ncm: '8311.30.00', cest: '08.001.00' }
];

console.log('Total items loaded:', rawItems.length);

async function importBatch() {
  const batchSize = 100;
  const nowIso = new Date().toISOString();
  
  for (let i = 0; i < rawItems.length; i += batchSize) {
    const chunk = rawItems.slice(i, i + batchSize);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const docId = `prod_foxlux_eletricos_${item.code.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const docRef = doc(db, 'products', docId);

      const productData = {
        id: docId,
        code: item.code,
        sku: `SKU-FOXLUX-${item.code}`,
        name: `${item.name} Foxlux`,
        description: `${item.name} Foxlux. Detalhes: ${item.type}. Embalagem: ${item.packaging}. Faturamento: NCM ${item.ncm}, CEST ${item.cest}, CFOP 5102, CST 102, ICMS 18%, IPI 5%, PIS 0.65%, COFINS 3.00%.`,
        category: 'Materiais Elétricos',
        department: 'Materiais Elétricos Foxlux',
        productClass: 'Materiais Elétricos',
        supplierName: 'Foxlux Materiais Elétricos',
        
        // Estoque rigorosamente ZERO
        stock: 0,
        minStock: 5,
        unit: 'UN',
        packagingType: item.packaging,
        
        // Preços de referência
        costPrice: 0,
        price: 0,
        profitMarginPercent: 40,
        
        // Regras de visibilidade
        showInStore: false,
        isActive: true,
        isImported: true,
        
        // Imagem oficial
        imageUrl: '/ponto_chave_logo.jpg',
        gallery: ['/ponto_chave_logo.jpg'],
        
        // Fiscal e tributário legal
        technicalSpecs: `NCM: ${item.ncm} | CEST: ${item.cest} | CFOP: 5102 | CST: 102 | ICMS: 18% | IPI: 5% | PIS: 0.65% | COFINS: 3.00% | Embalagem: ${item.packaging} | Departamento: Materiais Elétricos Foxlux`,
        icmsPercent: 18,
        ipiPercent: 5,
        pisPercent: 0.65,
        cofinsPercent: 3.0,
        otherTaxesPercent: 0,
        
        // Rastreabilidade de lote
        purchaseDate: '2026-08-30',
        invoiceNumber: 'PDF-FOXLUX-ELETRICOS-20260830',
        importBatchId: 'batch_foxlux_eletricos_20260830',
        importBatchName: 'Importação PDF Foxlux Materiais Elétricos (30/08/2026)',
        importedAt: nowIso
      };

      batch.set(docRef, productData);
    }

    await batch.commit();
    console.log(`Committed chunk ${i + 1} to ${Math.min(i + batchSize, rawItems.length)}`);
  }

  console.log('Importação de Materiais Elétricos Foxlux concluída com sucesso!');
  process.exit(0);
}

importBatch().catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
