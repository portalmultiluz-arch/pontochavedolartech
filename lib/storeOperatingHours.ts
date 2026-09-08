export interface StoreHoursConfig {
    enabled: boolean; // Se o controle de horário comercial está ativo
    allowBrowsingWhenClosed: boolean; // Permite navegar e colocar no carrinho, mas bloqueia checkout
    customNoticeMessage?: string;
    timezone: string; // Ex: 'America/Sao_Paulo'
    schedule: {
        // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
        mondayFriday: { openTime: string; closeTime: string; isOpen: boolean };
        saturday: { openTime: string; closeTime: string; isOpen: boolean };
        sunday: { isOpen: boolean };
    };
    holidays: string[]; // Formato YYYY-MM-DD
    manualOverride?: 'auto' | 'force_open' | 'force_closed';
}

export const DEFAULT_STORE_HOURS_CONFIG: StoreHoursConfig = {
    enabled: true,
    allowBrowsingWhenClosed: true,
    customNoticeMessage: 'Nosso atendimento e expedição de pedidos funcionam de Segunda a Sexta-feira das 08h00 às 18h00 e aos Sábados das 08h00 às 13h00. Fora deste horário, você pode continuar navegando e adicionando itens ao seu carrinho, mas a conclusão do pedido estará disponível no próximo horário comercial. Agradecemos sua compreensão!',
    timezone: 'America/Sao_Paulo',
    schedule: {
        mondayFriday: { openTime: '08:00', closeTime: '18:00', isOpen: true },
        saturday: { openTime: '08:00', closeTime: '13:00', isOpen: true },
        sunday: { isOpen: false }
    },
    holidays: [
        '2025-01-01', // Confraternização Universal
        '2025-04-18', // Sexta-feira Santa
        '2025-04-21', // Tiradentes
        '2025-05-01', // Dia do Trabalho
        '2025-09-07', // Independência
        '2025-10-12', // N. Sra Aparecida
        '2025-11-02', // Finados
        '2025-11-15', // Proclamação da República
        '2025-11-20', // Consciência Negra
        '2025-12-25', // Natal
        '2026-01-01',
        '2026-04-03',
        '2026-04-21',
        '2026-05-01',
        '2026-09-07',
        '2026-10-12',
        '2026-11-02',
        '2026-11-15',
        '2026-11-20',
        '2026-12-25'
    ],
    manualOverride: 'auto'
};

const STORAGE_KEY = 'store_operating_hours_config';

export function getStoreHoursConfig(): StoreHoursConfig {
    if (typeof window === 'undefined') return DEFAULT_STORE_HOURS_CONFIG;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_STORE_HOURS_CONFIG, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.warn('Erro ao carregar store_operating_hours_config:', e);
    }
    return DEFAULT_STORE_HOURS_CONFIG;
}

export function saveStoreHoursConfig(config: StoreHoursConfig): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.warn('Erro ao salvar store_operating_hours_config:', e);
    }
}

export interface StoreStatusResult {
    isOpen: boolean;
    reasonClosed?: string;
    currentDayName: string;
    currentTimeStr: string;
    scheduleText: string;
    nextOpeningText: string;
    noticeMessage: string;
    canCheckout: boolean;
}

/**
 * Avalia se a loja está aberta ou fechada no momento de acordo com a regra oficial:
 * Segunda a Sexta-feira: 08h00 às 18h00
 * Sábados: 08h00 às 13h00
 * Domingos e Feriados: Fechado
 */
