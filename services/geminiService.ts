import { GoogleGenAI, Type } from "@google/genai";
import type { Product, TechnicalConsultancyProject } from '../types';

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

export interface GenerateProductDescriptionResult {
    description: string;
    suggestedPrice: number;
    dimensionsSize?: string;
    height?: string;
    width?: string;
    length?: string;
    grossWeight?: number;
    imageUrl?: string;
}

export async function generateProductDescription(
    productName: string, 
    keywords: string,
    generateImage: boolean = true
): Promise<GenerateProductDescriptionResult> {
    const prompt = `
      Você é um especialista em marketing e engenharia de produto para e-commerce de utilidades domésticas, ferramentas, hidráulica, elétrica e iluminação da loja "Ponto Chave do Lar".
      Crie uma descrição de produto altamente atraente, com DIMENSÕES FÍSICAS REAIS e precisas e um preço sugerido para o seguinte item.
      
      Nome do Produto: ${productName}
      Características/Palavras-chave: ${keywords}
      
      Diretrizes:
      1. A descrição deve ser amigável, concisa (2-3 frases), destacar os principais benefícios e OBRIGATORIAMENTE conter as dimensões e peso aproximados ao final.
      2. O preço deve ser um número realista em Reais (BRL), sem o símbolo 'R$'.
      3. DIMENSÕES OBRIGATÓRIAS:
         - dimensionsSize: Formato descritivo Altura x Largura x Profundidade (ex: '25cm x 15cm x 8cm' ou '3/4 pol, 32mm')
         - height: Altura com unidade (ex: '25 cm')
         - width: Largura com unidade (ex: '15 cm')
         - length: Profundidade/Comprimento com unidade (ex: '8 cm')
         - grossWeight: Peso bruto estimado em kg numérico (ex: 0.450 para 450g)
    `;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: {
                            type: Type.STRING,
                            description: "A descrição de venda do produto incluindo as dimensões."
                        },
                        suggestedPrice: {
                            type: Type.NUMBER,
                            description: "O preço de venda sugerido para o produto em BRL."
                        },
                        dimensionsSize: {
                            type: Type.STRING,
                            description: "Dimensões completas do produto."
                        },
                        height: {
                            type: Type.STRING,
                            description: "Altura aproximada."
                        },
                        width: {
                            type: Type.STRING,
                            description: "Largura aproximada."
                        },
                        length: {
                            type: Type.STRING,
                            description: "Comprimento ou profundidade aproximada."
                        },
                        grossWeight: {
                            type: Type.NUMBER,
                            description: "Peso bruto aproximado em kg."
                        }
                    },
                    required: ["description", "suggestedPrice", "dimensionsSize"]
                }
            }
        });

        const jsonText = response.text ? response.text.trim() : '{}';
        const parsedJson = JSON.parse(jsonText);

        let generatedImageUrl = '';
        if (generateImage) {
            try {
                // Tenta gerar imagem de estúdio via IA
                const imgPrompt = `Studio commercial e-commerce product photography of "${productName}". Isolated on pure white seamless background, professional studio lighting, 4k sharp focus, catalog style.`;
                const imgResponse = await ai.models.generateContent({
                    model: 'gemini-3.1-flash-lite-image',
                    contents: { parts: [{ text: imgPrompt }] },
                    config: { imageConfig: { aspectRatio: "1:1" } }
                });

                if (imgResponse.candidates?.[0]?.content?.parts) {
                    for (const part of imgResponse.candidates[0].content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            const mime = part.inlineData.mimeType || 'image/png';
                            generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
                            break;
                        }
                    }
                }
            } catch (imgErr) {
                console.warn("Fallback de imagem para o anúncio:", imgErr);
            }

            if (!generatedImageUrl) {
                generatedImageUrl = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80';
            }
        }

        if (typeof parsedJson.description === 'string' && typeof parsedJson.suggestedPrice === 'number') {
            return {
                description: parsedJson.description,
                suggestedPrice: parsedJson.suggestedPrice,
                dimensionsSize: parsedJson.dimensionsSize || '',
                height: parsedJson.height || '',
                width: parsedJson.width || '',
                length: parsedJson.length || '',
                grossWeight: typeof parsedJson.grossWeight === 'number' ? parsedJson.grossWeight : undefined,
                imageUrl: generatedImageUrl
            };
        } else {
            throw new Error("Resposta da IA em formato inválido.");
        }
    } catch (error) {
        console.error("Erro ao gerar descrição com a IA:", error);
        throw new Error("Não foi possível gerar a descrição do produto. Tente novamente.");
    }
}

