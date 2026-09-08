# Manual Oficial: Engenharia de Interface, Responsividade & Compatibilidade Multiplataforma (DOC-RESP-001)

**Ponto Chave do Lar — Soluções em Design & Engenharia Elétrica**  
**Código do Documento:** `DOC-RESP-001`  
**Revisão:** 2.0  
**Data de Homologação:** Setembro/2026  
**Status:** Vigência Ativa & Homologação Universal  

---

## 📋 1. Visão Geral e Filosofia de Design (Mobile-First)

A plataforma **Ponto Chave do Lar** foi projetada e construída seguindo a metodologia **Mobile-First Responsiva**, garantindo fluidez e usabilidade de ponta a ponta sem a necessidade de aplicativos separados ou recarregamentos pesados de página (SPA).

A interface responde em tempo real a variações de densidade de pixels (DPI), orientação de tela (Retrato / Paisagem), métodos de entrada (Toque capacitivo, Caneta Stylus, Mouse e Teclado físico) e conexões de rede móveis ou fibra.

---

## 📱 2. Estruturação e Comportamento por Dispositivo

### 2.1 Smartphones & Celulares (320px a 640px — `sm`)
* **Público-alvo / Caso de Uso:** Clientes finais realizando compras rápidas no dia a dia, consulta de preços por QR Code e técnicos no canteiro de obras.
* **Layout da Vitrine:** Grid de 1 a 2 colunas com cartões de produtos compactos e fotos renderizadas em formato leve de alta resolução.
* **Alvos de Toque (Touch Targets):** Todos os botões primários possuem altura mínima de **44px a 48px** e espaçamento seguro contra toques acidentais pelo polegar.
* **Barra de Navegação e Abas:**
  * Header compacto com busca expansível.
  * Carrossel horizontal de categorias com toque capacitivo fluido (*momentum scrolling*).
  * Menu lateral retrátil (gaveta deslizante) com transições suaves.
* **Checkout & Pagamento:** Formulários verticais de uma coluna com teclados específicos (`type="tel"` para CEP/Telefone, `type="number"` para cartão/código).

### 2.2 Tablets & iPads (641px a 1024px — `md` / `lg`)
* **Público-alvo / Caso de Uso:** Vendedores no balcão da loja física, arquitetos e engenheiros demonstrando projetos e laudos técnicos aos clientes.
* **Layout da Vitrine:** Grid adaptativo de 2 a 3 colunas balanceadas.
* **Ficha Detalhada do Produto:** Divisão em duas colunas (carrossel de imagens e zoom à esquerda; especificações elétricas, botões de ação e kits à direita).
* **Frente de Caixa (PDV):** Interface híbrida permitindo visualizar o catálogo de busca ao centro e o cupom fiscal/carrinho em andamento na lateral.
* **Orientação de Tela:** Transição instantânea sem quebra de elementos entre orientação vertical (Retrato) e horizontal (Paisagem).

### 2.3 Computadores, Notebooks & Monitores Ultrawide / 4K (≥ 1025px — `xl` / `2xl`)
* **Público-alvo / Caso de Uso:** Gerentes, operadores de estoque, financeiro, emissão de relatórios fiscais e gestão de marketplace.
* **Layout da Vitrine:** Grid panorâmico de 3 a 4 colunas com microinterações de *hover*, badges informativas e ampliação de imagem.
* **Ergonomia Visual:** Aplicação de contêiner centralizado (`max-w-7xl mx-auto`) para evitar fadiga ocular e estiramento excessivo em monitores *Ultrawide* ou 4K.
* **Painel Administrativo:**
  * Tabelas densas de controle de estoque com colunas para NCM, CEST, CFOP, Preço de Custo, Preço de Venda e Margem.
  * Ações em lote e atalhos rápidos de teclado (`Enter` para buscar, `Esc` para fechar modais).

---

## 🌐 3. Matriz de Compatibilidade com Sistemas Operacionais e Navegadores