export function evaluateStoreStatus(customDate?: Date, customConfig?: StoreHoursConfig): StoreStatusResult {
    const config = customConfig || getStoreHoursConfig();
    const now = customDate || new Date();

    // Se o controle estiver desativado pelo administrador
    if (!config.enabled) {
        return {
            isOpen: true,
            currentDayName: 'Atendimento Normal',
            currentTimeStr: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            scheduleText: 'Segunda a Sexta: 08h00 às 18h00 | Sábados: 08h00 às 13h00',
            nextOpeningText: 'Loja em funcionamento',
            noticeMessage: '',
            canCheckout: true
        };
    }

    // Sobrescrita manual (se o gestor forçou abertura ou fechamento)
    if (config.manualOverride === 'force_open') {
        return {
            isOpen: true,
            currentDayName: 'Aberto (Autorização Especial)',
            currentTimeStr: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            scheduleText: 'Segunda a Sexta: 08h00 às 18h00 | Sábados: 08h00 às 13h00',
            nextOpeningText: 'Atendimento liberado pela administração',
            noticeMessage: '',
            canCheckout: true
        };
    }

    if (config.manualOverride === 'force_closed') {
        return {
            isOpen: false,
            reasonClosed: 'Loja temporariamente fechada para manutenção ou inventário.',
            currentDayName: 'Fechado temporariamente',
            currentTimeStr: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            scheduleText: 'Segunda a Sexta: 08h00 às 18h00 | Sábados: 08h00 às 13h00',
            nextOpeningText: 'Retorno em breve',
            noticeMessage: config.customNoticeMessage || DEFAULT_STORE_HOURS_CONFIG.customNoticeMessage!,
            canCheckout: false
        };
    }

    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const currentTimeStr = `${pad(hours)}:${pad(minutes)}`;
    const dateYMD = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const daysNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const currentDayName = daysNames[dayOfWeek];

    const scheduleText = 'Segunda a Sexta: 08h00 às 18h00 | Sábados: 08h00 às 13h00 | Domingos e Feriados: Fechado';
    const noticeMessage = config.customNoticeMessage || DEFAULT_STORE_HOURS_CONFIG.customNoticeMessage!;

    // 1. Verifica feriados cadastrados
    if (config.holidays.includes(dateYMD)) {
        return {
            isOpen: false,
            reasonClosed: 'Feriado (Atendimento e expedição em recesso)',
            currentDayName,
            currentTimeStr,
            scheduleText,
            nextOpeningText: 'Próximo dia útil às 08h00',
            noticeMessage,
            canCheckout: false
        };
    }

    // 2. Domingo
    if (dayOfWeek === 0) {
        return {
            isOpen: false,
            reasonClosed: 'Aos domingos nossa loja física e expedição estão fechadas.',
            currentDayName,
            currentTimeStr,
            scheduleText,
            nextOpeningText: 'Segunda-feira às 08h00',
            noticeMessage,
            canCheckout: false
        };
    }

    // 3. Sábado (08h00 às 13h00)
    if (dayOfWeek === 6) {
        const satOpen = 8 * 60; // 08:00 -> 480 min
        const satClose = 13 * 60; // 13:00 -> 780 min

        if (currentMinutes >= satOpen && currentMinutes < satClose) {
            return {
                isOpen: true,
                currentDayName,
                currentTimeStr,
                scheduleText,
                nextOpeningText: `Hoje até as 13h00`,
                noticeMessage: '',
                canCheckout: true
            };
        } else {
            const nextText = currentMinutes < satOpen 
                ? 'Hoje às 08h00' 
                : 'Segunda-feira às 08h00';
            return {
                isOpen: false,
                reasonClosed: currentMinutes < satOpen 
                    ? 'Abertura aos sábados às 08h00.' 
                    : 'Horário de sábado encerrado às 13h00.',
                currentDayName,
                currentTimeStr,
                scheduleText,
                nextOpeningText: nextText,
                noticeMessage,
                canCheckout: false
            };
        }
    }

    // 4. Segunda a Sexta-feira (08h00 às 18h00)
    const mfOpen = 8 * 60; // 08:00
    const mfClose = 18 * 60; // 18:00

    if (currentMinutes >= mfOpen && currentMinutes < mfClose) {
        return {
            isOpen: true,
            currentDayName,
            currentTimeStr,
            scheduleText,
            nextOpeningText: `Hoje até as 18h00`,
            noticeMessage: '',
            canCheckout: true
        };
    } else {
        let nextText = '';
        if (currentMinutes < mfOpen) {
            nextText = 'Hoje às 08h00';
        } else if (dayOfWeek === 5) {
            // Sexta após as 18h00 -> Amanhã (Sábado) às 08h00
            nextText = 'Amanhã (Sábado) às 08h00';
        } else {
            // Segunda a Quinta após as 18h00 -> Amanhã às 08h00
            nextText = 'Amanhã às 08h00';
        }

        return {
            isOpen: false,
            reasonClosed: currentMinutes < mfOpen
                ? 'Nosso atendimento inicia às 08h00.'
                : 'Expediente encerrado por hoje às 18h00.',
            currentDayName,
            currentTimeStr,
            scheduleText,
            nextOpeningText: nextText,
            noticeMessage,
            canCheckout: false
        };
    }
}
