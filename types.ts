export interface Product {
    id: string;
    code?: string;
    sku?: string;
    name: string;
    description: string;
    price: number;
    costPrice?: number;
    costPriceOriginal?: number; // Preço de custo base original da tabela importada
    costPriceMarginIndexPercent?: number; // Margem / índice percentual para ATUALIZAR E APLICAR alteração do preço de custo
    costPriceLastAdjustmentDate?: string; // Data da última aplicação / alteração do preço de custo
    // Logística / Entrega Fora do Padrão dos Correios
    isSpecialDelivery?: boolean; // Entrega fora do padrão dos correios e transportadoras (itens longos/volumosos)
    pickupOrLocal15kmOnly?: boolean; // FLAG: Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente
    supportPointId?: string; // ID do ponto de apoio específico vinculado (quando houver filiais/múltiplos pontos)
    supportPointIds?: string[]; // Lista de IDs de pontos de apoio autorizados
    supportPointName?: string; // Nome descritivo do ponto de apoio vinculado
    specialDeliveryCepCode?: string; // Codificação POR CEP para entrega especial fora do padrão
    specialDeliveryCepRange?: string; // Faixa de CEP atendida para frete especial
    specialDeliveryNotes?: string; // Observações para entrega especial
    table?: string; // Nome da tabela do fornecedor (ex: PAMPULHA CONDUTORES)
    // Tributos sobre Produtos
    icmsPercent?: number;
    ipiPercent?: number;
    pisPercent?: number;
    cofinsPercent?: number;
    otherTaxesPercent?: number;
    profitMarginPercent?: number;
    ncm?: string; // Nomenclatura Comum do Mercosul (ex: 8544.49.00)
    cest?: string; // Código Especificador da Substituição Tributária (ex: 10.052.00)
    cfop?: string; // Código Fiscal de Operações e Prestações (ex: 5.102 / 5.405)
    taxOrigin?: string; // Origem da Mercadoria (ex: 0 - Nacional)
    cst?: string; // Código de Situação Tributária
    csosn?: string; // Código de Situação da Operação no Simples Nacional
    imageUrl: string;
    videoUrl?: string;
    gallery?: string[];
    stock: number;
    minStock?: number;
    category?: string;
    department?: string; // Departamento comercial / catálogo
    productClass?: string; // Classe do produto (ex: Smart, Ferramentas)
    // Fornecedor
    supplierId?: string;
    supplierName?: string;
    isActive?: boolean;
    showInStore?: boolean; // Exibir na Vitrine da Loja Principal (E-commerce / Página Inicial)
    isImported?: boolean; // Identifica se veio de importação de nota / arquivo
    importBatchId?: string; // ID único do lote de importação
    importBatchName?: string; // Nome legível do lote (ex: Lote Sam's Club, Lote Tropical)
    importedAt?: string; // Data e hora da importação
    purchaseDate?: string;
    invoiceNumber?: string;
    expiryDate?: string;
    batchNumber?: string;
    technicalSpecs?: string;
    ean?: string;
    brand?: string;
    weightKg?: number;
    heightCm?: number;
    widthCm?: number;
    depthCm?: number;

    // 1) Promoção com Período (Data a a Data b)
    isPromo?: boolean;
    promoPrice?: number;
    promoDiscountPercent?: number;
    promoStartDate?: string;
    promoEndDate?: string;

    // 2) Produto Descontinuado com Período (Data a a Data b)
    isDiscontinued?: boolean;
    discontinuedStartDate?: string;
    discontinuedEndDate?: string;
    discontinuedReason?: string;

    // 3) Produto Fora de Comercialização com Período (Data a a Data b)
    isOffMarket?: boolean;
    offMarketStartDate?: string;
    offMarketEndDate?: string;
    offMarketReason?: string;

    // 4) Histórico de Reposições / Novas Compras de Nota Fiscal
    purchaseHistory?: PurchaseRecord[];

    // 5) Kits e Combos
    isKit?: boolean;
    kitItems?: {
        name: string;
        quantity: number;
        code?: string;
        unitPrice?: number;
    }[];

    // Dimensões e Medidas Físicas
    dimensionsSize?: string; // Ex: P, M, G, 1/2", 3/4" ou tamanho descritivo
    height?: number | string; // Altura (cm ou mm)
    width?: number | string;  // Largura (cm ou mm)
    length?: number | string; // Comprimento/Profundidade (cm ou mm)
    grossWeight?: number;    // Peso bruto (kg)
    netWeight?: number;      // Peso líquido (kg)

    // Capacidade / Embalagem
    capacityLiters?: number | string; // Capacidade em Litros
    packagingType?: 'Unidade' | 'Lata' | 'Galão' | 'Balde' | 'Tambor' | 'Caixa' | 'Kit' | 'Pacote' | 'Lote' | 'Metro' | 'Rolo' | 'Bobina' | 'Outro' | string; // Tipo de embalagem
    packagingDetail?: string; // Detalhes da embalagem (ex: 45 un., 100 mts, Cx. c/ 10)

    // Natureza e Segurança
    nature?: 'Não-inflamável' | 'Inflamável';

    // Material e outros atributos
    material?: 'Plástico' | 'PVC' | 'Madeira' | 'Metal / Inox' | 'Vidro' | 'Cerâmica' | 'Alumínio' | 'Cobre' | 'Outro' | string;

    // Voltagem / Tensão Elétrica
    voltage?: '110V' | '220V' | 'Bivolt (110V/220V)' | 'Bivolt Automático' | '6V' | '12V' | '24V' | '48V' | 'Não se aplica' | string;
    wattage?: string; // Potência (ex: 9W, 100W, 1800W)
    amperage?: string; // Corrente (ex: 10A, 16A)
}

