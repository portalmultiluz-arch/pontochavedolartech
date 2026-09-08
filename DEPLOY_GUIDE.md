# Guia Completo de Deploy • GitHub & Cloudflare Pages
**Ponto Chave do Lar — Soluções em Design & Engenharia Elétrica**

Este guia contém as instruções passo a passo para versionar o projeto no **GitHub** e realizar o deploy contínuo (CI/CD) ou manual no **Cloudflare Pages**.

---

## 📁 Arquivos de Deploy Inclusos no Projeto

| Arquivo | Função / Propósito |
| :--- | :--- |
| `.github/workflows/deploy.yml` | Pipeline de CI/CD automático do GitHub Actions para teste, build e deploy no Cloudflare |
| `wrangler.toml` | Configuração oficial do Cloudflare Pages / Workers |
| `public/_headers` | Políticas de segurança HTTP (CSP, HSTS, X-Frame-Options) e Cache Control imutável |
| `public/_redirects` | Redirecionamento SPA (`/* /index.html 200`) para evitar erro 404 em rotas |
| `public/_routes.json` | Regras de roteamento de Edge Functions e assets estáticos no Cloudflare Pages |
| `public/robots.txt` | Diretivas de indexação para buscadores (Googlebot, Bingbot) |
| `public/sitemap.xml` | Mapa do site para otimização e SEO orgânico |

---

## 🚀 Método 1: Deploy Automático via GitHub + Cloudflare Dashboard (Recomendado)

### Passo 1: Inicializar e Subir o Código para o GitHub
No terminal da sua máquina local:

```bash
# 1. Inicializar o repositório git local (se ainda não inicializado)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Criar o primeiro commit
git commit -m "feat: Versão completa do Ponto Chave do Lar com Checkout, Carrefour Mirakl e SEO"

# 4. Definir a branch principal como main
git branch -M main

# 5. Conectar com o seu repositório no GitHub (substitua com a sua URL)
git remote add origin https://github.com/SEU_USUARIO/ponto-chave-do-lar.git

# 6. Enviar o código para o GitHub
git push -u origin main
```

---

### Passo 2: Conectar o Repositório no Cloudflare Pages
1. Acesse o painel do [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. No menu lateral esquerdo, vá em **Workers & Pages** ➔ **Create application** ➔ aba **Pages** ➔ clique em **Connect to Git**.
3. Selecione a sua conta do GitHub e autorize o repositório `ponto-chave-do-lar`.
4. Defina as configurações de compilação:
   - **Project Name:** `ponto-chave-do-lar`
   - **Production Branch:** `main`
   - **Framework Preset:** `Vite` (ou `None`)
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
   - **Root Directory:** `/` (deixe em branco)
   - **Node.js Version:** `20` (em Environment Variables, adicione `NODE_VERSION` = `20`)
5. Clique em **Save and Deploy**.

Em menos de 1 minuto seu site estará online em `https://ponto-chave-do-lar.pages.dev` com certificado SSL automático e CDN Global.

---

## ⚙️ Método 2: Deploy Automatizado via GitHub Actions (CI/CD)

Caso queira que o próprio GitHub compile e envie a build para o Cloudflare via token:

1. No Cloudflare, gere um **API Token** em: *My Profile ➔ API Tokens ➔ Create Token ➔ Cloudflare Pages Edit*.
2. Copie seu **Account ID** (encontrado na URL ou na página inicial do Cloudflare).
3. No seu repositório GitHub:
   - Vá em **Settings** ➔ **Secrets and variables** ➔ **Actions**.
   - Adicione os seguintes Secrets:
     - `CLOUDFLARE_API_TOKEN`: *(Seu token de API do Cloudflare)*
     - `CLOUDFLARE_ACCOUNT_ID`: *(Seu ID de conta do Cloudflare)*
4. A cada novo `git push origin main`, o fluxo `.github/workflows/deploy.yml` executará a checagem de tipos (`npm run lint`), compilará a aplicação (`npm run build`) e publicará automaticamente no Cloudflare Pages.

---

## 💻 Método 3: Deploy Manual via Linha de Comando (Wrangler CLI)

Para publicar diretamente do terminal:

```bash
# 1. Instalar as dependências e compilar
npm install
npm run build

# 2. Publicar com o Wrangler
npx wrangler pages deploy dist --project-name=ponto-chave-do-lar
```

---

## 🔒 Domínio Personalizado & Certificado SSL

Para apontar seu domínio próprio (ex: `pontochavedolar.com.br`):
1. No Cloudflare Pages, acesse o projeto `ponto-chave-do-lar`.
2. Vá na aba **Custom domains** e clique em **Set up a custom domain**.
3. Digite seu domínio (ex: `pontochavedolar.com.br` ou `loja.pontochavedolar.com.br`).
4. O Cloudflare configurará o DNS e emitirá o certificado SSL HTTPS gratuitamente.

---

## 📦 Verificação Pós-Deploy

Após o deploy, verifique:
- **Acesso à Loja:** Navegação nos produtos, categorias e serviços de parceiros.
- **Checkout:** Teste de geração de Pix dinâmico, Boleto e simulação de cartão.
- **Painel Administrativo:** Acesse `/` e clique no ícone de engrenagem para gerenciar estoque, vendas, consultoria técnica e exportar feeds do Carrefour Mirakl.
