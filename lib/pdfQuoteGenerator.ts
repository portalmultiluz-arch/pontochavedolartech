import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuoteRecord } from '../types';
import { sanitizeCustomerText } from './textHelper';

export function formatSafeDate(dateVal: any): string {
    if (!dateVal) return new Date().toLocaleDateString('pt-BR');
    if (typeof dateVal === 'object' && dateVal.seconds) {
        return new Date(dateVal.seconds * 1000).toLocaleDateString('pt-BR');
    }
    if (typeof dateVal === 'string') {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
    }
    return new Date().toLocaleDateString('pt-BR');
}

export function generateQuotePDF(quote: QuoteRecord) {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. Cabeçalho / Barra Superior
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(0, 0, pageWidth, 28, 'F');

        // Faixa de destaque Âmbar
        doc.setFillColor(217, 119, 6); // Amber-600
        doc.rect(0, 28, pageWidth, 3, 'F');

        // Título da Empresa
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('PONTO CHAVE DO LAR', 14, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(226, 232, 240);
        doc.text('Soluções em Design, Materiais, Iluminação & Utilidades', 14, 18);
        doc.text('CNPJ: 00.000.000/0001-00  •  Telefone / WhatsApp: (11) 99999-9999', 14, 23);

        // Bloco do Número do Orçamento no Cabeçalho
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(254, 240, 138); // Amber light
        doc.text('PROPOSTA COMERCIAL', pageWidth - 14, 11, { align: 'right' });
        
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(quote.quoteNumber || 'ORC-2026', pageWidth - 14, 17, { align: 'right' });

        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225);
        doc.text(`Emissão: ${formatSafeDate(quote.createdAt)}`, pageWidth - 14, 23, { align: 'right' });

        // 2. Dados do Cliente e Informações da Proposta (Quadro)
        let currentY = 36;

        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('DADOS DO CLIENTE & PROPOSTA', 18, currentY + 5);

        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);

        // Linha 1
        doc.setFont('helvetica', 'bold');
        doc.text('Cliente: ', 18, currentY + 11);
        doc.setFont('helvetica', 'normal');
        doc.text(quote.customerName || 'Consumidor Balcão', 32, currentY + 11);

        doc.setFont('helvetica', 'bold');
        doc.text('CPF/CNPJ: ', 115, currentY + 11);
        doc.setFont('helvetica', 'normal');
        doc.text(quote.customerDocument || 'Não informado', 133, currentY + 11);

        // Linha 2
        doc.setFont('helvetica', 'bold');
        doc.text('WhatsApp: ', 18, currentY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text(quote.customerPhone || 'Não informado', 36, currentY + 17);

        doc.setFont('helvetica', 'bold');
        doc.text('Vendedor: ', 115, currentY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text(quote.sellerName || 'Balcão / Loja', 132, currentY + 17);

        // Linha 3
        doc.setFont('helvetica', 'bold');
        doc.text('Validade: ', 18, currentY + 23);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 83, 9); // Amber-700
        doc.text(`${formatSafeDate(quote.validUntil)} (${quote.validityDays || 10} dias)`, 34, currentY + 23);

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('Email: ', 115, currentY + 23);
        doc.setFont('helvetica', 'normal');
        doc.text(quote.customerEmail || 'Não informado', 126, currentY + 23);

        currentY += 31;

        // 3. Tabela de Itens
        const tableBody = (quote.items || []).map((item, idx) => {
            const codeStr = item.code ? `[${item.code}] ` : '';
            const specs: string[] = [];
            if (item.voltage && item.voltage !== 'Não se aplica') specs.push(`Voltagem: ${item.voltage}`);
            if (item.dimensionsSize) specs.push(`Dimensões: ${item.dimensionsSize}`);
            if (item.material) specs.push(`Material: ${item.material}`);
            
            const cleanItemName = sanitizeCustomerText(item.name);
            const deliveryNote = ((item as any).pickupOrLocal15kmOnly || (item as any).isSpecialDelivery) 
                ? ' [Retirada Ponto de Apoio / Raio 15km]' 
                : '';
            const desc = `${codeStr}${cleanItemName}${deliveryNote}${specs.length > 0 ? '\n(' + specs.join(' • ') + ')' : ''}`;
            const unitPrice = Number(item.price || 0);
            const itemTotal = unitPrice * Number(item.quantity || 1);

            return [
                String(idx + 1).padStart(2, '0'),
                desc,
                String(item.quantity || 1),
                `R$ ${unitPrice.toFixed(2)}`,
                `R$ ${itemTotal.toFixed(2)}`
            ];
        });

        autoTable(doc, {
            startY: currentY,
            head: [['#', 'DESCRIÇÃO DO PRODUTO / ESPECIFICAÇÃO', 'QTD', 'UNITÁRIO', 'TOTAL']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [30, 41, 59],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'left',
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 'auto' },
                2: { halign: 'center', cellWidth: 16 },
                3: { halign: 'right', cellWidth: 26 },
                4: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
            },
            styles: {
                fontSize: 8,
                cellPadding: 2.5,
                textColor: [30, 41, 59],
                lineColor: [226, 232, 240],
                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            margin: { left: 14, right: 14 },
        });

        const finalY = (doc as any).lastAutoTable.finalY || (currentY + 40);

        // 4. Bloco de Totais e Condições de Pagamento
        let summaryY = finalY + 5;

        // Se passar da página, adicionar página nova
        if (summaryY + 55 > pageHeight) {
            doc.addPage();
            summaryY = 20;
        }

        // Quadro de Condições (Esquerda)
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, summaryY, 105, 32, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('CONDIÇÕES DE PAGAMENTO & GARANTIA', 18, summaryY + 5);

        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        
        const paymentLines = doc.splitTextToSize(`Forma: ${quote.paymentTerms || 'À vista no PIX ou Cartão'}`, 97);
        doc.text(paymentLines, 18, summaryY + 11);

        if (quote.notes) {
            const noteLines = doc.splitTextToSize(`Obs: ${quote.notes}`, 97);
            doc.text(noteLines, 18, summaryY + 20);
        }

        // Quadro de Totais (Direita)
        const subtotal = Number(quote.subtotal || 0);
        const discountAmount = Number(quote.discountAmount || 0);
        const total = Number(quote.total || (subtotal - discountAmount));

        doc.setFillColor(254, 243, 199); // Amber-100
        doc.setDrawColor(245, 158, 11); // Amber-500
        doc.roundedRect(124, summaryY, pageWidth - 138, 32, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text('Subtotal dos Itens:', 128, summaryY + 7);
        doc.text(`R$ ${subtotal.toFixed(2)}`, pageWidth - 18, summaryY + 7, { align: 'right' });

        if (quote.discountPercent && quote.discountPercent > 0) {
            doc.setTextColor(185, 28, 28);
            doc.text(`Desconto (${quote.discountPercent}%):`, 128, summaryY + 13);
            doc.text(`- R$ ${discountAmount.toFixed(2)}`, pageWidth - 18, summaryY + 13, { align: 'right' });
        }

        doc.setDrawColor(217, 119, 6);
        doc.line(128, summaryY + 17, pageWidth - 18, summaryY + 17);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 53, 15); // Amber-900
        doc.text('TOTAL GERAL:', 128, summaryY + 25);
        doc.setFontSize(12);
        doc.text(`R$ ${total.toFixed(2)}`, pageWidth - 18, summaryY + 25, { align: 'right' });

        // 5. Linhas de Assinatura
        const signY = summaryY + 44;
        if (signY + 25 <= pageHeight) {
            doc.setDrawColor(148, 163, 184);
            doc.setLineDashPattern([1, 1], 0);
            
            // Assinatura Loja
            doc.line(25, signY + 10, 85, signY + 10);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(71, 85, 105);
            doc.text(quote.sellerName || 'Ponto Chave do Lar', 55, signY + 14, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.text('Atendimento / Vendas', 55, signY + 17, { align: 'center' });

            // Assinatura Cliente
            doc.line(115, signY + 10, 175, signY + 10);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.text(quote.customerName || 'Cliente', 145, signY + 14, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.text('De Acordo / Aceite da Proposta', 145, signY + 17, { align: 'center' });
        }

        // Rodapé com data/hora de geração
        doc.setLineDashPattern([], 0);
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Documento emitido eletronicamente via Ponto Chave do Lar em ${new Date().toLocaleString('pt-BR')}.`, 14, pageHeight - 5);

        // Salvar e Baixar o arquivo
        const fileName = `Orcamento_${quote.quoteNumber || 'ORC'}_${(quote.customerName || 'Cliente').replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
        return true;
    } catch (error) {
        console.error('Erro ao gerar PDF do orçamento:', error);
        throw error;
    }
}

export function generateWhatsAppQuoteMessage(quote: QuoteRecord): string {
    const lines: string[] = [];
    lines.push(`*PONTO CHAVE DO LAR - Proposta Comercial*`);
    lines.push(`📋 *Protocolo:* ${quote.quoteNumber}`);
    lines.push(`📅 *Emissão:* ${formatSafeDate(quote.createdAt)}`);
    lines.push(`⏳ *Validade:* até ${formatSafeDate(quote.validUntil)} (${quote.validityDays || 10} dias)`);
    lines.push(`👤 *Cliente:* ${quote.customerName}`);
    lines.push(``);
    lines.push(`🛒 *ITENS DO ORÇAMENTO:*`);
    
    (quote.items || []).forEach((item, idx) => {
        const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
        const cleanName = sanitizeCustomerText(item.name);
        const pickupNote = ((item as any).pickupOrLocal15kmOnly || (item as any).isSpecialDelivery)
            ? ' _(Retirada Ponto de Apoio ou raio até 15km)_'
            : '';
        lines.push(`${idx + 1}. *${cleanName}*${pickupNote}`);
        lines.push(`   ${item.quantity}x R$ ${Number(item.price || 0).toFixed(2)} = *R$ ${itemTotal.toFixed(2)}*`);
    });

    lines.push(``);
    lines.push(`💰 *Subtotal:* R$ ${Number(quote.subtotal || 0).toFixed(2)}`);
    if (quote.discountPercent && quote.discountPercent > 0) {
        lines.push(`🏷️ *Desconto (${quote.discountPercent}%):* - R$ ${Number(quote.discountAmount || 0).toFixed(2)}`);
    }
    lines.push(`⭐ *TOTAL GERAL: R$ ${Number(quote.total || 0).toFixed(2)}*`);
    lines.push(``);
    lines.push(`💳 *Condições de Pagamento:* ${quote.paymentTerms || 'À vista no PIX ou Cartão'}`);
    if (quote.notes) {
        lines.push(`📝 *Observações:* ${quote.notes}`);
    }
    lines.push(``);
    lines.push(`Para confirmar seu pedido ou tirar dúvidas, basta responder esta mensagem!`);

    return encodeURIComponent(lines.join('\n'));
}