export interface PurchaseRecord {
    id: string;
    invoiceNumber: string;
    invoiceKey?: string;
    purchaseDate: string;
    supplierId?: string;
    supplierName?: string;
    quantityAdded: number;
    costPrice: number;
    sellingPrice?: number;
    // Alíquotas e tributos da nova NF
    icmsPercent?: number;
    ipiPercent?: number;
    pisPercent?: number;
    cofinsPercent?: number;
    otherTaxesPercent?: number;
    profitMarginPercent?: number;
    notes?: string;
    batchNumber?: string;
    expiryDate?: string;
    voltage?: string;
    dimensionsSize?: string;
    createdAt: string;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    costPrice?: number;
    // Tributos sobre Serviços
    issPercent?: number;
    pisPercent?: number;
    cofinsPercent?: number;
    inssPercent?: number;
    otherTaxesPercent?: number;
    profitMarginPercent?: number;
    duration?: string;
    category: string;
    imageUrl?: string;
    videoUrl?: string;
    requirements?: string;

    // Atributos operacionais e técnicos do serviço
    scopeDimensions?: string; // Dimensões/Área de atuação (ex: até 50m², 100m, etc.)
    estimatedWeight?: string; // Peso/Carga estimada envolvida
    capacityLiters?: number | string; // Capacidade de tanques/reservatórios atendidos
    nature?: 'Não-inflamável' | 'Inflamável / Risco NR-20'; // Natureza do ambiente de serviço
    material?: 'Plástico / PVC' | 'Madeira' | 'Metal' | 'Alvenaria' | 'Eletrocalhas' | 'Outro' | string;
    voltage?: '110V' | '220V' | 'Bivolt' | 'Trifásico (220V/380V)' | '12V / 24V' | 'Não se aplica' | string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    address: string;
    createdAt: string; // Data do Cadastro
    status?: 'active' | 'inactive'; // Situação: Ativado / Desativado
    lastPurchaseDate?: string; // Última Compra
    lastPurchaseAmount?: number; // Valor da Última Compra
    totalOrdersCount?: number; // Total de Pedidos
    allowMarketingCampaigns?: boolean; // Autoriza envio de nossas publicações dos nossos produtos e serviços (Remarketing / LGPD)
    marketingChannels?: {
        whatsapp?: boolean;
        email?: boolean;
        sms?: boolean;
    };
    notes?: string; // Observações / Interesses de Remarketing
}

