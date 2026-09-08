import { GoogleGenAI, Type } from "@google/genai";
import type { Product } from '../types';

function getAiClient() {
    const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("A chave da API do Google Gemini não está configurada.");
    }
    return new GoogleGenAI({ 
        apiKey: API_KEY,
        httpOptions: {
            headers: {
                'User-Agent': 'aistudio-build',
            }
        }
    });
}

export interface ProductEnrichmentResult {
    name: string;
    description: string;
    technicalSpecs: string;
    category: string;
    seoKeywords: string[];
    suggestedPrice: number;
    voltage?: string;
    material?: string;
    dimensionsSize?: string;
    height?: string;
    width?: string;
    length?: string;
    grossWeight?: number;
    netWeight?: number;
    packagingType?: string;
    searchImageKeywords?: string;
    imageUrl?: string;
}

export interface EnrichOptions {
    generateImage?: boolean;
}

/**
 * Gera uma imagem de estúdio comercial para o produto via IA (Gemini Image) com fallback resiliente.
 */
export async function generateProductImageWithAI(
    productName: string,
    category?: string,
    keywords?: string
): Promise<string> {
    const ai = getAiClient();
    const prompt = `Studio commercial e-commerce product photography of "${productName}". Category: ${category || 'Utilidades'}. Details: ${keywords || 'produto de qualidade'}. Centered composition, isolated on clean seamless pure white studio background, professional studio lighting, crisp sharp focus, 4k catalog style, photorealistic.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                }
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const mime = part.inlineData.mimeType || 'image/png';
                    return `data:${mime};base64,${part.inlineData.data}`;
                }
            }
        }
    } catch (err) {
        console.warn("Aviso na geração direta de imagem via Gemini Image (tentando fallback contextual):", err);
    }

    // Fallback inteligente com imagens de estúdio profissionais de alta definição em fundo branco/neutro por categoria
    const lower = (productName + ' ' + (category || '') + ' ' + (keywords || '')).toLowerCase();
    
    if (lower.includes('tinta') || lower.includes('verniz') || lower.includes('acabamento') || lower.includes('rolo') || lower.includes('trincha')) {
        return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('alicate') || lower.includes('ferramenta') || lower.includes('chave') || lower.includes('martelo') || lower.includes('furadeira')) {
        return 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('cabo') || lower.includes('fio') || lower.includes('elétric') || lower.includes('disjuntor') || lower.includes('tomada')) {
        return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('lâmpada') || lower.includes('led') || lower.includes('luminária') || lower.includes('ilumina')) {
        return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('cftv') || lower.includes('câmera') || lower.includes('roteador') || lower.includes('rede') || lower.includes('telef')) {
        return 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('torneira') || lower.includes('chuveiro') || lower.includes('ducha') || lower.includes('tubo') || lower.includes('hidráulic')) {
        return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';
    } else {
        return 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80';
    }
}

export async function enrichProductDataWithAI(
    product: Partial<Product>,
    options?: EnrichOptions
): Promise<ProductEnrichmentResult> {
    const ai = getAiClient();

    const prompt = `
Você é um especialista sênior em engenharia de produto, normas técnicas e e-commerce da loja "Ponto Chave do Lar".
Sua tarefa é ENRIQUECER e GERAR a ficha técnica completa, comercial, com DIMENSÕES FÍSICAS REAIS e otimizada para SEO de um produto da loja.

Informações brutas/disponíveis do produto:
- Nome/Título atual: "${product.name || 'Sem nome'}"
- Categoria atual: "${product.category || 'Geral'}"
- Código/Ref: "${product.code || 'N/A'}"
- Preço Atual: R$ ${product.price || 0}
- Preço de Custo: R$ ${product.costPrice || 0}
- Voltagem/Tensão informada: "${product.voltage || 'Não informada'}"
- Material informado: "${product.material || 'Não informado'}"
- Dimensões/Tamanho informado: "${product.dimensionsSize || 'Não informado'}"
- Capacidade/Embalagem: "${product.capacityLiters || ''} ${product.packagingType || ''}"
- Fornecedor: "${product.supplierName || 'Não informado'}"

INSTRUÇÕES OBRIGATÓRIAS:
1. **name**: Um título comercial limpo, elegante e padronizado para a vitrine (com maiúsculas e minúsculas corretas, sem abreviações confusas de nota fiscal).
2. **description**: Uma descrição persuasiva, amigável e atraente de 2 a 3 frases com apelo comercial e foco nos benefícios para o cliente final. OBRIGATÓRIO: inclua no final da descrição as dimensões e peso aproximados (ex: "Dimensões aproximadas: 25cm x 15cm x 8cm. Peso: 450g.").
3. **technicalSpecs**: Ficha técnica detalhada em tópicos estruturados, incluindo:
   - Especificações Principais & Material
   - Dimensões & Medidas (Altura x Largura x Profundidade e Peso)
   - Aplicação & Instalação
   - Cuidados & Garantia
4. **category**: A categoria mais adequada entre: "Ferramentas & Máquinas", "Banheiro", "Metais & Hidráulica", "Iluminação", "Móveis", "Decoração", "Cozinha", "Livros / E-books", "Geral".
5. **seoKeywords**: Lista de 4 a 8 termos de busca/tags de alta conversão para o Google e busca interna.
6. **suggestedPrice**: Um preço de venda realista em Reais (BRL), considerando a categoria ou margem caso o custo seja informado.
7. **voltage**: Se aplicável ao produto, indicar ("110V", "220V", "Bivolt (110V/220V)", "Bivolt Automático", "12V", "24V" ou "Não se aplica").
8. **material**: Material predominante refinado (ex: "Metal / Inox", "Plástico", "PVC", "Vidro", "Madeira", "Cerâmica", "Alumínio", "Cobre").
9. **DIMENSÕES & MEDIDAS FÍSICAS OBRIGATÓRIAS**:
   - **dimensionsSize**: Dimensão completa formatada (ex: '25cm x 15cm x 8cm' ou '3/4 pol, 32mm' ou '100m, 2.5mm²').
   - **height**: Altura aproximada com unidade (ex: '25 cm').
   - **width**: Largura aproximada com unidade (ex: '15 cm').
   - **length**: Comprimento ou profundidade aproximada com unidade (ex: '8 cm' ou '100 m').
   - **grossWeight**: Peso bruto numérico estimado em kg (ex: 0.450 para 450g, 1.200 para 1.2kg).
   - **netWeight**: Peso líquido numérico estimado em kg.
10. **packagingType**: Tipo de embalagem ("Unidade", "Lata", "Galão", "Balde", "Tambor", "Caixa", "Kit", "Rolo", "Outro").
11. **searchImageKeywords**: Termo descritivo para foto de estúdio com fundo branco (ex: "cordless drill power tool white background").
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: {
                            type: Type.STRING,
                            description: "Nome comercial limpo e padronizado."
                        },
                        description: {
                            type: Type.STRING,
                            description: "Descrição comercial atraente com dimensões incluídas."
                        },
                        technicalSpecs: {
                            type: Type.STRING,
                            description: "Ficha técnica detalhada com tópicos, especificações, dimensões e orientações."
                        },
                        category: {
                            type: Type.STRING,
                            description: "Categoria adequada do marketplace."
                        },
                        seoKeywords: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Palavras-chave e tags de SEO."
                        },
                        suggestedPrice: {
                            type: Type.NUMBER,
                            description: "Preço de venda sugerido em Reais."
                        },
                        voltage: {
                            type: Type.STRING,
                            description: "Voltagem/tensão ou 'Não se aplica'."
                        },
                        material: {
                            type: Type.STRING,
                            description: "Material predominante."
                        },
                        dimensionsSize: {
                            type: Type.STRING,
                            description: "Dimensão completa (ex: 25cm x 15cm x 8cm ou 3/4 pol, 32mm)."
                        },
                        height: {
                            type: Type.STRING,
                            description: "Altura com unidade (ex: 25 cm)."
                        },
                        width: {
                            type: Type.STRING,
                            description: "Largura com unidade (ex: 15 cm)."
                        },
                        length: {
                            type: Type.STRING,
                            description: "Comprimento ou profundidade (ex: 8 cm)."
                        },
                        grossWeight: {
                            type: Type.NUMBER,
                            description: "Peso bruto estimado em kg numérico (ex: 0.450)."
                        },
                        netWeight: {
                            type: Type.NUMBER,
                            description: "Peso líquido estimado em kg numérico (ex: 0.400)."
                        },
                        packagingType: {
                            type: Type.STRING,
                            description: "Tipo de embalagem."
                        },
                        searchImageKeywords: {
                            type: Type.STRING,
                            description: "Termo de busca para fotos de catálogo em estúdio."
                        }
                    },
                    required: [
                        "name",
                        "description",
                        "technicalSpecs",
                        "category",
                        "seoKeywords",
                        "suggestedPrice",
                        "dimensionsSize"
                    ]
                }
            }
        });

        const jsonText = response.text ? response.text.trim() : '{}';
        const parsed = JSON.parse(jsonText);

        const resultName = parsed.name || product.name || '';
        const resultCategory = parsed.category || product.category || 'Geral';
        const searchKeywords = parsed.searchImageKeywords || resultName;

        let generatedImage = product.imageUrl || '';
        // Se a opção de gerar imagem estiver habilitada (ou se o produto não possui imagem ainda)
        if (options?.generateImage !== false) {
            try {
                generatedImage = await generateProductImageWithAI(resultName, resultCategory, searchKeywords);
            } catch (imgErr) {
                console.warn("Falha ao gerar imagem do produto via IA:", imgErr);
            }
        }

        return {
            name: resultName,
            description: parsed.description || '',
            technicalSpecs: parsed.technicalSpecs || '',
            category: resultCategory,
            seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [],
            suggestedPrice: typeof parsed.suggestedPrice === 'number' && parsed.suggestedPrice > 0 ? parsed.suggestedPrice : Number(product.price || 0),
            voltage: parsed.voltage || product.voltage || 'Não se aplica',
            material: parsed.material || product.material || 'Outro',
            dimensionsSize: parsed.dimensionsSize || product.dimensionsSize || '',
            height: parsed.height || (product.height ? String(product.height) : ''),
            width: parsed.width || (product.width ? String(product.width) : ''),
            length: parsed.length || (product.length ? String(product.length) : ''),
            grossWeight: typeof parsed.grossWeight === 'number' ? parsed.grossWeight : product.grossWeight,
            netWeight: typeof parsed.netWeight === 'number' ? parsed.netWeight : product.netWeight,
            packagingType: parsed.packagingType || product.packagingType || 'Unidade',
            searchImageKeywords: searchKeywords,
            imageUrl: generatedImage || product.imageUrl || ''
        };
    } catch (error) {
        console.error("Erro ao enriquecer produto com IA:", error);
        throw new Error("Não foi possível enriquecer os dados do produto via IA. Tente novamente.");
    }
}
