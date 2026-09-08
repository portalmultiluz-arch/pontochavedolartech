# Ponto Chave do Lar — Soluções em Design & Engenharia Elétrica

Sistema integrado de e-commerce, frente de caixa (PDV), laudos técnicos de engenharia com IA, gestão de almoxarifado, catálogo Mirakl para Carrefour e automação de marketing digital.

---

## 🌟 Principais Funcionalidades

### 1. Loja Virtual & Checkout Multi-Pagamento
- **PIX com 5% de Desconto:** Geração de QR Code dinâmico e código Pix Copia e Cola instantâneo.
- **Cartão de Crédito Multicarteira:** Detecção em tempo real de bandeiras (Visa, Mastercard, Elo, Hipercard, American Express, Diners Club) com parcelamento em até 12x.
- **Boleto Bancário:** Linha digitável Febraban de 47 dígitos e botão de impressão de boleto.
- **Preenchimento de Endereço Automático:** Busca síncrona de logradouro, bairro, cidade e UF via API pública do ViaCEP.
- **Baixa Automática de Estoque:** Dedução atômica de saldo e gravação de log auditável em `stock_movements`.
- **Página de Confirmação & Recibo:** Exibição completa de comprovante com botão de suporte via WhatsApp.

### 2. Painel Administrativo Moderno com Governança RBAC
- **4 Níveis de Menu:** Operação & Balcão, Estoque & Suprimentos, Comercial & Marketing, Controladoria & Governança.
- **Controle de Alçadas:** Ocultação segura de custos de aquisição para operadores e controle de limite de descontos.
- **Frente de Caixa (PDV):** Emissão rápida de cupons, fechamento diário e conversão de orçamentos.
- **Controle de RMA & Avarias:** Tratamento de devoluções, garantias com fornecedores e sucatas com impacto no DRE.
- **Banco de Mídias WebP:** Compressor inteligente de fotos com cópia de links para Mercado Livre, Shopee e Bling.

### 3. Inteligência Artificial Especialista (ABNT NBR 5410 & NBR 5101)
- Consultoria Técnica automatizada com Google Gemini para análise de carga elétrica, dimensionamento de cabos, disjuntores, fechaduras eletrônicas e iluminância (método dos lúmens).

### 4. Marketplace Carrefour (Portal Mirakl) & Feeds
- Diagnóstico em tempo real de conformidade de catálogo com validação de código de barras (EAN-13 / GTIN).
- Gerador e exportador de feeds padrão Mirakl em **CSV** e **XML** com 1 clique.

### 5. Marketing Digital, SEO & Pixels de Conversão
- Gerenciador de tags em tempo real: Google Tag Manager (GTM), Google Analytics 4 (GA4), Meta Pixel (Facebook / Instagram) e TikTok Pixel.
- Injeção dinâmica de metadados estruturados **Schema.org (JSON-LD)** para rich snippets de produtos no Google.
- Arquivos `robots.txt` e `sitemap.xml` para indexação otimizada.

---

## 🛠️ Tecnologias & Arquitetura

- **Frontend:** React 19, TypeScript 5.8, Tailwind CSS, Lucide Icons, Motion.
- **Banco de Dados:** Google Cloud Firestore (NoSQL em tempo real).
- **Inteligência Artificial:** Google Gemini (@google/genai).
- **Relatórios & PDF:** jsPDF e jsPDF-AutoTable.
- **Hospedagem & CDN:** Cloudflare Pages (Edge Global).
- **CI/CD:** GitHub Actions.

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Validar tipagem TypeScript
npm run lint

# 4. Compilar para produção
npm run build
```

---

## 🚢 Deploy no GitHub & Cloudflare Pages

Consulte o arquivo [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md) para o passo a passo detalhado de publicação no Cloudflare Pages e configuração do pipeline no GitHub Actions.

---

## 📖 Manuais Oficiais do Sistema

Os manuais completos estão disponíveis dentro do painel administrativo em **Governança ➔ Manuais POP & Doc Técnica** e na raiz do repositório:
1. **POP-PC-001 (Rev 2.0):** Manual de Procedimentos Operacionais Padrão dos Colaboradores.
2. **SYS-TECH-SPEC (Rev 2.0):** Especificação Técnica de Engenharia e Arquitetura de Nuvem.
3. **DOC-RESP-001 (Rev 2.0):** [`MANUAL_DISPOSITIVOS_E_COMPATIBILIDADE.md`](./MANUAL_DISPOSITIVOS_E_COMPATIBILIDADE.md) — Manual de Engenharia de Interface, Responsividade (Mobile, Tablet, Desktop) e Matriz de Compatibilidade Multiplataforma.
4. **Manual Técnico Exclusivo:** Regras e conformidade para importação de mercadorias no CNPJ.
