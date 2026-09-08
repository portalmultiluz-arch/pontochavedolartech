import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProductEditFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id'> | Product) => void;
    productToEdit: Product | null;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        videoUrl: '',
        gallery: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                description: productToEdit.description,
                price: productToEdit.price.toString(),
                stock: productToEdit.stock.toString(),
                imageUrl: productToEdit.imageUrl,
                videoUrl: productToEdit.videoUrl || '',
                gallery: (productToEdit.gallery || []).join(', ')
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                imageUrl: '',
                videoUrl: '',
                gallery: ''
            });
        }
    }, [productToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const price = parseFloat(formData.price);
        const stock = parseInt(formData.stock, 10);

        if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
            setError('Preço e estoque devem ser números positivos.');
            return;
        }

        const galleryArray = formData.gallery.split(',').map(url => url.trim()).filter(url => url);

        const productData = {
            name: formData.name,
            description: formData.description,
            price: price,
            stock: stock,
            imageUrl: formData.imageUrl,
            videoUrl: formData.videoUrl,
            gallery: galleryArray,
        };
        
        if (productToEdit) {
            onSave({ ...productData, id: productToEdit.id });
        } else {
            onSave(productData);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-serif text-brand-primary">
                        {productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert"><p>{error}</p></div>}
                
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent" />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                            <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem Principal</label>
                        <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent" />
                    </div>
                    <div>
                        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">Link de Vídeo (YouTube / Showcase)</label>
                        <input type="url" name="videoUrl" id="videoUrl" placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..." value={formData.videoUrl} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent" />
                    </div>
                     <div>
                        <label htmlFor="gallery" className="block text-sm font-medium text-gray-700 mb-1">URLs da Galeria (separadas por vírgula)</label>
                        <input type="text" name="gallery" id="gallery" value={formData.gallery} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent" />
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center bg-brand-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400"
                        >
                            {isLoading ? <LoadingSpinner /> : (productToEdit ? 'Salvar Alterações' : 'Criar Produto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};