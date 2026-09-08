import { InstitutionalFooterConfig } from '../types';

export const DEFAULT_INSTITUTIONAL_FOOTER_CONFIG: InstitutionalFooterConfig = {
    company: {
        tradeName: 'Ponto Chave do Lar',
        legalName: 'Ponto Chave do Lar Comércio e Soluções em Design LTDA',
        cnpj: '00.000.000/0001-00', // Campo reservado para o CNPJ definitivo
        stateRegistration: 'ISENTO',
        addressStreet: 'Av. Afonso Pena',
        addressNumber: '1500',
        addressComplement: 'Loja 02 / Salão Comercial',
        addressNeighborhood: 'Centro',
        addressCity: 'Belo Horizonte',
        addressState: 'MG',
        addressZip: '30130-005',
    },
    contact: {
        whatsapp: '(31) 99999-9999', // Campo reservado para o WhatsApp definitivo
        whatsappRaw: '5531999999999',
        whatsappDefaultMessage: 'Olá! Gostaria de informações sobre produtos e atendimento da Ponto Chave do Lar.',
        phone: '(31) 3200-0000',
        email: 'portalmultiluz@gmail.com',
        businessHours: 'Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h',
    },
    social: {
        instagramUrl: 'https://instagram.com/pontochavedolar',
        facebookUrl: 'https://facebook.com/pontochavedolar',
        youtubeUrl: '',
    },
    securityBadges: {
        sslEnabled: true,
        sslLabel: 'Conexão Segura SSL 256-Bit (TLS 1.3)',
        googleSafeEnabled: true,
        lgpdEnabled: true,
        verifiedStoreEnabled: true,
    },
    paymentMethods: {
        pixEnabled: true,
        pixBadgeText: 'Chave Pix com Aprovação Imediata',
        creditCardsEnabled: true,
        creditCardBrands: ['visa', 'mastercard', 'elo', 'hipercard', 'amex'],
        installmentsNote: 'Parcele em até 12x sem juros nos cartões',
        boletoEnabled: true,
        mercadoPagoEnabled: true,
    },
    policies: {
        returnsPolicyTitle: 'Política de Trocas, Devoluções e Garantia (CDC Art. 49)',
        returnsPolicyContent: `## Política de Trocas e Devoluções - Ponto Chave do Lar

Em estrito respeito e cumprimento ao **Código de Defesa do Consumidor (Lei Federal nº 8.078/1990)** e ao **Decreto do E-commerce (Decreto nº 7.962/2013)**, estabelecemos as seguintes diretrizes para garantir uma experiência transparente, segura e confiável:

---

### 1. Direito de Arrependimento (Compras Online / Não Presenciais)
* Conforme o **Artigo 49 do CDC**, o consumidor tem até **7 (sete) dias corridos**, contados a partir da data de recebimento do pedido, para manifestar o arrependimento da compra.
* O produto deve ser devolvido em sua embalagem original, sem sinais de uso indevido ou instalação incorreta, acompanhado de todos os acessórios, manuais e nota fiscal/comprovante de compra.
* A logística reversa neste prazo legal é **gratuita para o cliente**. Ao solicitar a devolução pelo nosso WhatsApp ou e-mail de atendimento, você receberá a autorização de postagem ou instruções para recolhimento.
* Após o recebimento e conferência em nosso centro de distribuição, o estorno integral do valor pago (incluindo o frete original) será realizado via Pix ou estorno na fatura do cartão em até 3 (três) dias úteis.

---

### 2. Avarias de Transporte ou Divergência no Recebimento
* Ao receber a encomenda, verifique se a embalagem externa está violada ou amassada. 
* Em caso de desacordo ou item quebrado durante o transporte, recuse o recebimento ou nos comunique imediatamente em até **48 horas** pelo WhatsApp oficial com fotos ou vídeo da embalagem e do produto.
* Providenciaremos o envio imediato de uma nova unidade sem nenhum custo adicional.

---

### 3. Garantia Legal e Defeito de Fabricação
* Conforme o **Artigo 26 do CDC**, todos os produtos comercializados possuem garantia legal de **90 (noventa) dias** para bens duráveis contra defeitos ocultos ou vícios de fabricação.
* Além da garantia legal, respeitamos integralmente as garantias contratuais estendidas dos fabricantes parceiros (como **Tramontina, Foxlux, Famastil, Pampulha Condutores**, entre outros), que podem variar de 6 meses a 12 meses.
* Danos causados por ligação em voltagem incorreta, sobrecarga elétrica, quedas ou instalação em desacordo com as normas da ABNT não são cobertos pela garantia do fabricante.

---

### 4. Como Solicitar sua Troca ou Devolução
1. Entre em contato com nosso atendimento pelo **WhatsApp** ou e-mail **portalmultiluz@gmail.com**.
2. Informe o **número do seu pedido** ou CPF do titular da compra e descreva o motivo.
3. Anexe fotos ou vídeos detalhando o produto.
4. Nossa equipe responderá em até 1 dia útil fornecendo o código de postagem reversa.

---

### 5. Trocas e Devoluções Presenciais no Ponto de Apoio Logístico
* **Horário:** Segunda a sexta-feira, das 9h às 17h (exclusivamente mediante agendamento prévio).
* **Agendamento Obrigatório:** Agende previamente pelo WhatsApp oficial informando o número do pedido.
* **Local:** Ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.`,

        privacyPolicyTitle: 'Política de Privacidade e Proteção de Dados (LGPD)',
        privacyPolicyContent: `## Política de Privacidade e Proteção de Dados (LGPD)

A **Ponto Chave do Lar** preza pela transparência e pela segurança absoluta das suas informações pessoais. Esta política atende integralmente à **Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)**.

---

### 1. Quais dados coletamos
* **Identificação básica:** Nome completo, CPF, e-mail e telefone de contato para emissão de nota fiscal e comunicação sobre pedidos.
* **Endereço de entrega:** Logradouro, número, bairro, cidade, CEP e ponto de referência para despacho das mercadorias.
* **Dados de pagamento:** Nós **não armazenamos** dados completos de cartões de crédito. Todas as transações financeiras são processadas diretamente em ambiente seguro criptografado com certificação PCI-DSS pelos intermediadores homologados (Mercado Pago / Gateways Bancários).

---

### 2. Finalidade do Tratamento
* Faturamento, emissão de documentos fiscais obrigatórios e transporte das mercadorias adquiridas.
* Notificação sobre status do pedido, código de rastreamento e pós-venda.
* Suporte técnico e resolução de chamados de garantia ou consultoria.

---

### 3. Seus Direitos como Titular dos Dados
Você pode, a qualquer momento:
* Confirmar a existência de tratamento de dados;
* Solicitar acesso, retificação ou exclusão de dados desnecessários;
* Revogar o consentimento para envio de comunicações promocionais.

Para exercer seus direitos, basta entrar em contato com nosso Encarregado de Dados (DPO) através do e-mail **portalmultiluz@gmail.com**.`,

        termsOfUseTitle: 'Termos e Condições Gerais de Compra e Uso do Site',
        termsOfUseContent: `## Termos e Condições Gerais de Uso

Ao navegar e efetuar compras no site da **Ponto Chave do Lar**, você concorda com as disposições abaixo:

1. **Preços e Estoque:** Os preços e promoções divulgados são válidos para compras realizadas no e-commerce ou enquanto durarem nossos estoques físicos. Reservamo-nos o direito de corrigir eventuais erros de digitação manifestos.
2. **Entrega:** Os prazos informados no cálculo de frete são estimativas fornecidas pelos Correios e transportadoras parceiras, iniciando-se após a confirmação do pagamento e despacho do pedido.
3. **Propriedade Intelectual:** Todos os elementos visuais, logotipos, textos, manuais e consultorias técnicas são de propriedade exclusiva da Ponto Chave do Lar ou de seus licenciantes.
4. **Legislação Aplicável:** Fica eleito o foro da comarca da sede da empresa para dirimir quaisquer controvérsias decorrentes deste contrato, resguardados os direitos de foro do domicílio do consumidor quando previstos em lei.`,

        aboutUsTitle: 'Sobre a Ponto Chave do Lar - Soluções em Design e Materiais',
        aboutUsContent: `## Quem Somos

A **Ponto Chave do Lar** nasceu com a missão de unir a tradição do comércio de materiais técnicos de alta performance com a inovação em design de interiores e soluções práticas para o lar.

Oferecemos uma linha completa e rigorosamente selecionada de:
* **Condutores e Materiais Elétricos** de alta segurança e conformidade Inmetro;
* **Conexões e Soluções Hidráulicas** duráveis e eficientes;
* **Ferramentas Manuais e Elétricas** profissionais e para o dia a dia;
* **Iluminação LED e Acabamentos** que transformam qualquer ambiente;
* **Ferragens, Fixações e Utilidades** essenciais para manutenção e construção civil.

Trabalhamos em parceria direta com as maiores indústrias nacionais (Pampulha Condutores, Tramontina, Famastil, Foxlux), garantindo procedência 100% comprovada, nota fiscal em todas as vendas e consultoria especializada com inteligência técnica para que você sempre escolha o produto ideal para o seu projeto.

---

### Atendimento e Ponto de Apoio Logístico
* **Atendimento Online:** Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h (via WhatsApp, e-mail ou chat do site).
* **Endereço:** Av. Afonso Pena, 1500, Loja 02 / Salão Comercial, Centro - Belo Horizonte / MG — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.
* **Trocas e Devoluções Presenciais:** Mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp (31) 99999-9999.`,
    },
    testimonials: [
        {
            id: 't-1',
            authorName: 'Carlos Eduardo Silveira',
            cityState: 'Belo Horizonte / MG',
            rating: 5,
            comment: 'Atendimento nota 10 pelo WhatsApp! Os cabos da Pampulha chegaram super bem embalados e no mesmo dia da compra. Recomendo muito a loja.',
            productPurchased: 'Cabo Flexível 2.5mm² 750V 100m',
            verifiedPurchase: true,
            date: 'Há 3 dias',
            active: true,
        },
        {
            id: 't-2',
            authorName: 'Mariana Drummond',
            cityState: 'Contagem / MG',
            rating: 5,
            comment: 'Comprei o kit de ferramentas Tramontina e algumas utilidades para casa. Preço justo, nota fiscal certinha e rapidez na entrega.',
            productPurchased: 'Kit Ferramentas e Utilidades do Lar',
            verifiedPurchase: true,
            date: 'Há 1 semana',
            active: true,
        },
        {
            id: 't-3',
            authorName: 'Eng. Roberto Vasconcelos',
            cityState: 'Nova Lima / MG',
            rating: 5,
            comment: 'Como engenheiro, prezo muito por certificação e ficha técnica correta. A consultoria técnica da loja me deu suporte rápido para o quadro de distribuição.',
            productPurchased: 'Disjuntores DIN e Barramentos',
            verifiedPurchase: true,
            date: 'Há 2 semanas',
            active: true,
        }
    ],
    careers: {
        enabled: true,
        title: 'Trabalhe Conosco',
        descriptionText: `A nossa empresa, Ponto Chave do Lar, entende a importância de manter no ambiente de trabalho um espaço agradável, onde o profissional, além de desempenhar suas funções, possa aprender e progredir continuamente.\n\nSe você quer fazer parte da nossa equipe envie o seu currículo.\n\nEntraremos em contato quando surgirem vagas compatíveis com o seu perfil.`,
        email: 'Pontochavedolar001@gmail.com.br',
        showInFooter: true,
    },
    displayOptions: {
        showTrustPillars: true,
        showTestimonials: true,
        showSocialLinks: true,
        showLegalText: true,
    }
};