export async function getChatbotResponse(question: string, products: Product[]): Promise<string> {
    const productCatalog = products.map(p => `- ${p.name}: R$ ${(p.price || 0).toFixed(2)}. ${p.description || ''}`).join('\n');

    const prompt = `
        Você é um assistente virtual amigável da loja "Ponto Chave do Lar". Sua especialidade são os produtos de utilidades domésticas listados abaixo.
        Responda à pergunta do usuário de forma concisa e prestativa, baseando-se SOMENTE nas informações do catálogo.
        Se a pergunta não tiver relação com os produtos, diga educadamente que você só pode ajudar com informações sobre o nosso catálogo.
        Se você não souber a resposta, diga que não encontrou a informação.

        **Catálogo de Produtos:**
        ${productCatalog}

        **Pergunta do Usuário:**
        "${question}"
    `;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
        });

        return response.text ? response.text.trim() : "Não foi possível formular a resposta no momento.";
    } catch (error) {
        console.error("Erro ao obter resposta do chatbot:", error);
        return "Desculpe, estou com um problema técnico momentâneo. Por favor, tente mais tarde.";
    }
}

export interface TechnicalProjectAnalysisInput {
    customerName: string;
    projectTitle: string;
    projectCategory: string;
    projectDescription: string;
    propertyType: string;
    roomDimensions?: string;
    voltage?: string;
    orderValue?: number;
    pdfBase64?: string;
    pdfFileName?: string;
}

