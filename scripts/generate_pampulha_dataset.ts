import * as fs from 'fs';
import * as path from 'path';

// Dados brutos das 20 páginas do PDF oficial anexado pelo usuário
export const rawPampulhaOcrLines: string[] = [
  // Página 1
  `2394\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE LUZ - PVC - FUNDO MÓVEL DUPLO ( FMD ) VERDE\tRIB. FABRIL\t45 un.\tR$ 4,20`,
  `2393\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE LUZ - PVC - FUNDO MÓVEL SIMPLES ( FMS ) VERDE\tRIB. FABRIL\t90 un.\tR$ 3,90`,
  `8091\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE LUZ - PVC - FUNDO MÓVEL SIMPLES ( FMS ) VERDE C/SUPORTE P/LAJE\tRIB. FABRIL\t1 un.\tR$ 8,30`,
  `2390\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE LUZ 2x4 - PVC - COR VERDE\tRIB. FABRIL\t180 un.\tR$ 1,57`,
  `5640\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE LUZ 2x4 - PVC - COR VERDE DRYWALL C/10 UNDS\tRIB. FABRIL\t12 un.\tR$ 19,60`,
  `2391\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE LUZ 3x3 - PVC - COR VERDE\tRIBEIRO FABRIL\t60 un.\tR$ 2,40`,
  `6111\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE LUZ 4x4 - PVC - COR VERDE DRYWALL C/10 UNDS\tRIB. FABRIL\t80 un.\tR$ 39,80`,
  `2392/7227\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE LUZ 4x4 - PVC - COR VERDE OU PRETA DA PIAL\tRIB. FABRIL\t90 un.\tR$ 3,60`,
  `7431\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM DE EMBUTIR PVC 10 x 10 C/TAMPA CINZA\tJ A\t1 un.\tR$ 6,30`,
  `6530\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM DE EMBUTIR PVC 15 x 15 C/TAMPA BRANCA\tTAF\t20 un.\tR$ 14,70`,
  `2984\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM DE EMBUTIR PVC 15 x 15 C/TAMPA CINZA\tJ A\t1 un.\tR$ 8,70`,
  `27\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM DE EMBUTIR CHAPA 15 x 15\tPALOMAR\t40 un.\tR$ 21,40`,
  `28\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM DE EMBUTIR CHAPA 20 x 20\tPALOMAR\t10 un.\tR$ 33,80`,
  `6470\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM DE EMBUTIR CHAPA 40 x 40\tPALOMAR\t1 un.\tR$ 116,00`,
  `7721\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM DE EMBUTIR PVC 20 x 20 Branca\tBIKI\t1 un.\tR$ 36,80`,
  `8008\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM DE EMBUTIR PVC 20 x 20 CINZA\tRCA\t1 un.\tR$ 17,95`,
  `5395\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM EXTERNA 15 x 15 x 8 PVC BRANCA\tPERLEX\t1 un.\tR$ 17,90`,
  `7696\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA DE PASSAGEM EXTERNA 22 x 18 x 8 PVC BRANCA\tPERLEX\t1 un.\tR$ 31,70`,
  `7386\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA EXTERNA P/INTERRUPTOR DE VENTILADOR 12CM x 7,50CM\tAPLACEL\t1 un.\tR$ 5,20`,
  `2180\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA PADRÃO CEMIG C M 1 MONOFÁSICA\tJ S A\t1 un.\tR$ 99,70`,
  `2181\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA PADRÃO CEMIG C M 13 MONOFÁSICA VIA PÚBLICA\tJ S A\t1 un.\tR$ 113,60`,
  `1830\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA PADRÃO CEMIG C M 14 TRIFÁSICA VIA PÚBLICA\tJ S A\t1 un.\tR$ 175,80`,
  `2396\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA PADRÃO CEMIG C M 2 TRIFÁSICA\tJ S A\t1 un.\tR$ 169,80`,
  `2005\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA PADRÃO CEMIG C M 7 DE DERIVAÇÃO POLIFÁSICA\tJ S A\t1 un.\tR$ 167,80`,
  `2006\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAIXA PADRÃO CEMIG C M 8 CHAVE GERAL\tJ S A\t1 un.\tR$ 189,00`,
  `3891\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCALHA SLIM P/LÂMPADA DE LED 2 x 10W 60CM\tBLUMENAU\t10 un.\tR$ 22,50`,
  `3893\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCALHA SLIM P/LÂMPADA DE LED 2 x 20W 1,20CM\tBLUMENAU\t10 un.\tR$ 33,70`,
  `3441/3314\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAMPAINHA CIGARRA EMBUTIR 127V OU EXTERNA BRANCA 127V\tBIKI\t20 un.\tR$ 15,90`,
  `924\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAMPAINHA MUSICAL C/TERMOSTATO BRANCA 127V\tBIKI\t20 un.\tR$ 41,00`,
  `2096\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCAMPAINHA MUSICAL S/FIO C/PINO 2PÓLOS 127V\tIMPORTADO\t1 un.\tR$ 31,80`,
  `7115\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCANALETA 10 x 10 (FINA) 2MTS BRANCA C/FITA DUPLA FACE\tENERBRAS\t20 un.\tR$ 6,90`,
  `2064\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCANALETA 20 x 10 - CONEXÃO COTOVELO 90º\tTRAMONTINA\t50 un.\tR$ 1,70`,
  `2060/2061\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCANALETA 20 x 10 - CONEXÃO LUVA OU JUNÇÃO "T"\tTRAMONTINA\t50 un.\tR$ 1,20`,
  `5205\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCANALETA 20 x 10 2MTS BRANCA C/FITA DUPLA FACE\tENERBRAS\t30 un.\tR$ 6,30`,
  `2062/2063\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCANALETA 20 x 10 CONEXÃO COTOVELO INTERNO OU EXTERNO\tTRAMONTINA\t50 un.\tR$ 0,90`,
  `5809\tMateriais Elétricos PAMPULHA\tMateriais Elétricos e Ferramentas\tCANALETA 20 x 12 2MTS BRANCA C/FITA DUPLA FACE\tPIAL\t30 un.\tR$ 11,40`
];

console.log('Script base criado com sucesso!');