export const DEFAULT_CAREERS_TEXT = `A nossa empresa, Ponto Chave do Lar, entende a importância de manter no ambiente de trabalho um espaço agradável, onde o profissional, além de desempenhar suas funções, possa aprender e progredir continuamente.

Se você quer fazer parte da nossa equipe envie o seu currículo.

Entraremos em contato quando surgirem vagas compatíveis com o seu perfil.`;

export const DEFAULT_CAREERS_EMAIL = 'Pontochavedolar001@gmail.com.br';

/**
 * Monta o texto de endereço formatado completo
 */
export function formatFullAddress(company: InstitutionalFooterConfig['company']): string {
    const parts: string[] = [];
    if (company.addressStreet) {
        let streetPart = company.addressStreet;
        if (company.addressNumber) streetPart += `, nº ${company.addressNumber}`;
        if (company.addressComplement) streetPart += ` - ${company.addressComplement}`;
        parts.push(streetPart);
    }
    if (company.addressNeighborhood) parts.push(`Bairro ${company.addressNeighborhood}`);
    if (company.addressCity && company.addressState) parts.push(`${company.addressCity}/${company.addressState}`);
    if (company.addressZip) parts.push(`CEP: ${company.addressZip}`);
    return parts.join(' • ');
}

/**
 * Limpa o número de WhatsApp para link direto wa.me
 */
export function getWhatsAppCleanNumber(raw: string): string {
    return (raw || '').replace(/\D/g, '');
}

/**
 * Gera URL de WhatsApp com mensagem codificada
 */
export function buildWhatsAppChatUrl(phoneRaw: string, message?: string): string {
    const clean = getWhatsAppCleanNumber(phoneRaw);
    if (!clean) return '#';
    const baseUrl = `https://wa.me/${clean}`;
    if (!message) return baseUrl;
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
