import type { Product } from '../types';
import { isKitProduct } from './catalogHelper';
import { getProductPromoDetails } from './productStatusHelper';

export interface ProductClassItem {
    id: string;
    label: string;
    shortLabel?: string;
    description: string;
    iconName: 'Zap' | 'Droplets' | 'Wrench' | 'Lightbulb' | 'Home' | 'Flame' | 'Boxes' | 'Gift' | 'Layers' | 'Sprout' | 'Shield' | 'Radio' | 'Wifi' | 'Paintbrush';
    color: string;
    accentBg: string;
    borderActive: string;
    isHighlight?: boolean;
}

export const MAIN_PRODUCT_CLASSES: ProductClassItem[] = [
    {
        id: 'Material Elétrico',
        label: 'Material Elétrico',
        shortLabel: 'Elétrico',
        description: 'Fios, cabos, disjuntores, tomadas, interruptores, canaletas e fita isolante',
        iconName: 'Zap',
        color: 'text-amber-700 hover:text-amber-800',
        accentBg: 'bg-amber-600 text-white',
        borderActive: 'border-amber-600',
    },
    {
        id: 'Material Hidráulico',
        label: 'Material Hidráulico',
        shortLabel: 'Hidráulico',
        description: 'Tubos, conexões de esgoto e soldável, registros, torneiras e metais sanitários',
        iconName: 'Droplets',
        color: 'text-sky-700 hover:text-sky-800',
        accentBg: 'bg-sky-600 text-white',
        borderActive: 'border-sky-600',
    },
    {
        id: 'Ferramentas',
        label: 'Ferramentas',
        shortLabel: 'Ferramentas',
        description: 'Alicates, chaves, martelos, trenas, furadeiras, serras e kits profissionais',
        iconName: 'Wrench',
        color: 'text-slate-800 hover:text-slate-950',
        accentBg: 'bg-slate-800 text-white',
        borderActive: 'border-slate-800',
    },
    {
        id: 'Iluminação',
        label: 'Iluminação',
        shortLabel: 'Iluminação',
        description: 'Lâmpadas LED, refletores, luminárias, painéis e spots de alta eficiência',
        iconName: 'Lightbulb',
        color: 'text-yellow-700 hover:text-yellow-800',
        accentBg: 'bg-amber-500 text-slate-950',
        borderActive: 'border-amber-500',
    },
    {
        id: 'Segurança - EPI',
        label: 'Segurança - EPI',
        shortLabel: 'Segurança / EPI',
        description: 'Equipamentos de Proteção Individual (EPI), luvas, óculos, capacetes, máscaras, abafadores e calçados',
        iconName: 'Shield',
        color: 'text-amber-800 hover:text-amber-900',
        accentBg: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white',
        borderActive: 'border-amber-600',
    },
    {
        id: 'Telefonia, Informática, Comunicação & Segurança',
        label: 'Telefonia, Informática, Comunicação e Segurança Eletrônica',
        shortLabel: 'Telefonia, TI & Seg.',
        description: 'Cabos de rede RJ45, telefonia, interfonia, antenas, CFTV, alarmes e segurança eletrônica',
        iconName: 'Radio',
        color: 'text-blue-700 hover:text-blue-800',
        accentBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-700 text-white',
        borderActive: 'border-blue-600',
    },
    {
        id: 'Tintas, Vernizes e Acabamento',
        label: 'Tintas, Vernizes e Acabamento',
        shortLabel: 'Tintas & Acabamento',
        description: 'Tintas acrílicas, esmaltes, vernizes, seladores, massas corridas, solventes, trinchas e rolos',
        iconName: 'Paintbrush',
        color: 'text-rose-700 hover:text-rose-800',
        accentBg: 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-700 text-white',
        borderActive: 'border-rose-600',
    },
    {
        id: 'Casa - Jardim - Agrícola',
        label: 'Casa, Jardim e Agrícola',
        shortLabel: 'Casa, Jardim & Agrícola',
        description: 'Utilidades do lar, mangueiras, irrigação, jardinagem, poda e ferramentas agrícolas',
        iconName: 'Sprout',
        color: 'text-emerald-700 hover:text-emerald-800',
        accentBg: 'bg-gradient-to-r from-emerald-600 via-teal-700 to-green-800 text-white',
        borderActive: 'border-emerald-700',
    },
    {
        id: 'Utilidades, Ferragens e Fixação',
        label: 'Utilidades, Ferragens e Fixação',
        shortLabel: 'Utilidades & Fixação',
        description: 'Parafusos, buchas, pregos, dobradiças, cadeados, rodízios, suportes, ferragens e utilidades do lar',
        iconName: 'Home',
        color: 'text-teal-700 hover:text-teal-800',
        accentBg: 'bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-800 text-white',
        borderActive: 'border-teal-700',
    },
    {
        id: 'PROMOÇÃO',
        label: 'Promoção',
        shortLabel: 'Ofertas',
        description: 'Produtos em oferta com descontos especiais por tempo limitado',
        iconName: 'Flame',
        color: 'text-red-700 hover:text-red-800',
        accentBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white',
        borderActive: 'border-red-600',
        isHighlight: true
    },
    {
        id: 'KITS & COMBOS',
        label: 'Kits & Combos',
        shortLabel: 'Kits',
        description: 'Kits prontos para reformas, instalações elétricas e presentes com economia',
        iconName: 'Boxes',
        color: 'text-purple-700 hover:text-purple-800',
        accentBg: 'bg-purple-700 text-white',
        borderActive: 'border-purple-700',
    },
    {
        id: 'PRESENTES',
        label: 'Presentes',
        shortLabel: 'Presentes',
        description: 'Sugestões exclusivas para Dia dos Pais, Dia das Mães e datas especiais',
        iconName: 'Gift',
        color: 'text-rose-700 hover:text-rose-800',
        accentBg: 'bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600 text-white',
        borderActive: 'border-rose-600',
    },
    {
        id: 'Todos',
        label: 'Todos',
        shortLabel: 'Todos',
        description: 'Catálogo completo com todas as classes e categorias disponíveis',
        iconName: 'Layers',
        color: 'text-gray-700 hover:text-gray-900',
        accentBg: 'bg-brand-primary text-white',
        borderActive: 'border-brand-primary',
    }
];