export async function analyzeTechnicalProject(
    input: TechnicalProjectAnalysisInput,
    availableProducts: Product[] = []
): Promise<NonNullable<TechnicalConsultancyProject['aiAnalysis']> & { status: TechnicalConsultancyProject['status'] }> {
    const catalogSummary = availableProducts.slice(0, 15).map(p => `- ${p.name} (R$ ${(p.price || 0).toFixed(2)}) [${p.category}]`).join('\n');

    const prompt = `
Você é o Engenheiro Especialista & Diretor Técnico de IA do "Ponto Chave do Lar" (Soluções em Design, Elétrica, Iluminação e Utilidades).
Sua missão é realizar a ANÁLISE TÉCNICA E NORMATIVA do projeto enviado pelo cliente com base nas normas brasileiras vigentes (ABNT NBR 5410 para instalações elétricas de baixa tensão, NBR ISO/CIE 8995-1 / NBR 5101 para iluminação, NR-10 para segurança elétrica, código de obras, regras de segurança do Corpo de Bombeiros e legislação civil/condominial).

DADOS DO PROJETO DO CLIENTE:
- Nome do Cliente: ${input.customerName}
- Título do Projeto: ${input.projectTitle}
- Categoria: ${input.projectCategory}
- Tipo de Imóvel: ${input.propertyType}
- Dimensões / Metragem: ${input.roomDimensions || 'Não especificado'}
- Voltagem / Tensão Elétrica: ${input.voltage || 'Bivolt'}
- Descrição Detalhada do Cliente: "${input.projectDescription}"
- Arquivo Anexo PDF do Projeto: ${input.pdfFileName ? `SIM (${input.pdfFileName}) - Leia atentamente o documento PDF anexo completo, extraindo todos os dados técnicos, especificações de projeto, diagramas, marcas, memorial descritivo e necessidades descritas nele.` : 'Nenhum anexo PDF.'}

CATÁLOGO DE PRODUTOS DISPONÍVEIS NA LOJA:
${catalogSummary || 'Fechaduras digitais, Luminárias LED, Spots Embutidos, Cabos homologados, Fita LED, Interruptores Smart, Utilidades.'}

DIRETRIZES FUNDAMENTAIS DE ANÁLISE:

1. CRITÉRIO DE LEGALIDADE, NORMAS E SEGURANÇA (MUITO IMPORTANTE):
- O projeto (tanto o texto quanto o documento PDF enviado) deve estar estritamente dentro da lei e das normas técnicas da ABNT/NBR e regulamentos de segurança.
- Se o projeto envolver:
  a) Práticas ilegais (ex: adulteração de medidores/gatos de energia, desvios sem autorização da concessionária, arrombamento/invasão sem autorização, quebra de lacres de segurança);
  b) Serviços fora da realidade legal ou em desacordo com as normas de segurança (ex: fiação clandestina sem aterramento em áreas molhadas, instalações que violam normas de incêndio, sobrecargas deliberadas com risco iminente de curto-circuito/fogo, fiações expostas de alta periculosidade sem conduíte ou disjuntor adequado, instalação não autorizada em fachada estrutural tombada sem alvará);
  -> VOCÊ DEVE DESCARTAR O SERVIÇO COM EXTREMA GENTILEZA, CORDIALIDADE E RESPEITO.
  -> Marque "isLegallyCompliant": false e status: "rejected_illegal".
  -> Preencha o campo "courteousRejectionNotice" com uma mensagem empática, afetuosa, polida e profissional, explicando gentilmente os impeditivos legais/normativos e orientando o caminho correto e legal para o cliente (sem julgar ou repreender, sempre com cortesia de alto padrão).

2. CASO O PROJETO SEJA LEGAL E TÉCNICAMENTE CONFORME:
- Marque "isLegallyCompliant": true e status: "approved" (ou "approved_with_warnings" se necessitar de cuidados especiais).
- Deixe "courteousRejectionNotice" vazio ("").
- Forneça:
  - "executiveSummary": Um resumo executivo claro e acolhedor do projeto e sua viabilidade, fazendo referência explícita aos pontos abordados no PDF anexo quando aplicável.
  - "legalAndNormativeAnalysis": Detalhamento das normas ABNT aplicadas (ex: ABNT NBR 5410 itens de dimensionamento e DR, NBR ISO/CIE 8995-1 para níveis de lux e conforto visual, NR-10 para desenergização prévia).
  - "technicalRecommendations": Array de 3 a 6 passos técnicos práticos (ex: bitola mínima de cabos recomendada, disjuntores termomagnéticos, temperatura de cor da luz em Kelvins, fixação mecânica, grau de proteção IP para umidade).
  - "safetyWarnings": Array de 2 a 4 alertas de segurança essenciais para proteger pessoas e patrimônio.
  - "requiredMaterials": Array de materiais e insumos indispensáveis.
  - "suggestedPclProducts": Array com 2 a 4 produtos recomendados que combinam com o projeto.
  - "approvalConfidence": número de 80 a 98.
`;

    try {
        const ai = getAiClient();

        let contentsPayload: any;
        if (input.pdfBase64) {
            contentsPayload = {
                parts: [
                    {
                        inlineData: {
                            mimeType: "application/pdf",
                            data: input.pdfBase64
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            };
        } else {
            contentsPayload = prompt;
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: contentsPayload,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isLegallyCompliant: {
                            type: Type.BOOLEAN,
                            description: "Verdadeiro se o projeto está em conformidade com as leis e normas ABNT; Falso se for ilegal, perigoso ou fora da realidade legal."
                        },
                        status: {
                            type: Type.STRING,
                            description: "Status do laudo: 'approved', 'approved_with_warnings' ou 'rejected_illegal'."
                        },
                        executiveSummary: {
                            type: Type.STRING,
                            description: "Resumo executivo do parecer técnico."
                        },
                        legalAndNormativeAnalysis: {
                            type: Type.STRING,
                            description: "Parecer detalhado citando as normas ABNT NBR e leis aplicáveis."
                        },
                        technicalRecommendations: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Recomendações técnicas detalhadas e dimensionamentos."
                        },
                        safetyWarnings: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Alertas de segurança e precauções obrigatórias."
                        },
                        requiredMaterials: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Lista de materiais indispensáveis."
                        },
                        courteousRejectionNotice: {
                            type: Type.STRING,
                            description: "Mensagem cortês e gentil descartando o projeto se estiver fora da lei/normas, orientando alternativas regulares."
                        },
                        approvalConfidence: {
                            type: Type.NUMBER,
                            description: "Índice de conformidade técnica percentual (0 a 100)."
                        },
                        suggestedPclProducts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Produtos recomendados do catálogo."
                        }
                    },
                    required: [
                        "isLegallyCompliant",
                        "status",
                        "executiveSummary",
                        "legalAndNormativeAnalysis",
                        "technicalRecommendations",
                        "safetyWarnings",
                        "requiredMaterials",
                        "approvalConfidence"
                    ]
                }
            }
        });

        const jsonText = response.text ? response.text.trim() : '{}';
        const parsed = JSON.parse(jsonText);

        const statusResolved: TechnicalConsultancyProject['status'] = 
            !parsed.isLegallyCompliant || parsed.status === 'rejected_illegal'
                ? 'rejected_illegal'
                : parsed.status === 'approved_with_warnings'
                    ? 'approved_with_warnings'
                    : 'approved';

        return {
            isLegallyCompliant: parsed.isLegallyCompliant ?? true,
            status: statusResolved,
            executiveSummary: parsed.executiveSummary || 'Análise técnica concluída pela IA do Ponto Chave do Lar.',
            legalAndNormativeAnalysis: parsed.legalAndNormativeAnalysis || 'Em conformidade com as diretrizes ABNT NBR 5410 e normas correlatas.',
            technicalRecommendations: Array.isArray(parsed.technicalRecommendations) ? parsed.technicalRecommendations : [],
            safetyWarnings: Array.isArray(parsed.safetyWarnings) ? parsed.safetyWarnings : [],
            requiredMaterials: Array.isArray(parsed.requiredMaterials) ? parsed.requiredMaterials : [],
            courteousRejectionNotice: parsed.courteousRejectionNotice || '',
            approvalConfidence: typeof parsed.approvalConfidence === 'number' ? parsed.approvalConfidence : 90,
            suggestedPclProducts: Array.isArray(parsed.suggestedPclProducts) ? parsed.suggestedPclProducts : []
        };
    } catch (error) {
        console.error("Erro na análise técnica da IA:", error);
        throw new Error("Não foi possível processar o laudo técnico com a IA neste instante. Tente novamente.");
    }
}
