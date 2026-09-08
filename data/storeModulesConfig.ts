import { StoreModulesConfig } from '../types';

export const DEFAULT_STORE_MODULES_CONFIG: StoreModulesConfig = {
    salesOnlyMode: true, // Modo Foco em Vendas de Produtos Ativado (Página Limpa)
    
    // 1. Consultoria Técnica IA
    consultancyEnabled: false,
    consultancyHeaderButton: false,
    consultancyHomeBanner: false,
    consultancyCartCta: false,

    // 2. Applet Especialista
    appletEnabled: false,

    // 3. Instaladores e Parceiros
    partnersEnabled: false,
    partnersHeaderLink: false,
    partnersHomeSection: false,
    partnersProductDetail: false,

    // 4. Catálogo de Serviços Próprios
    servicesEnabled: false,
    servicesHeaderLink: false,

    // 5. Chatbot Virtual IA
    chatbotEnabled: false,

    updatedAt: new Date().toISOString(),
    notes: 'Configuração com foco exclusivo em vendas de produtos e vitrine limpa.'
};

export const FULL_SERVICES_STORE_MODULES_CONFIG: StoreModulesConfig = {
    salesOnlyMode: false,
    
    // 1. Consultoria Técnica IA
    consultancyEnabled: true,
    consultancyHeaderButton: true,
    consultancyHomeBanner: true,
    consultancyCartCta: true,

    // 2. Applet Especialista
    appletEnabled: true,

    // 3. Instaladores e Parceiros
    partnersEnabled: true,
    partnersHeaderLink: true,
    partnersHomeSection: true,
    partnersProductDetail: true,

    // 4. Catálogo de Serviços Próprios
    servicesEnabled: true,
    servicesHeaderLink: true,

    // 5. Chatbot Virtual IA
    chatbotEnabled: true,

    updatedAt: new Date().toISOString(),
    notes: 'Loja Completa com todos os módulos, consultorias e serviços de parceiros ativos.'
};