/**
 * Avalia se um produto corresponde à classe selecionada
 */
export function matchProductToClass(p: Product, classId: string): boolean {
    if (!classId || classId === 'Todos' || classId === 'todos') {
        return true;
    }

    const normTarget = classId.trim().toLowerCase();

    // Promoção
    if (normTarget === 'promoção' || normTarget === 'promocao' || normTarget === 'ofertas') {
        const promo = getProductPromoDetails(p);
        return promo.isPromoActive || Boolean(p.isPromo);
    }

    // Kits & Combos
    if (normTarget === 'kits & combos' || normTarget === 'kits' || normTarget === 'combos') {
        const cat = (p.category || '').toLowerCase();
        const pClass = (p.productClass || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return isKitProduct(p) || cat.includes('kit') || pClass.includes('kit') || name.includes('kit ') || name.includes('combo ');
    }

    // Presentes
    if (normTarget === 'presentes' || normTarget === 'presente') {
        const text = `${p.name || ''} ${p.description || ''} ${p.category || ''} ${p.department || ''} ${p.productClass || ''}`.toLowerCase();
        return (
            text.includes('presente') || 
            isKitProduct(p) || 
            text.includes('churrasco') || 
            text.includes('faqueiro') || 
            text.includes('maleta') || 
            text.includes('luminária') ||
            text.includes('jogo de')
        );
    }

    const cat = (p.category || '').toLowerCase();
    const pClass = (p.productClass || '').toLowerCase();
    const dept = (p.department || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const specs = (p.technicalSpecs || '').toLowerCase();
    const fullText = `${name} ${desc} ${cat} ${pClass} ${dept} ${specs}`;

    // Material Elétrico
    if (normTarget === 'material elétrico' || normTarget === 'material eletrico' || normTarget === 'materiais elétricos' || normTarget === 'eletrico' || normTarget === 'elétrico') {
        return (
            cat.includes('elétric') || cat.includes('eletric') ||
            pClass.includes('elétric') || pClass.includes('eletric') || pClass.includes('isolação') ||
            dept.includes('elétric') || dept.includes('eletric') ||
            fullText.includes('fita isolante') || fullText.includes('disjuntor') || fullText.includes('tomada') ||
            fullText.includes('interruptor') || fullText.includes('fio ') || fullText.includes('cabo ') ||
            fullText.includes('eletroduto') || fullText.includes('canaleta') || fullText.includes('barramento') ||
            fullText.includes('quadro de distribuição') || fullText.includes('fusível') || fullText.includes('plafon') ||
            fullText.includes('campainha') || fullText.includes('extensão') || fullText.includes('filtro de linha') ||
            fullText.includes('abraçadeira') || fullText.includes('botoeira') || fullText.includes('contator') ||
            fullText.includes('sensor de presença') || fullText.includes('soquete') || fullText.includes('rele')
        );
    }

    // Material Hidráulico
    if (normTarget === 'material hidráulico' || normTarget === 'material hidraulico' || normTarget === 'materiais hidráulicos' || normTarget === 'hidraulico' || normTarget === 'hidráulico') {
        return (
            cat.includes('hidráulic') || cat.includes('hidraulic') || cat.includes('tubo') || cat.includes('conex') || cat.includes('metais') ||
            pClass.includes('hidráulic') || pClass.includes('hidraulic') || pClass.includes('tubo') || pClass.includes('esgoto') ||
            dept.includes('hidráulic') || dept.includes('hidraulic') ||
            fullText.includes('tubo ') || fullText.includes('tubos') || fullText.includes('conexão') || fullText.includes('conexões') ||
            fullText.includes('pvc') || fullText.includes('esgoto') || fullText.includes('soldável') || fullText.includes('soldavel') ||
            fullText.includes('registro') || fullText.includes('torneira') || fullText.includes('ralo') || fullText.includes('sifão') ||
            fullText.includes('sifao') || fullText.includes('válvula') || fullText.includes('valvula') || fullText.includes('flange') ||
            fullText.includes('joelho') || fullText.includes('bucha de redução') || fullText.includes('engate flexível') ||
            fullText.includes('caixa d\'água') || fullText.includes('adaptador') || fullText.includes('fita veda rosca') ||
            fullText.includes('cola pvc') || fullText.includes('solução limpadora') || fullText.includes('adesivo plástico') ||
            fullText.includes('ducha higiênica') || fullText.includes('chuveiro') || fullText.includes('deca') || fullText.includes('tigre') ||
            fullText.includes('amanco') || fullText.includes('kronos')
        );
    }

    // Ferramentas
    if (normTarget === 'ferramentas' || normTarget === 'ferramenta' || normTarget === 'ferramentas & máquinas') {
        return (
            cat.includes('ferramenta') || cat.includes('máquina') || cat.includes('maquina') ||
            pClass.includes('ferramenta') || pClass.includes('medição') || pClass.includes('aperto') ||
            dept.includes('ferramenta') ||
            fullText.includes('alicate') || fullText.includes('martelo') || fullText.includes('chave ') || fullText.includes('chaves') ||
            fullText.includes('trena') || fullText.includes('furadeira') || fullText.includes('parafusadeira') ||
            fullText.includes('esmerilhadeira') || fullText.includes('serra') || fullText.includes('disco') ||
            fullText.includes('broca') || fullText.includes('maleta') || fullText.includes('nível') || fullText.includes('nivel') ||
            fullText.includes('desempenadeira') || fullText.includes('marreta') || fullText.includes('torquês') ||
            fullText.includes('arco de serra') || fullText.includes('espátula') || fullText.includes('colher de pedreiro') ||
            fullText.includes('lima') || fullText.includes('grampeador') || fullText.includes('alavanca') || fullText.includes('trenas') ||
            fullText.includes('famastil') || fullText.includes('tramontina pro')
        );
    }

    // Iluminação
    if (normTarget === 'iluminação' || normTarget === 'iluminacao' || normTarget === 'iluminação & lâmpadas') {
        return (
            cat.includes('ilumina') || cat.includes('lâmpada') || cat.includes('lampada') ||
            pClass.includes('ilumina') || pClass.includes('lâmpada') || pClass.includes('led') ||
            dept.includes('ilumina') || dept.includes('led') ||
            fullText.includes('refletor') || fullText.includes('lâmpada') || fullText.includes('lampada') ||
            fullText.includes('luminária') || fullText.includes('luminaria') || fullText.includes('painel led') ||
            fullText.includes('spot') || fullText.includes('fita led') || fullText.includes('tubular led') ||
            fullText.includes('pendente') || fullText.includes('plafonier') || fullText.includes('arandela') ||
            fullText.includes('microled') || fullText.includes('bivolt 6500k') || fullText.includes('bivolt 3000k') ||
            fullText.includes('bocal')
        );
    }

    // Segurança - EPI (Equipamentos de Proteção Individual)
    if (
        normTarget === 'segurança - epi' ||
        normTarget === 'seguranca - epi' ||
        normTarget === 'segurança' ||
        normTarget === 'seguranca' ||
        normTarget === 'epi' ||
        normTarget === 'epis' ||
        normTarget === 'equipamento de proteção' ||
        normTarget === 'proteção individual'
    ) {
        return (
            cat.includes('seguran') || cat.includes('epi') || cat.includes('proteç') || cat.includes('protec') ||
            pClass.includes('seguran') || pClass.includes('epi') || pClass.includes('proteç') ||
            dept.includes('seguran') || dept.includes('epi') || dept.includes('proteç') ||
            fullText.includes('epi') || fullText.includes('segurança') || fullText.includes('seguranca') ||
            fullText.includes('luva') || fullText.includes('luvas') || fullText.includes('óculos de proteção') ||
            fullText.includes('oculos de protecao') || fullText.includes('capacete') || fullText.includes('máscara') ||
            fullText.includes('mascara') || fullText.includes('respirador') || fullText.includes('pff2') ||
            fullText.includes('protetor auricular') || fullText.includes('abafador') || fullText.includes('botina') ||
            fullText.includes('bota de segurança') || fullText.includes('bota de seguranca') || fullText.includes('perneira') ||
            fullText.includes('avental') || fullText.includes('cinto de segurança') || fullText.includes('talabarte') ||
            fullText.includes('trava-queda') || fullText.includes('fita zebrada') || fullText.includes('cone de sinalização') ||
            fullText.includes('colete refletivo') || fullText.includes('protetor facial') || fullText.includes('ca ') ||
            fullText.includes('certificado de aprovação')
        );
    }

    // Casa - Jardim - Agrícola (Aba única consolidando os 3 segmentos)
    if (
        normTarget === 'casa - jardim - agrícola' ||
        normTarget === 'casa - jardim - agricola' ||
        normTarget === 'casa, jardim e agrícola' ||
        normTarget === 'casa, jardim e agricola' ||
        normTarget === 'casa jardim agrícola' ||
        normTarget === 'casa jardim agricola' ||
        normTarget === 'casa, jardim & agrícola' ||
        normTarget === 'casa, jardim & agricola' ||
        normTarget === 'casa' ||
        normTarget === 'jardim' ||
        normTarget === 'jardinagem' ||
        normTarget === 'agrícola' ||
        normTarget === 'agricola' ||
        normTarget === 'campo'
    ) {
        return (
            cat.includes('jardim') || cat.includes('agrícol') || cat.includes('agricol') || cat.includes('casa') || cat.includes('utilidade') ||
            pClass.includes('jardim') || pClass.includes('agrícol') || pClass.includes('agricol') || pClass.includes('utilidade') ||
            dept.includes('jardim') || dept.includes('agrícol') || dept.includes('agricol') || dept.includes('campo') ||
            fullText.includes('jardim') || fullText.includes('jardinagem') || fullText.includes('poda') ||
            fullText.includes('mangueira') || fullText.includes('esguicho') || fullText.includes('regador') ||
            fullText.includes('enxada') || fullText.includes('pá de') || fullText.includes('pa de') || fullText.includes('foice') ||
            fullText.includes('cavadeira') || fullText.includes('picareta') || fullText.includes('ancinho') ||
            fullText.includes('rastelo') || fullText.includes('pulverizador') || fullText.includes('machado') ||
            fullText.includes('tesoura de poda') || fullText.includes('grama') || fullText.includes('cortador de grama') ||
            fullText.includes('aparador') || fullText.includes('adubo') || fullText.includes('terra vegetal') ||
            fullText.includes('vaso') || fullText.includes('irrigação') || fullText.includes('irrigacao') ||
            fullText.includes('arame galvanizado') || fullText.includes('tela galinheiro') || fullText.includes('lona') ||
            fullText.includes('faqueiro') || fullText.includes('varal') || fullText.includes('escorredor') ||
            fullText.includes('lixeira') || fullText.includes('balde') || fullText.includes('organizador') ||
            fullText.includes('vassoura') || fullText.includes('rodo')
        );
    }

    // Telefonia, Informática, Comunicação & Segurança Eletrônica
    if (
        normTarget === 'telefonia, informática, comunicação & segurança' ||
        normTarget === 'telefonia, informatica, comunicacao & seguranca' ||
        normTarget === 'telefonia, informática, comunicação & segurança eletrônica' ||
        normTarget === 'telefonia, informatica, comunicacao & seguranca eletronica' ||
        normTarget === 'telefonia, informática, comunicação, segurança eletronica' ||
        normTarget === 'telefonia, informática, comunicação, segurança enetronica' ||
        normTarget === 'telefonia & informática' ||
        normTarget === 'telefonia & informatica' ||
        normTarget === 'telefonia' ||
        normTarget === 'informática' ||
        normTarget === 'informatica' ||
        normTarget === 'comunicação' ||
        normTarget === 'comunicacao' ||
        normTarget === 'segurança eletrônica' ||
        normTarget === 'seguranca eletronica' ||
        normTarget === 'cftv' ||
        normTarget === 'materiais de telefonia e comunicação' ||
        normTarget === 'telecom'
    ) {
        return (
            cat.includes('telef') || cat.includes('informát') || cat.includes('informat') || cat.includes('comunica') || cat.includes('cftv') || cat.includes('rede') ||
            pClass.includes('telef') || pClass.includes('informát') || pClass.includes('informat') || pClass.includes('comunica') || pClass.includes('cftv') || pClass.includes('segurança eletr') ||
            dept.includes('telef') || dept.includes('informát') || dept.includes('informat') || dept.includes('comunica') || dept.includes('cftv') ||
            fullText.includes('telefonia') || fullText.includes('telefone') || fullText.includes('telefônico') || fullText.includes('telefonico') ||
            fullText.includes('rj11') || fullText.includes('rj-11') || fullText.includes('rj45') || fullText.includes('rj-45') ||
            fullText.includes('cabo de rede') || fullText.includes('cat5') || fullText.includes('cat-05') || fullText.includes('cat6') || fullText.includes('cat-06') ||
            fullText.includes('patch cord') || fullText.includes('interfone') || fullText.includes('porteiro eletrônico') || fullText.includes('porteiro eletronico') ||
            fullText.includes('vídeo porteiro') || fullText.includes('video porteiro') || fullText.includes('cftv') ||
            fullText.includes('câmera') || fullText.includes('camera') || fullText.includes('dvr') || fullText.includes('nvr') ||
            fullText.includes('alarme') || fullText.includes('fechadura digital') || fullText.includes('fechadura eletrônica') || fullText.includes('fechadura eletrica') ||
            fullText.includes('campainha') || fullText.includes('antena') || fullText.includes('cabo coaxial') ||
            fullText.includes('roteador') || fullText.includes('switch') || fullText.includes('conector rj') ||
            fullText.includes('conector bnc') || fullText.includes('balun') || fullText.includes('intelbras')
        );
    }

    // Tintas, Vernizes e Acabamento
    if (
        normTarget === 'tintas, vernizes e acabamento' ||
        normTarget === 'tintas, vernizes & acabamento' ||
        normTarget === 'tintas e vernizes' ||
        normTarget === 'tintas & vernizes' ||
        normTarget === 'tintas' ||
        normTarget === 'vernizes' ||
        normTarget === 'pintura' ||
        normTarget === 'acabamento'
    ) {
        return (
            cat.includes('tinta') || cat.includes('verniz') || cat.includes('pintura') || cat.includes('acabamento') ||
            pClass.includes('tinta') || pClass.includes('verniz') || pClass.includes('pintura') || pClass.includes('acabamento') ||
            dept.includes('tinta') || dept.includes('verniz') || dept.includes('pintura') || dept.includes('acabamento') ||
            fullText.includes('tinta') || fullText.includes('verniz') || fullText.includes('esmalte sint') ||
            fullText.includes('massa corrida') || fullText.includes('massa acrílica') || fullText.includes('massa acrilica') ||
            fullText.includes('selador') || fullText.includes('fundo preparador') || fullText.includes('primer') ||
            fullText.includes('solvente') || fullText.includes('thinner') || fullText.includes('aguarrás') || fullText.includes('aguarras') ||
            fullText.includes('pincel') || fullText.includes('trincha') || fullText.includes('rolo de pintura') || fullText.includes('rolo de lã') || fullText.includes('rolo de la') ||
            fullText.includes('rolo de espuma') || fullText.includes('espátula') || fullText.includes('espatula') ||
            fullText.includes('lixa') || fullText.includes('fita crepe') || fullText.includes('impermeabilizante') ||
            fullText.includes('vedacit') || fullText.includes('suvinil') || fullText.includes('coral') || fullText.includes('drylevis')
        );
    }

    // Utilidades, Ferragens e Fixação
    if (
        normTarget === 'utilidades, ferragens e fixação' ||
        normTarget === 'utilidades, ferragens e fixacao' ||
        normTarget === 'utilidades, ferragens & fixação' ||
        normTarget === 'utilidades, ferragens & fixacao' ||
        normTarget === 'utilidades' ||
        normTarget === 'utilidade' ||
        normTarget === 'ferragens' ||
        normTarget === 'ferragem' ||
        normTarget === 'fixação' ||
        normTarget === 'fixacao' ||
        normTarget === 'utilidades do lar' ||
        normTarget === 'presentes & utilidades'
    ) {
        return (
            cat.includes('utilidade') || cat.includes('ferragem') || cat.includes('fixa') || cat.includes('casa') || cat.includes('cozinha') || cat.includes('banheiro') ||
            pClass.includes('utilidade') || pClass.includes('ferragem') || pClass.includes('fixa') || dept.includes('utilidade') || dept.includes('ferragem') ||
            fullText.includes('parafuso') || fullText.includes('bucha') || fullText.includes('prego') || fullText.includes('porca') || fullText.includes('arruela') ||
            fullText.includes('dobradiça') || fullText.includes('dobradica') || fullText.includes('fechadura') ||
            fullText.includes('cadeado') || fullText.includes('trava') || fullText.includes('trinco') || fullText.includes('ferrolho') ||
            fullText.includes('gancho') || fullText.includes('suporte') || fullText.includes('rodízio') || fullText.includes('rodizio') ||
            fullText.includes('rebite') || fullText.includes('abraçadeira') || fullText.includes('abracadeira') ||
            fullText.includes('faqueiro') || fullText.includes('faca') || fullText.includes('escorredor') ||
            fullText.includes('organizador') || fullText.includes('garrafa') || fullText.includes('varal') ||
            fullText.includes('lixeira') || fullText.includes('balde') || fullText.includes('tábua') ||
            fullText.includes('tesoura') || fullText.includes('travessa') || fullText.includes('panela') ||
            fullText.includes('churrasco') || fullText.includes('suporte para') || fullText.includes('porta tempero')
        );
    }

    // Outra categoria cadastrada
    return cat === normTarget || pClass === normTarget || dept === normTarget || fullText.includes(normTarget);
}

/**
 * Gestão Dinâmica de Classes e Departamentos (Acesso Restrito -> Promoção/Status)
 */
export interface ProductTaxonomySettings {
    classes: string[];
    departments: string[];
}

export const DEFAULT_ALIGNED_TAXONOMY: ProductTaxonomySettings = {
    classes: [
        'Material Elétrico',
        'Material Hidráulico',
        'Ferramentas',
        'Iluminação',
        'Segurança EPI',
        'Telefonia TI Segurança',
        'Tintas, Vernizes, Acabamento',
        'Casa jardim Agrícola',
        'Utilidades Ferragens',
        'Promoção',
        'kits combos',
        'Presentes',
        'Todos'
    ],
    departments: [
        'Material Elétrico',
        'Material Hidráulico',
        'Ferramentas',
        'Iluminação',
        'Segurança EPI',
        'Telefonia TI Segurança',
        'Tintas, Vernizes, Acabamento',
        'Casa jardim Agrícola',
        'Utilidades Ferragens',
        'Promoção',
        'kits combos',
        'Presentes',
        'Todos'
    ]
};

const TAXONOMY_STORAGE_KEY = 'ponto_chave_custom_taxonomy_v1';

export function getProductTaxonomy(): ProductTaxonomySettings {
    try {
        const raw = localStorage.getItem(TAXONOMY_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.classes) && Array.isArray(parsed?.departments)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Erro ao carregar taxonomia personalizada:', e);
    }
    return DEFAULT_ALIGNED_TAXONOMY;
}

export function saveProductTaxonomy(settings: ProductTaxonomySettings): void {
    try {
        localStorage.setItem(TAXONOMY_STORAGE_KEY, JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('product-taxonomy-updated', { detail: settings }));
    } catch (e) {
        console.error('Erro ao salvar taxonomia:', e);
    }
}