| Sistema Operacional | Plataformas Típicas | Navegadores Homologados | Recursos Integrados |
| :--- | :--- | :--- | :--- |
| **Android (Google)** | Smartphones & Tablets (Android 8.0 até Android 15+) | Google Chrome, Samsung Internet, Edge, Firefox, Opera Mobile | PWA ("Instalar App"), teclado numérico automático, integração nativa com app WhatsApp |
| **iOS & iPadOS (Apple)** | iPhone e iPad (iOS 14 até iOS 18+) | Safari Mobile (WebKit), Google Chrome iOS, Edge iOS | Safe Area Insets (Notch / Dynamic Island), rolagem elástica iOS, PWA "Adicionar à Tela de Início" |
| **Windows (Microsoft)** | Notebooks e Desktops (Windows 10 e Windows 11) | Chrome, Microsoft Edge, Opera, Brave, Firefox | Impressão direta de cupons/boletos, exportação de relatórios em CSV/XML, aceleração de GPU |
| **macOS (Apple)** | MacBook, Mac mini, iMac, Mac Studio | Safari Desktop, Chrome, Edge, Firefox, Arc | Renderização de alta fidelidade para telas Retina, atalhos de teclado (Cmd+C/Cmd+V), trackpad multitouch |
| **Linux (Open Source)** | Desktops e Terminais de Caixa (Ubuntu, Debian, Fedora, Mint) | Chromium, Firefox, Brave | Suporte completo às rotinas administrativas, leitor de código de barras USB/Serial e PDV |

---

## ⚡ 4. Integração Inteligente com WhatsApp por Plataforma

O sistema detecta automaticamente o ambiente do usuário para direcionar a comunicação:
1. **Em Smartphones e Tablets:** Dispara diretamente o aplicativo nativo do WhatsApp via protocolo universal (`whatsapp://` / `api.whatsapp.com`), sem telas intermediárias.
2. **Em Computadores e Desktops:** Redireciona automaticamente para o **WhatsApp Web** (`web.whatsapp.com`) em uma nova aba com a mensagem do produto, código SKU e valor já devidamente formatados.

---

## 📦 5. Especificações de Breakpoints do Sistema

A estilização utiliza o padrão moderno de tokens de viewport do Tailwind CSS:

* `sm` (≥ 640px): Smartphones em modo paisagem e celulares com telas grandes.
* `md` (≥ 768px): Tablets padrão em orientação retrato (ex: iPad 9.7" / 10.2").
* `lg` (≥ 1024px): Tablets em modo paisagem e notebooks compactos (11" a 13").
* `xl` (≥ 1280px): Notebooks corporativos e monitores Full HD padrão.
* `2xl` (≥ 1536px): Monitores de alta resolução, estações de trabalho e telas ultrawide.

---

## 🛡️ 6. Acessibilidade e Conformidade (WCAG AA)
- Relação de contraste mínima de 4.5:1 para textos em relação ao fundo.
- Suporte a leitor de telas com tags semânticas (`header`, `nav`, `main`, `section`, `article`, `footer`).
- Foco visível (`focus-visible`) para navegação por teclado sem mouse.

---

## 🎁 7. Arquitetura de Abas da Vitrine, Sugestão de PRESENTES & Alinhamento Sem Deslocamento

### 7.1 Correção de Alinhamento e Estabilidade Visual
Anteriormente, o uso de `scale-105` e larguras dinâmicas causava desalinhamento visual e trepidação (*layout shift*) na barra de filtros. A arquitetura foi reestruturada para garantir simetria óptica matemática:
1. **Grid Estrutural Simétrico:** Utilização de `grid grid-cols-2 sm:grid-cols-4 gap-1.5` em container centralizado (`max-w-4xl mx-auto`).
2. **Altura Padronizada:** Todos os 4 botões mestres possuem altura exata de `h-11` (44px, padrão ótimo para toque móvel) e preenchimento vertical/horizontal uniforme.
3. **Comportamento Responsivo:**
   * **Em Smartphones:** Divide-se em 2 linhas de 2 colunas com proporções rigorosamente idênticas.
   * **Em Tablets e Computadores:** Alinha-se perfeitamente em 1 linha de 4 colunas centralizadas.

### 7.2 Módulo de Sugestão de PRESENTES & Datas Comemorativas
A vitrine conta com gatilho dedicado para **PRESENTES** voltado a compras afetivas e datas sazonais:
- **Atalhos no Topo:** Sugestão interativa na capa (Hero) com acesso direto via clique e âncora no cabeçalho.
- **Filtros por Datas Comemorativas:**
  * 🌟 **Todas as Datas:** Exibe kits montados, churrasco, faqueiros e iluminação decorativa.
  * 👨 **Dia dos Pais & Profissionais:** Ferramentas manuais, maletas Foxlux/Famastil, kits eletricista e pedreiro.
  * 👩 **Dia das Mães & Casa:** Faqueiros Tramontina Laguna/Polywood, utilidades, iluminação aconchegante e jardim.
  * 🏡 **Chá de Casa Nova & Reforma:** Kits essenciais de instalação, duchas e iluminação completa.
  * 🎄 **Natal & Fim de Ano:** Sugestões completas para amigos secretos e celebrações familiares.

