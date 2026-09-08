import React, { useState, useEffect } from 'react';
import type { Product, DailyOffer, PromoContent } from '../types';
import { ProductEditForm } from './ProductEditForm';

interface AdminDashboardProps {
    products: Product[];
    dailyOffer: DailyOffer | null;
    promoContent: PromoContent[];
    onAddProduct: (productData: Omit<Product, 'id'>) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: string | number) => void;
    onUpdateOffer: (offer: DailyOffer) => void;
    onUpdatePromoContent: (promoContent: PromoContent[]) => void;
    onLogout: () => void;
    onNavigateHome: () => void;
    onGenerateAIClick: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    products, 
    dailyOffer,
    promoContent,
    onAddProduct,
    onUpdateProduct, 
    onDeleteProduct, 
    onUpdateOffer,
    onUpdatePromoContent,
    onLogout,
    onNavigateHome,
    onGenerateAIClick
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [offerData, setOfferData] = useState<DailyOffer | null>(dailyOffer);

    useEffect(() => {
        setOfferData(dailyOffer);
    }, [dailyOffer]);

    const handleOpenFormForCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleOpenFormForEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
        if ('id' in productData) {
            onUpdateProduct(productData);
        } else {
            onAddProduct(productData);
        }
        handleCloseForm();
    };
    
    const handleDeleteProduct = (productId: string | number) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            onDeleteProduct(productId);
        }
    };

    const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!offerData) return;
        const { name, value, type, checked } = e.target;
        setOfferData({
            ...offerData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSaveOffer = () => {
        if (offerData) {
            onUpdateOffer(offerData);
            alert('Oferta do dia atualizada com sucesso!');
        }
    };

    // Promo Content Handlers (simplified for this example)
    const handleAddPromo = () => {
        const newPromo: PromoContent = {
            id: Date.now(),
            title: 'Nova Promoção',
            description: 'Descreva sua promoção aqui.',
            type: 'image',
            mediaUrl: 'https://picsum.photos/seed/newpromo/600/400',
            link: '#'
        };
        onUpdatePromoContent([...promoContent, newPromo]);
    };

    const handleDeletePromo = (promoId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este conteúdo promocional?')) {
            onUpdatePromoContent(promoContent.filter(p => p.id !== promoId));
        }
    };


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-serif text-brand-primary">Painel de Administração</h1>
                <div className="space-x-4">
                    <button onClick={onNavigateHome} className="bg-brand-secondary text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-brand-accent hover:text-white transition-all duration-300">Voltar ao Início</button>
                    <button onClick={onLogout} className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300">Sair</button>
                </div>
            </div>

            {/* Gerenciar Oferta do Dia */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-2xl font-semibold font-serif text-brand-dark mb-4">Gerenciar Oferta do Dia</h2>
                 {offerData && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <label htmlFor="isActive" className="font-medium">Ativar Banner de Oferta:</label>
                             <input type="checkbox" name="isActive" id="isActive" checked={offerData.isActive} onChange={handleOfferChange} className="h-5 w-5 rounded text-brand-primary focus:ring-brand-accent"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="title" placeholder="Título" value={offerData.title} onChange={handleOfferChange} className="w-full px-3 py-2 border rounded-md" />
                            <input type="text" name="buttonText" placeholder="Texto do Botão" value={offerData.buttonText} onChange={handleOfferChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <input type="text" name="description" placeholder="Descrição" value={offerData.description} onChange={handleOfferChange} className="w-full px-3 py-2 border rounded-md" />
                        <input type="url" name="imageUrl" placeholder="URL da Imagem de Fundo" value={offerData.imageUrl} onChange={handleOfferChange} className="w-full px-3 py-2 border rounded-md" />
                        <input type="url" name="buttonLink" placeholder="Link do Botão" value={offerData.buttonLink} onChange={handleOfferChange} className="w-full px-3 py-2 border rounded-md" />
                        <button onClick={handleSaveOffer} className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-green-700">Salvar Oferta</button>
                    </div>
                 )}
            </div>

            {/* Gerenciar Produtos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold font-serif text-brand-dark">Gerenciar Produtos</h2>
                    <div className="flex space-x-4">
                        <button onClick={handleOpenFormForCreate} className="bg-brand-primary text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-brand-dark transition-all duration-300">
                            + Incluir Novo Produto
                        </button>
                        <button onClick={onGenerateAIClick} className="flex items-center space-x-2 bg-brand-accent text-brand-dark font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300">
                            <span>✨</span>
                            <span>Criar com IA</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        {/* Table head and body for products */}
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Produto</th>
                                <th scope="col" className="px-6 py-3">Preço</th>
                                <th scope="col" className="px-6 py-3">Estoque</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center space-x-3">
                                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                        <span>{product.name}</span>
                                    </th>
                                    <td className="px-6 py-4">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleOpenFormForEdit(product)} className="font-medium text-blue-600 hover:underline">Alterar</button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gerenciar Conteúdo Promocional */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold font-serif text-brand-dark">Gerenciar Conteúdo Promocional</h2>
                    <button onClick={handleAddPromo} className="bg-brand-primary text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-brand-dark">
                        + Adicionar Card
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Título</th>
                                <th scope="col" className="px-6 py-3">Tipo</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoContent.map((promo) => (
                                <tr key={promo.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{promo.title}</td>
                                    <td className="px-6 py-4 capitalize">{promo.type}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDeletePromo(promo.id)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isFormOpen && (
                <ProductEditForm
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSave={handleSaveProduct}
                    productToEdit={editingProduct}
                />
            )}
        </div>
    );
};
