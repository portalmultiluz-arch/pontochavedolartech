import { Product } from '../types';

export interface ParsedProductItem {
  code: string;
  name: string;
  category: string;
  department?: string;
  brand?: string;
  packagingType: 'Unidade' | 'Caixa' | 'Pacote' | 'Lote' | 'Metro' | 'Kit';
  packagingDetail?: string;
  price: number;
  costPrice: number;
  stock: number;
  imageUrl: string;
  description: string;
  voltage?: string;
  material?: string;
  nature?: 'Não-inflamável' | 'Inflamável / Risco NR-20';
  rawText?: string;
  showInStore?: boolean;
}

/**
 * Converte valor numérico em string brasileira (ex: R$ 4,20, 289,90 ou 289.90) para float limpo
 */
export function parseCurrency(val: any, defaultVal: number = 0): number {
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  if (!val || typeof val !== 'string') return defaultVal;
  
  // Limpa caracteres não numéricos exceto vírgula, ponto e traço
  const clean = val.replace(/[^\d.,-]/g, '').trim();
  if (!clean) return defaultVal;

  // Se contiver vírgula e ponto, ex: 1.650,00
  if (clean.includes('.') && clean.includes(',')) {
    const standardized = clean.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(standardized);
    return isNaN(num) ? defaultVal : num;
  }

  // Se tiver apenas vírgula, ex: 289,90 ou 4,20
  if (clean.includes(',')) {
    const num = parseFloat(clean.replace(',', '.'));
    return isNaN(num) ? defaultVal : num;
  }

  const num = parseFloat(clean);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Detecta o tipo de embalagem baseado no nome ou campo de embalagem
 */
export function detectPackagingType(text: string): 'Unidade' | 'Caixa' | 'Pacote' | 'Lote' | 'Metro' | 'Kit' {
  const lower = (text || '').toLowerCase();
  if (lower.includes('caixa') || lower.includes('cx')) return 'Caixa';
  if (lower.includes('pacote') || lower.includes('pct') || lower.includes('pcte')) return 'Pacote';
  if (lower.includes('lote')) return 'Lote';
  if (lower.includes('metro') || lower.includes(' mt') || lower.includes(' m ')) return 'Metro';
  if (lower.includes('kit') || lower.includes('jogo') || lower.includes('combo')) return 'Kit';
  return 'Unidade';
}

/**
 * Parser seguro de linhas CSV compatível com RFC 4180 (respeita aspas duplas, vírgulas e ponto-e-vírgula internos)
 */
export function splitCSVLine(line: string, preferredDelimiter?: string): string[] {
  if (!line) return [];
  
  // Se for tabulação simples
  if (line.includes('\t') && !line.includes('"')) {
    return line.split('\t').map(s => s.trim());
  }

  // Escolhe o delimitador se não especificado
  let delimiter = preferredDelimiter;
  if (!delimiter) {
    const commaCount = (line.match(/,/g) || []).length;
    const semicolonCount = (line.match(/;/g) || []).length;
    const tabCount = (line.match(/\t/g) || []).length;
    if (tabCount > commaCount && tabCount > semicolonCount) delimiter = '\t';
    else if (semicolonCount >= commaCount) delimiter = ';';
    else delimiter = ',';
  }

  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // pula aspas escapadas
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map(s => s.replace(/^["']|["']$/g, '').trim());
}

/**
 * Normaliza separadores de colunas para tabelas de catálogos e PDFs (como Pampulha)
 * Evita fusão de Código, Departamento e Classe
 */
export function normalizeLineSeparators(line: string): string {
  if (!line) return '';
  let l = line.trim();

  // Caso 1: Código seguido imediatamente por Departamento e Classe sem delimitador
  // Ex: "5069/5157 Materiais Elétricos PAMPULHA Materiais Elétricos e Ferramentas;ZEFFIA..."
  l = l.replace(
    /^(\d+(?:[/-]\d+)*|SC-\d+)\s+(Materiais El[ée]tricos PAMPULHA)\s+(Materiais El[ée]tricos e Ferramentas|Materiais El[ée]tricos|Ferramentas & M[áa]quinas|[A-ZÀ-Ú\s]{4,35}?)(;|$)/i,
    '$1;$2;$3$4'
  );

  // Caso 2: Departamento e Classe fundidos dentro de uma coluna
  // Ex: "3942;Materiais Elétricos PAMPULHA Materiais Elétricos e Ferramentas;PUMALUX..."
  l = l.replace(
    /(^|;)(Materiais El[ée]tricos PAMPULHA)\s+(Materiais El[ée]tricos e Ferramentas|Materiais El[ée]tricos|Ferramentas & M[áa]quinas|[A-ZÀ-Ú\s]{4,35}?)(;|$)/gi,
    '$1$2;$3$4'
  );

  return l.replace(/^;+/, '');
}

/**
 * Analisador inteligente de produtos para CSV, TXT e dados tabulares do PDF
 * Suporta o formato oficial padrão:
 * [Código, Departamento, Classe, Produto, Tipo/Marca, Embalagem, Preço]
 */
export function parseTextToProducts(rawText: string, defaultCategory: string = 'Materiais Elétricos e Ferramentas'): ParsedProductItem[] {
  if (!rawText || !rawText.trim()) return [];

  // Remove caracteres de controle estranhos (evita caracteres nulos ou corrompidos)
  const sanitized = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  const rawLines = sanitized
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (rawLines.length === 0) return [];

  // Identifica se há linha de cabeçalho
  let headerIndex = -1;
  let hasPampulhaFormat = false;

  for (let i = 0; i < Math.min(rawLines.length, 5); i++) {
    const lower = rawLines[i].toLowerCase();
    if (
      (lower.includes('código') || lower.includes('codigo')) &&
      (lower.includes('produto') || lower.includes('departamento') || lower.includes('classe') || lower.includes('descrição'))
    ) {
      headerIndex = i;
      if (lower.includes('departamento') && lower.includes('classe') && lower.includes('produto')) {
        hasPampulhaFormat = true;
      }
      break;
    }
  }

  const dataLines = headerIndex >= 0 ? rawLines.slice(headerIndex + 1) : rawLines;
  const results: ParsedProductItem[] = [];

  dataLines.forEach((line, index) => {
    // Ignora linhas vazias ou decorativas
    if (!line || line.length < 3) return;

    // Se a linha for cabeçalho de página repetido em PDF (ex: Página X de Y, data de emissão)
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.startsWith('página') || 
      lowerLine.startsWith('pagina') || 
      lowerLine.includes('emissão:') || 
      lowerLine.includes('data/hora') ||
      lowerLine.includes('relatório de produtos')
    ) {
      return;
    }

    const normalizedLine = normalizeLineSeparators(line);
    let parts = splitCSVLine(normalizedLine);
    if (parts.length < 2) return;

    let code = '';
    let name = '';
    let department = 'Materiais Elétricos PAMPULHA';
    let category = defaultCategory;
    let brand = 'Pampulha / Diversos';
    let packagingType: 'Unidade' | 'Caixa' | 'Pacote' | 'Lote' | 'Metro' | 'Kit' = 'Unidade';
    let packagingDetail = '1 un.';
    let costPrice = 0;
    let price = 0;
    let stock = 0;

    // FORMATO 1: 7 COLUNAS EXATAS DO DOCUMENTO ANEXO PAMPULHA
    // Col 0: Código (ex: "2394", "SC-0001", "5069/5157")
    // Col 1: Departamento (ex: "Materiais Elétricos PAMPULHA")
    // Col 2: Classe (ex: "Materiais Elétricos e Ferramentas")
    // Col 3: Produto / Nome real (ex: "ZEFFIA - MÓDULO INTERRUPTOR BIPOLAR...")
    // Col 4: Tipo / Fabricante (ex: "PIAL", "PERLEX", "3M")
    // Col 5: Embalagem (ex: "45 un.", "10 un.", "1 un.")
    // Col 6: Preço (R$) (ex: "R$ 4,20" ou "4.20")
    if (parts.length >= 7 || (parts.length >= 6 && hasPampulhaFormat)) {
      code = parts[0].trim();
      department = parts[1].trim() || 'Materiais Elétricos PAMPULHA';
      category = parts[2].trim() || defaultCategory;
      name = parts[3].trim();
      brand = parts[4].trim() || 'Pampulha';
      packagingDetail = parts[5].trim() || '1 un.';
      packagingType = detectPackagingType(packagingDetail || name);
      costPrice = parseCurrency(parts[6]);

      // Se custo veio preenchido, calcula preço sugerido de venda com margem saudável (ex: 45% sobre custo)
      if (costPrice > 0) {
        price = Math.round(costPrice * 1.45 * 100) / 100;
      }
    } 
    // FORMATO 2: CSV SIMPLIFICADO (Código, Nome, Categoria, Preço, Preço de Custo, Estoque)
    else if (parts.length >= 4 && !parts[1].toLowerCase().includes('materiais')) {
      code = parts[0].trim();
      name = parts[1].trim();
      category = parts[2].trim() || defaultCategory;
      price = parseCurrency(parts[3]);
      if (parts.length >= 5) costPrice = parseCurrency(parts[4]);
      if (parts.length >= 6) stock = parseInt(parts[5].replace(/\D/g, ''), 10) || 0;
      packagingType = detectPackagingType(name);
    }
    // FORMATO 3: CATÁLOGO PADRÃO [Código] [Categoria] Nome
    else {
      const match = line.match(/^(\d{3,8}|SC-\d{4})\.?\s*(.+)$/i);
      if (match) {
        code = match[1];
        name = match[2].trim();
      } else {
        code = parts[0].trim() || String(2000 + index + 1);
        name = parts[1] ? parts[1].trim() : parts[0].trim();
      }
      packagingType = detectPackagingType(name);
      if (parts.length >= 3) {
        const p = parseCurrency(parts[parts.length - 1]);
        if (p > 0) costPrice = p;
      }
    }

    // Se o código ainda contiver fragmentos de Departamento/Classe, limpa
    if (code.includes('Materiais') || code.includes('PAMPULHA')) {
      const codeMatch = code.match(/^(\d+(?:[/-]\d+)*|SC-\d+)/i);
      if (codeMatch) {
        code = codeMatch[1].trim();
      }
    }

    // Garante que a Classe (categoria) seja sempre válida e não substituída pela marca
    if (!category || category === 'PIAL' || category === 'PERLEX' || category === '3M' || category === 'DIVERSOS') {
      if (category && category !== 'Pampulha') {
        brand = category;
      }
      category = defaultCategory;
    }

    // Se o nome ficou vazio, tenta extrair
    if (!name || name.length < 2) return;

    // Normaliza valores monetários caso custo exista mas preço não
    if (costPrice > 0 && price <= 0) {
      price = Math.round(costPrice * 1.45 * 100) / 100;
    } else if (price > 0 && costPrice <= 0) {
      costPrice = Math.round(price * 0.65 * 100) / 100;
    } else if (price <= 0 && costPrice <= 0) {
      price = 19.90;
      costPrice = 12.50;
    }

    results.push({
      code: code || String(2000 + index + 1),
      name,
      department,
      category: category || defaultCategory,
      brand,
      packagingType,
      packagingDetail,
      price,
      costPrice,
      stock: stock >= 0 ? stock : 0,
      imageUrl: '/ponto_chave_logo.jpg',
      description: `${name}. Fabricante/Tipo: ${brand}. Embalagem de fábrica: ${packagingDetail}. Fornecido via Tabela Oficial Pampulha Condutores.`,
      nature: 'Não-inflamável',
      voltage: name.toLowerCase().includes('220v') ? '220V' : name.toLowerCase().includes('127v') ? '127V' : 'Bivolt (110V/220V)',
      material: name.toLowerCase().includes('pvc') ? 'PVC' : name.toLowerCase().includes('cobre') ? 'Cobre' : 'Termoplástico / Metal',
      showInStore: false,
      rawText: line
    });
  });

  return results;
}

/**
 * Lê o conteúdo de um arquivo PDF, CSV ou TXT com detecção automática de codificação e layout de tabelas
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // Para arquivos PDF: Extração vetorial de textos e tabelas com pdfjs-dist
  if (extension === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        standardFontDataUrl: '/standard_fonts/',
        useSystemFonts: true,
        disableFontFace: true,
        isEvalSupported: false
      } as any);
      const pdfDoc = await loadingTask.promise;
      const allLines: string[] = [];

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Agrupa os itens de texto pelo eixo vertical Y para reconstruir as linhas da tabela
        const itemsByY: { [y: number]: { str: string; x: number; width: number }[] } = {};
        
        for (const item of textContent.items as any[]) {
          if (!item.str || !item.str.trim()) continue;
          const y = Math.round(item.transform[5]);
          const x = item.transform[4];
          const width = item.width || (item.str.length * 6);
          
          let targetY = y;
          for (const existingY of Object.keys(itemsByY).map(Number)) {
            if (Math.abs(existingY - y) <= 4) {
              targetY = existingY;
              break;
            }
          }
          if (!itemsByY[targetY]) itemsByY[targetY] = [];
          itemsByY[targetY].push({ str: item.str.trim(), x, width });
        }

        // Ordena do topo para a base da página
        const sortedYs = Object.keys(itemsByY).map(Number).sort((a, b) => b - a);
        for (const y of sortedYs) {
          const rowItems = itemsByY[y].sort((a, b) => a.x - b.x);
          let rowText = '';
          let prevEnd = -1;

          for (let i = 0; i < rowItems.length; i++) {
            const it = rowItems[i];
            if (i === 0) {
              rowText += it.str;
              prevEnd = it.x + it.width;
            } else {
              const gap = it.x - prevEnd;
              if (gap > 12) {
                rowText += ';' + it.str;
              } else {
                rowText += ' ' + it.str;
              }
              prevEnd = Math.max(prevEnd, it.x + it.width);
            }
          }

          const normalizedRow = normalizeLineSeparators(rowText);
          if (normalizedRow.trim().length > 0) {
            allLines.push(normalizedRow);
          }
        }
      }

      const extracted = allLines.join('\n');
      if (extracted.trim().length > 0) {
        return extracted;
      }

      throw new Error('PDF sem texto selecionável');
    } catch (err: any) {
      console.warn('Erro ao processar PDF via pdfjs:', err);
      // Tenta fallback direto extraindo texto puro dos fluxos de texto do PDF
      try {
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('latin1');
        const rawContent = decoder.decode(arrayBuffer);
        const textMatches = rawContent.match(/\(([^)]+)\)\s*T[jJ]/g);
        if (textMatches && textMatches.length > 10) {
          const fallbackText = textMatches
            .map(m => m.replace(/^[^(]*\(/, '').replace(/\)[^)]*$/, ''))
            .filter(t => t.trim().length > 0)
            .join(' ');
          if (fallbackText.length > 50) {
            return fallbackText;
          }
        }
      } catch (fallbackErr) {
        console.warn('Fallback PDF também falhou:', fallbackErr);
      }

      throw new Error(
        `Não foi possível ler o arquivo PDF "${file.name}". Motivo: ${err?.message || 'Arquivo protegido ou sem camada de texto'}. Verifique se o arquivo não está corrompido.`
      );
    }
  }

  // Para arquivos de texto (CSV, TXT, TSV)
  if (extension === 'csv' || extension === 'txt' || extension === 'tsv') {
    // Tenta ler como UTF-8 primeiro
    const textUtf8 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = (err) => reject(err);
      reader.readAsText(file, 'UTF-8');
    });

    // Se detectou caractere de substituição unicode (\uFFFD), o arquivo veio de exportação Windows-1252/ANSI
    if (textUtf8.includes('\uFFFD')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = (err) => reject(err);
        reader.readAsText(file, 'windows-1252');
      });
    }

    return textUtf8;
  }

  throw new Error(`Extensão .${extension} não suportada. Selecione um arquivo .csv ou .txt.`);
}