export interface Supplier {
    id: string;
    companyName: string;
    tradeName?: string;
    document: string;
    email: string;
    phone: string;
    contactPerson: string;
    createdAt?: string; // Data do Cadastro
    status?: 'active' | 'inactive'; // Situação: Ativado / Desativado
    lastSupplyDate?: string; // Último Fornecimento / Pedido de Compra
    lastSupplyAmount?: number; // Valor do Último Fornecimento
    allowMarketingCampaigns?: boolean; // Autoriza envio de nossas publicações / comunicados comerciais
    marketingChannels?: {
        whatsapp?: boolean;
        email?: boolean;
    };
    categorySupply?: string; // Linha de fornecimento principal
    notes?: string; // Notas de negociação / catálogo
}

export interface FinancialTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    dueDate: string;
    status: 'pending' | 'paid';
    entityId?: string;
}

export interface Sale {
    id: string;
    customerId?: string;
    customerName?: string;
    items: CartItem[];
    total: number;
    paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash';
    status: 'pending' | 'completed' | 'cancelled';
    type: 'online' | 'pos';
    createdAt: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface DailyOffer {
    isActive: boolean;
    title: string;
    description: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
}

export interface PromoContent {
    id: number;
    type: 'image' | 'video';
    title: string;
    description: string;
    mediaUrl: string;
    link: string;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'boleto';
export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'hipercard' | 'amex' | 'diners' | 'cabal' | 'other';

export interface PaymentDetails {
    method: PaymentMethod;
    brand?: CardBrand;
    installments?: number;
    installmentValue?: number;
    pixCode?: string;
    pixQrCodeUrl?: string;
    pixExpiresAt?: string;
    pixDiscountAmount?: number;
    boletoBarcode?: string;
    boletoDigitableLine?: string;
    boletoDueDate?: string;
    cardLast4?: string;
    cardHolderName?: string;
    cardCpf?: string;
}

export interface CheckoutForm {
    fullName: string;
    email: string;
    phone?: string;
    document?: string; // CPF ou CNPJ
    cep: string;
    address: string;
    number: string;
    complement: string;
    neighborhood?: string;
    city: string;
    state: string;
    paymentMethod: PaymentMethod;
    cardBrand?: CardBrand;
    cardNumber?: string;
    cardHolderName?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardCpf?: string;
    installments?: number;
}

export interface CheckoutFormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    document?: string;
    cep?: string;
    address?: string;
    number?: string;
    city?: string;
    state?: string;
    cardNumber?: string;
    cardHolderName?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardCpf?: string;
}

export interface ConfirmedOrder {
    id: string;
    customerInfo: CheckoutForm;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    discount?: number;
    total: number;
    paymentDetails?: PaymentDetails;
    status: 'paid' | 'pending_payment' | 'processing' | 'shipped' | 'delivered';
    createdAt: string;
}

export interface TechnicalConsultancyProject {
    id?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    orderId?: string;
    orderValue: number;
    projectTitle: string;
    projectCategory: 'iluminacao' | 'eletrica' | 'seguranca_fechaduras' | 'automacao' | 'decoracao_reforma' | 'outros';
    projectDescription: string;
    propertyType: 'residencial' | 'comercial' | 'industrial' | 'condominio';
    roomDimensions?: string;
    voltage?: '110v' | '220v' | 'bivolt' | 'trifasico';
    status: 'approved' | 'approved_with_warnings' | 'rejected_illegal' | 'pending';
    attachedPdfName?: string;
    attachedPdfSize?: number;
    aiAnalysis?: {
        isLegallyCompliant: boolean;
        executiveSummary: string;
        legalAndNormativeAnalysis: string;
        technicalRecommendations: string[];
        safetyWarnings: string[];
        requiredMaterials: string[];
        courteousRejectionNotice?: string;
        approvalConfidence: number;
        suggestedPclProducts?: string[];
    };
    adminNotes?: string;
    createdAt: string;
    updatedAt?: string;
}

export type HeroCategory = 
    | 'geral_capa' 
    | 'promocoes_dia' 
    | 'jornal_ofertas' 
    | 'dia_dos_pais' 
    | 'dia_das_maes' 
    | 'natal' 
    | 'black_friday' 
    | 'dia_dos_namorados' 
    | 'pascoa_festas' 
    | 'queima_estoque' 
    | 'lancamentos' 
    | 'outros';

export interface HeroCoverConfig {
    id?: string;
    title?: string;
    category?: HeroCategory | string;
    mediaType: 'image' | 'video';
    imageUrl: string;
    videoUrl?: string;
    badgeText?: string;
    headlinePrefix?: string;
    headlineHighlight?: string;
    headlineSuffix?: string;
    subheadline?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    ratingScore?: string;
    ratingLabel?: string;
    trustLabel?: string;
    floatingCardTitle?: string;
    floatingCardSubtext?: string;
    updatedAt?: string;
}

export interface HeroCoverAsset extends HeroCoverConfig {
    id: string;
    title: string;
    category: HeroCategory;
    tags?: string[];
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    fileSizeKb?: number;
    format?: string;
    aspectRatio?: string;
    isActiveOnSite?: boolean;
    createdAt?: string;
}

export interface RMARecord {
    id: string;
    protocol: string;
    type: 'return_refund' | 'exchange' | 'defect_scrap' | 'rma_supplier';
    productId: string;
    productName: string;
    productImageUrl?: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
    totalAmount: number;
    lossAmount?: number;
    reason: string;
    condition: 'intact' | 'broken_scrap' | 'defect_warranty';
    stockDestination: 'restocked' | 'scrapped' | 'quarantine_rma';
    financialAction: 'refund_cash_pix' | 'refund_card' | 'store_credit' | 'loss_writeoff' | 'supplier_credit' | 'none';
    customerName?: string;
    customerDocument?: string;
    customerPhone?: string;
    supplierName?: string;
    invoiceNumber?: string;
    batchNumber?: string;
    saleId?: string;
    status: 'completed' | 'pending_supplier' | 'in_analysis' | 'resolved';
    resolutionNotes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface QuoteRecord {
    id: string;
    quoteNumber: string;
    customerId?: string;
    customerName: string;
    customerDocument?: string;
    customerPhone?: string;
    customerEmail?: string;
    items: CartItem[];
    subtotal: number;
    discountPercent?: number;
    discountAmount?: number;
    total: number;
    validityDays: number;
    validUntil: string;
    paymentTerms: string;
    notes?: string;
    sellerName?: string;
    status: 'draft' | 'open' | 'converted' | 'expired';
    convertedSaleId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface MediaAsset {
    id: string;
    title: string;
    category: string; // 'iluminacao' | 'eletrica' | 'hidraulica' | 'ferramentas' | 'decoracao' | 'outros'
    tags: string[];
    url: string; // URL do asset (CDN ou link direto otimizado)
    thumbnailUrl?: string;
    aspectRatio?: string;
    width?: number;
    height?: number;
    fileSizeKb?: number;
    format: string; // 'webp' | 'png' | 'jpg' | 'svg'
    source: 'upload' | 'ai_generated' | 'curated';
    createdAt: string;
}

export type AdminModuleId = 
    | 'dashboard' 
    | 'manager_control'
    | 'store_modules'
    | 'pos' 
    | 'crm' 
    | 'returns_rma' 
    | 'inventory' 
    | 'services' 
    | 'partner_services'
    | 'suppliers' 
    | 'hero_cover' 
    | 'technical_consultancy' 
    | 'media_bank' 
    | 'marketing_security' 
    | 'financial' 
    | 'reports' 
    | 'collaborators' 
    | 'carrefour_marketplace'
    | 'institutional_footer'
    | 'documentation' 
    | 'backup_restore';

export interface CustomerTestimonial {
    id: string;
    authorName: string;
    cityState: string;
    rating: number; // 1 to 5
    comment: string;
    productPurchased?: string;
    verifiedPurchase: boolean;
    date: string;
    active: boolean;
}

export interface InstitutionalFooterConfig {
    id?: string;
    company: {
        tradeName: string;
        legalName: string;
        cnpj: string;
        stateRegistration: string;
        addressStreet: string;
        addressNumber: string;
        addressComplement: string;
        addressNeighborhood: string;
        addressCity: string;
        addressState: string;
        addressZip: string;
    };
    contact: {
        whatsapp: string;
        whatsappRaw: string;
        whatsappDefaultMessage: string;
        phone: string;
        email: string;
        businessHours: string;
    };
    social: {
        instagramUrl: string;
        facebookUrl: string;
        youtubeUrl: string;
    };
    securityBadges: {
        sslEnabled: boolean;
        sslLabel: string;
        googleSafeEnabled: boolean;
        lgpdEnabled: boolean;
        verifiedStoreEnabled: boolean;
    };
    paymentMethods: {
        pixEnabled: boolean;
        pixBadgeText: string;
        creditCardsEnabled: boolean;
        creditCardBrands: string[];
        installmentsNote: string;
        boletoEnabled: boolean;
        mercadoPagoEnabled: boolean;
    };
    policies: {
        returnsPolicyTitle: string;
        returnsPolicyContent: string;
        privacyPolicyTitle: string;
        privacyPolicyContent: string;
        termsOfUseTitle: string;
        termsOfUseContent: string;
        aboutUsTitle: string;
        aboutUsContent: string;
    };
    careers?: {
        enabled: boolean;
        title: string;
        descriptionText: string;
        email: string;
        showInFooter: boolean;
    };
    testimonials: CustomerTestimonial[];
    displayOptions: {
        showTrustPillars: boolean;
        showTestimonials: boolean;
        showSocialLinks: boolean;
        showLegalText: boolean;
    };
    updatedAt?: string;
    updatedBy?: string;
}

export interface JobApplication {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    resumeFileName?: string;
    resumeFileSize?: number;
    resumeFileData?: string; // base64 string (se disponível)
    message?: string;
    createdAt?: string | any;
    status?: 'new' | 'reviewed' | 'contacted' | 'archived';
}

export interface StoreModulesConfig {
    id?: string;
    salesOnlyMode: boolean; // Modo Rápido & Limpo: Foco exclusivo em vendas de produtos no balcão e online
    
    // 1. Consultoria Técnica IA
    consultancyEnabled: boolean; // Chave mestre da Consultoria Técnica IA
    consultancyHeaderButton: boolean; // Exibir botão no Header/Menu
    consultancyHomeBanner: boolean; // Exibir banner chamativo na Página Inicial
    consultancyCartCta: boolean; // Exibir chamada da Consultoria no Carrinho de Compras

    // 2. Applet Especialista
    appletEnabled: boolean; // Chave mestre do Applet Especialista (botão e modal)

    // 3. Instaladores e Parceiros (Rede de Parceiros)
    partnersEnabled: boolean; // Chave mestre da Rede de Instaladores Parceiros
    partnersHeaderLink: boolean; // Exibir link no Header
    partnersHomeSection: boolean; // Exibir vitrine de profissionais na Página Inicial
    partnersProductDetail: boolean; // Exibir indicação de instalador no detalhe do produto

    // 4. Serviços Técnicos Próprios (Design, Instalação e Manutenção da Loja)
    servicesEnabled: boolean; // Chave mestre da Seção de Serviços Próprios
    servicesHeaderLink: boolean; // Exibir link "Serviços" no Header

    // 5. Assistente Virtual & Chatbot IA
    chatbotEnabled: boolean; // Exibir widget flutuante de atendimento na vitrine

    updatedAt?: string;
    updatedBy?: string;
    notes?: string;
}

export interface CustomFinancialIndicator {
    id: string;
    name: string;
    value: number;
    unit: 'BRL' | 'PERCENT' | 'COUNT';
    target?: number;
    description?: string;
}

export interface DailyFinancialKPIRecord {
    id: string; // Ex: 'kpi-2026-08-22'
    date: string; // Formato YYYY-MM-DD
    timestamp: string;
    managerName: string;
    managerId?: string;
    managerRole?: string;
    status: 'approved' | 'in_review' | 'flagged';
    // Indicadores Chave do Dia
    totalDailyRevenue: number; // Faturamento Total do Dia (R$)
    posSalesRevenue: number; // Vendas Balcão / PDV (R$)
    onlineSalesRevenue: number; // Vendas Loja Virtual / WhatsApp (R$)
    servicesRevenue: number; // Receita de Serviços Técnicos / Instalação (R$)
    partnersMRR: number; // Receita Recorrente de Mensalidades de Parceiros (R$)
    averageTicket: number; // Ticket Médio por Venda (R$)
    cashBalance: number; // Saldo de Caixa / Bancos Disponível (R$)
    accountsPayableDay: number; // Contas a Pagar do Dia / Vencimentos (R$)
    accountsReceivableDay: number; // Contas a Receber do Dia (R$)
    estimatedGrossMargin: number; // Margem de Lucro Bruta Estimada (%)
    salesTarget: number; // Meta de Vendas do Dia (R$)
    targetAchievementRate: number; // % da Meta Atingida (Ex: 104.5%)
    totalDefaulters: number; // Inadimplência / Devedores (R$)
    customIndicators?: CustomFinancialIndicator[];
    completedTasks?: string[]; // IDs das 8 tarefas oficiais do gestor cumpridas na data
    managerNotes: string; // Parecer / Diário de Bordo do Gestor
    updatedAt: string;
}

export interface MarketInterestRates {
    workingCapital: number; // Capital de Giro PJ (% a.m. ou % a.a.)
    creditCardRevolving: number; // Rotativo Cartão de Crédito (% a.a.)
    personalCredit: number; // Crédito Pessoal PF (% a.m.)
    overdraft: number; // Cheque Especial (% a.m.)
    cdiRate?: number; // Taxa CDI (% a.a.)
    savingsRate?: number; // Rendimento Poupança (% a.a.)
}

export interface MarketEconomicIndicators {
    id: string; // Ex: 'current_rates'
    timestamp: string;
    lastUpdated: string;
    updatedBy?: string;
    // Câmbio
    usdCommercial: number; // Dólar Comercial (BRL)
    usdTourism: number; // Dólar Turismo (BRL)
    usdVariation: number; // Variação % do Dólar
    usdHigh: number; // Máxima do dia
    usdLow: number; // Mínima do dia
    eurRate: number; // Euro Comercial (BRL)
    eurVariation: number; // Variação % Euro
    gbpRate: number; // Libra Esterlina (BRL)
    gbpVariation: number; // Variação % Libra
    brlBase: number; // Base 1.00
    // Macro Indicadores Nacionais
    selicRate: number; // Taxa Selic (% a.a.)
    cdiRate: number; // Taxa CDI (% a.a.)
    ipca12m: number; // IPCA Inflação Acumulada 12m (%)
    minimumWage: number; // Salário Mínimo Vigente Nacional (R$)
    marketInterestRates: MarketInterestRates;
    notes?: string;
}

export type CollaboratorRole = 'admin' | 'manager' | 'cashier_sales' | 'inventory_stock' | 'marketing' | 'finance';

export interface Collaborator {
    id: string;
    name: string;
    email: string;
    role: CollaboratorRole;
    department: string;
    phone?: string;
    document?: string;
    pin?: string; // PIN para liberação de descontos ou trocas
    status: 'active' | 'inactive';
    allowedModules: AdminModuleId[];
    canDeleteRecords?: boolean;
    canDiscountAboveLimit?: boolean;
    canViewCostPrice?: boolean;
    canExportData?: boolean;
    lastLogin?: string;
    createdAt: string;
    notes?: string;
}

export interface AuditLogRecord {
    id: string;
    timestamp: string;
    collaboratorName: string;
    collaboratorRole: string;
    action: string;
    module: string;
    details: string;
    severity: 'info' | 'warning' | 'critical';
}

export interface PartnerProvider {
    id: string;
    name: string;
    tradeName?: string;
    document: string; // CPF ou CNPJ (MEI)
    email: string;
    phone: string; // WhatsApp
    city: string;
    state: string;
    coverageAreas: string[]; // Bairros / Cidades atendidas
    specialty: 'eletricista' | 'instalador_lustres' | 'encanador_hidraulica' | 'montador_moveis' | 'fechaduras_digitais' | 'ar_condicionado' | 'pintura_acabamento' | 'automacao_smart' | 'pedreiro_reformas' | 'vidraceiro_box' | 'serralheiro_estruturas' | 'outro';
    rating: number; // Ex: 4.9
    reviewCount: number; // Total de avaliações
    bio: string; // Descrição de experiência e apresentação
    profileImageUrl?: string;
    portfolioImages?: string[]; // Fotos de serviços realizados
    // Controle Financeiro & Assinatura de Divulgação (Modelo 1 - Espaço Publicitário)
    subscriptionPlan?: 'free_trial' | 'standard' | 'highlight_vip' | 'custom';
    subscriptionStatus?: 'active' | 'trial' | 'pending_payment' | 'suspended' | 'canceled';
    subscriptionExpiresAt?: string; // Data ISO ex: "2026-09-21"
    monthlyFeeAmount?: number; // Ex: 49.90
    lastPaymentDate?: string;
    pixPaymentKey?: string;
    billingNotes?: string;
    isFeatured?: boolean; // Destaque VIP no topo
    status: 'active' | 'in_review' | 'inactive'; // Ativo, Em Análise, Desativado
    termsAccepted: boolean; // Aceite formal do termo de prestador autônomo
    termsAcceptedAt?: string;
    priceRangeDescription?: string; // Ex: "Orçamento sem compromisso" ou "A partir de R$ 80"
    verifiedBadges?: string[]; // Ex: ["MEI Verificado", "Eletricista NR-10", "Parceiro Oficial"]
    createdAt: string;
    updatedAt?: string;
}

export interface PartnerMarketplaceSettings {
    isEnabled: boolean; // Interruptor mestre para ativar/desativar todo o módulo na loja
    showInHeader: boolean;
    showInFooter: boolean;
    showInProductDetail: boolean;
    disclaimerText: string;
    termsAndConditionsText: string;
    contactSupportPhone?: string;
    defaultTrialDays?: number; // Ex: 30 dias de teste grátis
    defaultMonthlyFee?: number; // Ex: 49.90
    pixBillingKey?: string; // Chave Pix da loja para receber mensalidade
    pixBillingBeneficiary?: string; // Razão social / Nome do titular da chave
}

export type View = 'marketplace' | 'login' | 'admin' | 'checkout' | 'orderConfirmation' | 'technicalConsultancy' | 'partnerServices';

export interface SupportPoint {
    id: string;
    name: string; // Ex: "Ponto de Apoio Principal (Matriz)", "Ponto de Apoio - Região Norte", "Ponto de Apoio - Filial 2"
    tradeName?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    contactPerson?: string;
    lat: number;
    lng: number;
    maxLocalRadiusKm: number; // Raio máximo de entrega local (padrão 15 km)
    active: boolean; // Se o ponto de apoio está ativo para retiradas e entregas
    isMain?: boolean; // Ponto de Apoio Matriz / Principal
    operatingHours?: string; // Ex: "Seg a Sex: 08h às 18h • Sáb: 08h às 12h"
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}





