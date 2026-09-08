import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShoppingCart, 
    Download, 
    Upload, 
    ExternalLink, 
    CheckCircle2, 
    AlertTriangle, 
    Copy, 
    Check, 
    Layers, 
    RefreshCw, 
    Sparkles, 
    FileSpreadsheet, 
    Code, 
    Globe, 
    GitBranch, 
    Cloud, 
    ShieldCheck,
    Search,
    ArrowRight
} from 'lucide-react';
import { Product } from '../../types';
import { subscribeToCollection } from '../../services/firebaseService';
import { buildCarrefourCatalog, exportCarrefourCSV, exportCarrefourXML, CarrefourProductRow } from '../../lib/carrefourFeedHelper';

export const CarrefourMarketplaceManager: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'missing_ean'>('all');
    const [copied, setCopied] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [activeTab, setActiveTab] = useState<'carrefour' | 'cloudflare' | 'github'>('carrefour');

    useEffect(() => {
        const unsubscribe = subscribeToCollection('products', (data) => {
            setProducts(data as Product[]);
        }, 'name');
        return () => unsubscribe();
    }, []);

    const catalogRows: CarrefourProductRow[] = useMemo(() => {
        return buildCarrefourCatalog(products);
    }, [products]);

    const stats = useMemo(() => {
        const total = catalogRows.length;
        const ready = catalogRows.filter(r => r.status === 'ready').length;
        const withStock = catalogRows.filter(r => r.stock > 0).length;
        const missingEan = catalogRows.filter(r => r.status === 'missing_ean').length;
        return { total, ready, withStock, missingEan };
    }, [catalogRows]);

    const filteredRows = useMemo(() => {
        return catalogRows.filter(row => {
            const matchesSearch = row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.ean.includes(searchTerm);

            if (filterStatus === 'ready') return matchesSearch && row.status === 'ready';
            if (filterStatus === 'missing_ean') return matchesSearch && row.status === 'missing_ean';
            return matchesSearch;
        });
    }, [catalogRows, searchTerm, filterStatus]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2500);
    };

    const handleDownloadCSV = () => {
        setIsExporting(true);
        try {
            const csvData = exportCarrefourCSV(catalogRows);
            const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carrefour_catalogo_ponto_chave_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadXML = () => {
        setIsExporting(true);
        try {
            const xmlData = exportCarrefourXML(catalogRows);
            const blob = new Blob([xmlData], { type: 'application/xml;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carrefour_feed_mirakl_${new Date().toISOString().split('T')[0]}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    const liveFeedUrl = 'https://pontochavedolar.com.br/api/feeds/carrefour.xml';

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
                        <ShoppingCart className="text-blue-600 h-8 w-8" />
                        Hub de Integrações: Carrefour, Cloudflare & GitHub
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Sincronização de catálogo para marketplaces, infraestrutura de borda Cloudflare e repositório GitHub.
                    </p>
                </div>

                {/* Tabs de Navegação */}
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                    <button
                        onClick={() => setActiveTab('carrefour')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'carrefour' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <ShoppingCart size={16} />
                        Carrefour Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab('cloudflare')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'cloudflare' 
                                ? 'bg-white text-amber-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Cloud size={16} />
                        Cloudflare Deploy
                    </button>
                    <button
                        onClick={() => setActiveTab('github')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'github' 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <GitBranch size={16} />
                        GitHub CI/CD
                    </button>
                </div>
            </div>

            {/* CONTEÚDO TAB 1: CARREFOUR */}
            {activeTab === 'carrefour' && (
                <div className="space-y-8">
                    {/* Cards de Métricas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                <Layers size={24} />
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block tracking-wider">Total Catálogo</span>
                                <span className="text-2xl font-bold text-gray-900">{stats.total} itens</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block tracking-wider">Aptos Carrefour</span>
                                <span className="text-2xl font-bold text-emerald-600">{stats.ready} itens</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block tracking-wider">Pendentes de EAN</span>
                                <span className="text-2xl font-bold text-amber-600">{stats.missingEan} itens</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                <ShoppingCart size={24} />
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block tracking-wider">Com Estoque</span>
                                <span className="text-2xl font-bold text-purple-600">{stats.withStock} itens</span>
                            </div>
                        </div>
                    </div>

                    {/* Ações de Exportação e Feed */}
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200 mb-3">
                                    <Sparkles size={14} /> Padrão Carrefour Brasil (Mirakl Connect)
                                </div>
                                <h2 className="text-2xl font-bold font-serif mb-2">Exportar e Sincronizar Catálogo</h2>
                                <p className="text-blue-200 text-sm leading-relaxed">
                                    Gere a planilha oficial CSV ou o Feed XML pronto para upload no painel do Seller Center do Carrefour ou integração via Hubs (AnyMarket, Plugg.to, Tiny, Bling).
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={handleDownloadCSV}
                                    disabled={isExporting}
                                    className="px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                                >
                                    <FileSpreadsheet size={16} />
                                    <span>Baixar Planilha CSV</span>
                                </button>
                                <button
                                    onClick={handleDownloadXML}
                                    disabled={isExporting}
                                    className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                                >
                                    <Code size={16} />
                                    <span>Baixar XML Feed</span>
                                </button>
                            </div>
                        </div>

                        {/* URL do Feed Dinâmico */}
                        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-xs text-blue-200">
                                <Globe size={16} />
                                <span>URL de Sincronização Automática (Feed Mirakl):</span>
                                <code className="bg-black/30 px-3 py-1 rounded-lg text-emerald-300 font-mono text-xs">
                                    {liveFeedUrl}
                                </code>
                            </div>
                            <button
                                onClick={() => handleCopy(liveFeedUrl, 'feedUrl')}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                            >
                                {copied === 'feedUrl' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                <span>{copied === 'feedUrl' ? 'Copiado!' : 'Copiar Link'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabela de Diagnóstico de Produtos para o Carrefour */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Diagnóstico de Catálogo Carrefour</h3>
                                <p className="text-gray-400 text-xs">Verifique os itens que cumprem os requisitos de publicação no Carrefour.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome, SKU ou EAN..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                    />
                                </div>

                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
                                >
                                    <option value="all">Todos ({catalogRows.length})</option>
                                    <option value="ready">Aptos para Publicação ({stats.ready})</option>
                                    <option value="missing_ean">Sem EAN/GTIN ({stats.missingEan})</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-500 font-bold sticky top-0 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">SKU / Imagem</th>
                                        <th className="p-4">Título no Carrefour</th>
                                        <th className="p-4">EAN / Código</th>
                                        <th className="p-4">Categoria Carrefour</th>
                                        <th className="p-4">Preço</th>
                                        <th className="p-4">Estoque</th>
                                        <th className="p-4">Status Mirakl</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredRows.slice(0, 100).map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4 font-mono font-bold text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <img src={row.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                                                    <span>{row.sku}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                <p className="font-bold text-gray-900 truncate">{row.title}</p>
                                                <span className="text-[10px] text-gray-400">{row.brand}</span>
                                            </td>
                                            <td className="p-4 font-mono text-gray-600">
                                                {row.ean || <span className="text-amber-500 font-semibold">Sem EAN</span>}
                                            </td>
                                            <td className="p-4 text-gray-500 text-[11px] max-w-[200px] truncate">
                                                {row.category}
                                            </td>
                                            <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.price)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                                    row.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {row.stock} un
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {row.status === 'ready' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                                        <CheckCircle2 size={14} /> Apto
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                                                        <AlertTriangle size={14} /> EAN Pendente
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTEÚDO TAB 2: CLOUDFLARE */}
            {activeTab === 'cloudflare' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Cloud size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900">Guia de Instalação e Deploy no Cloudflare Pages</h2>
                                <p className="text-gray-500 text-sm">Hospedagem global de altíssima velocidade com SSL automático, proteção WAF e CDN Edge.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200/60">
                                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">1</span>
                                    Configuração de Build
                                </h3>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <p><strong>Build Command:</strong> <code className="bg-white px-2 py-0.5 rounded border border-gray-200">npm run build</code></p>
                                    <p><strong>Build Output:</strong> <code className="bg-white px-2 py-0.5 rounded border border-gray-200">dist</code></p>
                                    <p><strong>Node Version:</strong> <code className="bg-white px-2 py-0.5 rounded border border-gray-200">20.x</code></p>
                                </div>
                            </div>

                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200/60">
                                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                                    Headers de Segurança
                                </h3>
                                <p className="text-xs text-gray-600">
                                    O arquivo <code className="bg-white px-1.5 py-0.5 rounded border">public/_headers</code> já está configurado com HSTS, CSP, X-Frame-Options e cache imutável de assets estáticos.
                                </p>
                            </div>

                            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/60">
                                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                                    Roteamento SPA
                                </h3>
                                <p className="text-xs text-gray-600">
                                    O arquivo <code className="bg-white px-1.5 py-0.5 rounded border">public/_routes.json</code> e o fallback para <code className="bg-white px-1.5 py-0.5 rounded border">index.html</code> garantem a navegação fluida em rotas dinâmicas.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <span className="text-slate-400 font-bold">wrangler.toml (Cloudflare Configuration)</span>
                                <button 
                                    onClick={() => handleCopy(`name = "ponto-chave-do-lar"
compatibility_date = "2026-09-01"

[site]
bucket = "./dist"`, 'wrangler')}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300"
                                >
                                    {copied === 'wrangler' ? 'Copiado!' : 'Copiar'}
                                </button>
                            </div>
                            <pre className="text-emerald-400 overflow-x-auto">
{`name = "ponto-chave-do-lar"
compatibility_date = "2026-09-01"

[site]
bucket = "./dist"

[vars]
NODE_ENV = "production"`}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTEÚDO TAB 3: GITHUB */}
            {activeTab === 'github' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
                                <GitBranch size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900">Integração com GitHub & CI/CD Automatizado</h2>
                                <p className="text-gray-500 text-sm">Controle de versão, pipeline de integração contínua e deploy automático a cada commit na branch main.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-gray-900 text-sm mb-3">Comandos Rápidos para Conectar seu Repositório</h3>
                                <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs space-y-2 overflow-x-auto">
                                    <p>git init</p>
                                    <p>git add .</p>
                                    <p>git commit -m "feat: lancamento completo ponto chave do lar e integracoes"</p>
                                    <p>git branch -M main</p>
                                    <p>git remote add origin https://github.com/SEU_USUARIO/ponto-chave-do-lar.git</p>
                                    <p>git push -u origin main</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <span className="text-slate-400 font-bold">.github/workflows/deploy.yml (GitHub Action)</span>
                                </div>
                                <pre className="text-blue-300 overflow-x-auto">
{`name: Deploy Ponto Chave do Lar
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint and Typecheck
        run: npm run lint
      - name: Build Application
        run: npm run build`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
