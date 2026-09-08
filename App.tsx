import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { Footer } from './components/Footer';
import { GenerateDescriptionModal } from './components/GenerateDescriptionModal';
import { ProductDetailView } from './components/ProductDetailView';
import { CartSidebar } from './components/CartSidebar';
import { Notification } from './components/Notification';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LoginPage } from './components/LoginPage';
import { ModernAdminDashboard } from './components/admin/ModernAdminDashboard';
import { ServicesSection } from './components/ServicesSection';
import { PartnerDirectorySection } from './components/PartnerDirectorySection';
import { TechnicalConsultancyModal } from './components/TechnicalConsultancyModal';
import { TechnicalConsultancyBanner } from './components/TechnicalConsultancyBanner';
import { ExternalAppletModal } from './components/ExternalAppletModal';
import { fetchProducts, fetchDailyOffer, fetchPromoContent, subscribeToCollection, subscribeToDoc, createDocument, updateDocument } from './services/firebaseService';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { Product, DailyOffer, PromoContent, View, CheckoutForm, ConfirmedOrder, Service, HeroCoverConfig, PartnerProvider, PartnerMarketplaceSettings, StoreModulesConfig } from './types';
import { products as initialCatalogProducts } from './data/products';
import { INITIAL_PARTNER_PROVIDERS, DEFAULT_PARTNER_MARKETPLACE_SETTINGS } from './data/curatedPartners';
import { DEFAULT_STORE_MODULES_CONFIG } from './data/storeModulesConfig';
import { AboutUs } from './components/AboutUs';
import { ContactSection } from './components/ContactSection';
import { DailyOfferBanner } from './components/DailyOfferBanner';
import { ChatbotWidget } from './components/ChatbotWidget';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { useCart } from './contexts/CartContext';
import { isProductEligibleForStorefront } from './lib/productStatusHelper';
import { initAnalyticsTracking, trackViewProduct, trackPageView } from './lib/analyticsTracker';
import { injectProductSchema } from './lib/seoHelper';
import { generatePixPaymentData, generateBoletoPaymentData } from './lib/paymentHelper';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
    const [products, setProducts] = useState<Product[]>(initialCatalogProducts);
    const [services, setServices] = useState<Service[]>([]);
    const [dailyOffer, setDailyOffer] = useState<DailyOffer | null>(null);
    const [promoContent, setPromoContent] = useState<PromoContent[]>([]);
    const [heroConfig, setHeroConfig] = useState<HeroCoverConfig | null>(null);
    const [partners, setPartners] = useState<PartnerProvider[]>(INITIAL_PARTNER_PROVIDERS);
    const [partnerSettings, setPartnerSettings] = useState<PartnerMarketplaceSettings>(DEFAULT_PARTNER_MARKETPLACE_SETTINGS);
    const [modulesConfig, setModulesConfig] = useState<StoreModulesConfig>(DEFAULT_STORE_MODULES_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConsultancyOpen, setIsConsultancyOpen] = useState(false);
    const [isExternalAppletOpen, setIsExternalAppletOpen] = useState(false);
    const [consultancyPrefill, setConsultancyPrefill] = useState<{
        name?: string;
        email?: string;
        phone?: string;
        orderId?: string;
        orderValue?: number;
    }>({});
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [view, setView] = useState<View>('marketplace');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
    const [catalogCategory, setCatalogCategory] = useState<string>('PROMOÇÃO');
    const { clearCart, cartItems, totalPrice } = useCart();

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        });

        const loadInitialData = async () => {
            try {
                setError(null);
                const [offerData, promoData] = await Promise.all([
                    fetchDailyOffer(),
                    fetchPromoContent()
                ]);
                setDailyOffer(offerData);
                setPromoContent((promoData || []) as unknown as PromoContent[]);
            } catch (err) {
                console.error("Erro no carregamento de ofertas e destaques:", err);
            }
        };

        loadInitialData();

        const unsubProducts = subscribeToCollection('products', (data) => {
            if (data && (data as Product[]).length > 0) {
                setProducts(data as Product[]);
            } else {
                setProducts(initialCatalogProducts);
            }
            setIsLoading(false);
        }, 'name');

        const unsubServices = subscribeToCollection('services', (data) => {
            setServices(data as Service[]);
        }, 'name');

        const unsubHeroCover = subscribeToDoc('siteSettings', 'heroCover', (data) => {
            if (data) {
                setHeroConfig(data as HeroCoverConfig);
            }
        });

        const unsubPartners = subscribeToCollection('partner_providers', (data) => {
            if (data && data.length > 0) {
                setPartners(data as PartnerProvider[]);
            }
        }, 'name');

        const unsubPartnerSettings = subscribeToDoc('siteSettings', 'partnerMarketplace', (data) => {
            if (data) {
                setPartnerSettings(data as PartnerMarketplaceSettings);
            }
        });

        const unsubStoreModules = subscribeToDoc('siteSettings', 'storeModules', (data) => {
            if (data) {
                setModulesConfig(data as StoreModulesConfig);
            } else {
                setModulesConfig(DEFAULT_STORE_MODULES_CONFIG);
            }
        });

        const unsubMarketing = subscribeToDoc('site_marketing_security', 'current', (data) => {
            if (data) {
                initAnalyticsTracking({
                    googleAnalyticsId: data.googleAnalyticsId,
                    googleAdsTagId: data.googleAdsTagId,
                    metaPixelId: data.metaPixelId,
                    tiktokPixelId: data.tiktokPixelId,
                });
            }
        });

        return () => {
            unsubAuth();
            unsubProducts();
            unsubServices();
            unsubHeroCover();
            unsubPartners();
            unsubPartnerSettings();
            unsubStoreModules();
            unsubMarketing();
        };
    }, []);

    const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
    const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
    
    const handleOpenCart = useCallback(() => setIsCartOpen(true), []);
    const handleCloseCart = useCallback(() => setIsCartOpen(false), []);

    const handleOpenConsultancy = useCallback((fromOrder?: ConfirmedOrder) => {
        if (fromOrder) {
            setConsultancyPrefill({
                name: fromOrder.customerInfo.fullName,
                email: fromOrder.customerInfo.email,
                orderId: fromOrder.id,
                orderValue: fromOrder.total
            });
        } else {
            setConsultancyPrefill({
                orderValue: totalPrice > 0 ? totalPrice : 350
            });
        }
        setIsConsultancyOpen(true);
    }, [totalPrice]);

    const handleCloseConsultancy = useCallback(() => {
        setIsConsultancyOpen(false);
    }, []);

    const handleViewProduct = useCallback((product: Product) => {
        setSelectedProduct(product);
        trackViewProduct(product);
        injectProductSchema(product);
        window.scrollTo(0, 0);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedProduct(null);
        setView('marketplace');
    }, []);
    
    const handleNavigateToAdmin = () => {
        if (isAuthenticated || auth.currentUser) {
            setIsAuthenticated(true);
            setView('admin');
        } else {
            setView('login');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (e) {
            console.error("Erro ao sair:", e);
        }
        setIsAuthenticated(false);
        setView('marketplace');
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setView('admin');
    };
    
    const handleGoToCheckout = useCallback(() => {
        setIsCartOpen(false);
        setView('checkout');
        window.scrollTo(0, 0);
    }, []);
    
    const handlePlaceOrder = useCallback(async (formData: CheckoutForm, shippingCost: number) => {
        const orderId = `PCL-${Date.now().toString().slice(-6)}`;
        
        let discount = 0;
        let paymentDetails: any = null;

        if (formData.paymentMethod === 'pix') {
            discount = totalPrice * 0.05;
            paymentDetails = generatePixPaymentData(orderId, totalPrice - discount + shippingCost);
        } else if (formData.paymentMethod === 'boleto') {
            paymentDetails = generateBoletoPaymentData(orderId, totalPrice + shippingCost);
        } else {
            paymentDetails = {
                method: formData.paymentMethod,
                brand: formData.cardBrand,
                installments: formData.installments || 1,
                installmentValue: (totalPrice + shippingCost) / (formData.installments || 1),
                cardLast4: formData.cardNumber ? formData.cardNumber.replace(/\D/g, '').slice(-4) : '****',
                cardHolderName: formData.cardHolderName,
                cardCpf: formData.cardCpf
            };
        }

        const finalTotal = Math.max(0, totalPrice - discount + shippingCost);

        const newOrder: ConfirmedOrder = {
            id: orderId,
            customerInfo: formData,
            items: cartItems,
            subtotal: totalPrice,
            shipping: shippingCost,
            discount: discount > 0 ? discount : undefined,
            total: finalTotal,
            paymentDetails: paymentDetails,
            status: formData.paymentMethod === 'credit_card' ? 'paid' : 'pending_payment',
            createdAt: new Date().toISOString()
        };

        // Salvar pedido no Firestore e atualizar estoque
        try {
            await createDocument('orders', {
                orderId: newOrder.id,
                customerInfo: newOrder.customerInfo,
                items: newOrder.items,
                subtotal: newOrder.subtotal,
                shipping: newOrder.shipping,
                discount: newOrder.discount || 0,
                total: newOrder.total,
                paymentDetails: newOrder.paymentDetails,
                status: newOrder.status,
                createdAt: newOrder.createdAt
            });

            // Baixa de estoque dos produtos comprados
            for (const item of cartItems) {
                const currentProduct = products.find(p => p.id === item.id);
                const currentStock = currentProduct?.stock ?? item.stock ?? 10;
                const newStock = Math.max(0, currentStock - item.quantity);

                if (currentProduct?.id) {
                    await updateDocument('products', String(currentProduct.id), {
                        stock: newStock,
                        updatedAt: new Date().toISOString()
                    }).catch(e => console.warn("Erro ao atualizar estoque do produto:", e));
                }

                // Registrar movimentação no almoxarifado
                await createDocument('stock_movements', {
                    productId: item.id,
                    productName: item.name,
                    type: 'out_sale',
                    quantity: item.quantity,
                    previousStock: currentStock,
                    newStock: newStock,
                    orderId: newOrder.id,
                    reason: 'Venda Loja Virtual / Checkout',
                    createdAt: new Date().toISOString()
                }).catch(e => console.warn("Erro ao registrar movimentação de estoque:", e));
            }
        } catch (err) {
            console.error("Erro ao persistir pedido e baixa de estoque:", err);
        }

        setConfirmedOrder(newOrder);
        clearCart();
        setView('orderConfirmation');
        window.scrollTo(0, 0);
    }, [cartItems, totalPrice, products, clearCart]);

    const handleNavigate = useCallback((sectionId?: string) => {
        if (view !== 'marketplace' || selectedProduct) {
            setSelectedProduct(null);
            setView('marketplace');
        }

        let targetId = sectionId;
        if (sectionId === 'gifts' || sectionId === 'presentes') {
            setCatalogCategory('PRESENTES');
            targetId = 'products';
        } else if (sectionId === 'promocao' || sectionId === 'promo') {
            setCatalogCategory('PROMOÇÃO');
            targetId = 'products';
        } else if (sectionId === 'kits') {
            setCatalogCategory('KITS & COMBOS');
            targetId = 'products';
        } else if (sectionId === 'eletrico' || sectionId === 'material-eletrico') {
            setCatalogCategory('Material Elétrico');
            targetId = 'products';
        } else if (sectionId === 'hidraulico' || sectionId === 'material-hidraulico') {
            setCatalogCategory('Material Hidráulico');
            targetId = 'products';
        } else if (sectionId === 'ferramentas') {
            setCatalogCategory('Ferramentas');
            targetId = 'products';
        } else if (sectionId === 'iluminacao') {
            setCatalogCategory('Iluminação');
            targetId = 'products';
        } else if (sectionId === 'utilidades' || sectionId === 'ferragens' || sectionId === 'fixacao' || sectionId === 'utilidades-ferragens-fixacao') {
            setCatalogCategory('Utilidades, Ferragens e Fixação');
            targetId = 'products';
        } else if (sectionId === 'tintas' || sectionId === 'vernizes' || sectionId === 'acabamento' || sectionId === 'pintura' || sectionId === 'tintas-vernizes-acabamento') {
            setCatalogCategory('Tintas, Vernizes e Acabamento');
            targetId = 'products';
        } else if (sectionId === 'casa-jardim-agricola' || sectionId === 'casa-jardim' || sectionId === 'jardim' || sectionId === 'agricola' || sectionId === 'agrícola') {
            setCatalogCategory('Casa - Jardim - Agrícola');
            targetId = 'products';
        } else if (
            sectionId === 'telefonia' || 
            sectionId === 'informatica' || 
            sectionId === 'comunicacao' || 
            sectionId === 'seguranca-eletronica' || 
            sectionId === 'cftv' ||
            sectionId === 'telecom'
        ) {
            setCatalogCategory('Telefonia, Informática, Comunicação & Segurança');
            targetId = 'products';
        }
        
        setTimeout(() => {
            if (targetId) {
                document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 50);
    }, [view, selectedProduct]);

    const handleProductCreateFromAI = useCallback((newProductData: Omit<Product, 'id' | 'imageUrl' | 'gallery' | 'stock'>) => {
        handleCloseModal();
    }, [handleCloseModal]);
    
    const renderMarketplacePage = () => (
        <div className="bg-brand-light font-sans text-brand-dark min-h-screen flex flex-col">
            <Notification />
            <Header 
                onNavigate={handleNavigate} 
                onCartClick={handleOpenCart} 
                onOpenConsultancy={modulesConfig.consultancyEnabled ? () => handleOpenConsultancy() : undefined}
                onOpenExternalApplet={modulesConfig.appletEnabled ? () => setIsExternalAppletOpen(true) : undefined}
                showServicesLink={modulesConfig.servicesEnabled && modulesConfig.servicesHeaderLink}
                showPartnersLink={modulesConfig.partnersEnabled && modulesConfig.partnersHeaderLink && partnerSettings.isEnabled}
                showConsultancyButton={modulesConfig.consultancyEnabled && modulesConfig.consultancyHeaderButton}
                showAppletButton={modulesConfig.appletEnabled}
            />
            <main className="flex-grow">
                {renderMarketplace()}
            </main>
            <Footer onAdminClick={handleNavigateToAdmin} />
            <CartSidebar 
                isOpen={isCartOpen} 
                onClose={handleCloseCart} 
                onCheckout={handleGoToCheckout}
                onOpenConsultancy={modulesConfig.consultancyEnabled && modulesConfig.consultancyCartCta ? () => handleOpenConsultancy() : undefined} 
            />
            {!selectedProduct && modulesConfig.chatbotEnabled && <ChatbotWidget products={products.filter(isProductEligibleForStorefront)} />}
            {modulesConfig.consultancyEnabled && (
                <TechnicalConsultancyModal
                    isOpen={isConsultancyOpen}
                    onClose={handleCloseConsultancy}
                    availableProducts={products.filter(isProductEligibleForStorefront)}
                    initialOrderValue={consultancyPrefill.orderValue || 350}
                    initialOrderId={consultancyPrefill.orderId}
                    customerPreFill={{
                        name: consultancyPrefill.name,
                        email: consultancyPrefill.email,
                        phone: consultancyPrefill.phone
                    }}
                />
            )}
            {modulesConfig.appletEnabled && (
                <ExternalAppletModal
                    isOpen={isExternalAppletOpen}
                    onClose={() => setIsExternalAppletOpen(false)}
                />
            )}
        </div>
    );

    const renderMarketplace = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="flex items-center space-x-3 text-brand-primary">
                        <LoadingSpinner />
                        <span className="text-xl font-semibold">Carregando produtos...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 px-6 bg-red-50 rounded-lg shadow-md max-w-2xl mx-auto my-12">
                    <h3 className="text-2xl font-semibold text-red-700">Oops! Algo deu errado.</h3>
                    <p className="mt-2 text-red-600">{error}</p>
                </div>
            );
        }

        if (selectedProduct) {
            return (
                <ProductDetailView 
                    product={selectedProduct} 
                    onBack={handleBackToList}
                    showPartnerBanner={modulesConfig.partnersEnabled && modulesConfig.partnersProductDetail && partnerSettings.isEnabled} 
                />
            );
        }
        
        return (
            <>
                <Hero onNavigate={handleNavigate} heroConfig={heroConfig} />
                <AboutUs />
                {dailyOffer?.isActive && <DailyOfferBanner offer={dailyOffer} />}
                
                {modulesConfig.consultancyEnabled && modulesConfig.consultancyHomeBanner && (
                    <div className="container mx-auto px-6">
                        <TechnicalConsultancyBanner 
                            onOpenConsultancy={() => handleOpenConsultancy()}
                            minEligibleAmount={250}
                            currentAmount={totalPrice}
                        />
                    </div>
                )}

                <div id="products">
                    <ProductGrid 
                        products={products} 
                        promoContent={promoContent} 
                        onViewProduct={handleViewProduct}
                        activeCategory={catalogCategory}
                        onCategoryChange={setCatalogCategory}
                    />
                </div>

                {modulesConfig.servicesEnabled && <ServicesSection services={services} />}

                {modulesConfig.partnersEnabled && modulesConfig.partnersHomeSection && partnerSettings.isEnabled && (
                    <PartnerDirectorySection 
                        partners={partners} 
                        settings={partnerSettings} 
                    />
                )}
                <ContactSection />
            </>
        );
    };

    if (view === 'admin') {
        if (isAuthenticated) {
            return <ModernAdminDashboard onLogout={handleLogout} />;
        }
        return <LoginPage onLoginSuccess={handleLoginSuccess} onBackToStore={() => setView('marketplace')} />;
    }

    if (view === 'login') {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onBackToStore={() => setView('marketplace')} />;
    }

    if (view === 'checkout') {
        return (
            <div className="bg-brand-light font-sans text-brand-dark min-h-screen">
                <Header 
                    onNavigate={handleNavigate} 
                    onCartClick={handleOpenCart} 
                    onOpenConsultancy={modulesConfig.consultancyEnabled ? () => handleOpenConsultancy() : undefined}
                    showServicesLink={modulesConfig.servicesEnabled && modulesConfig.servicesHeaderLink}
                    showPartnersLink={modulesConfig.partnersEnabled && modulesConfig.partnersHeaderLink && partnerSettings.isEnabled}
                    showConsultancyButton={modulesConfig.consultancyEnabled && modulesConfig.consultancyHeaderButton}
                    showAppletButton={modulesConfig.appletEnabled}
                />
                <CheckoutPage onBackToMarketplace={handleBackToList} onPlaceOrder={handlePlaceOrder} />
                <Footer onAdminClick={handleNavigateToAdmin} />
                {modulesConfig.consultancyEnabled && (
                    <TechnicalConsultancyModal
                        isOpen={isConsultancyOpen}
                        onClose={handleCloseConsultancy}
                        availableProducts={products}
                        initialOrderValue={totalPrice}
                    />
                )}
            </div>
        );
    }

    if (view === 'orderConfirmation' && confirmedOrder) {
        return (
            <div className="bg-brand-light font-sans text-brand-dark min-h-screen">
                <Header 
                    onNavigate={handleNavigate} 
                    onCartClick={handleOpenCart} 
                    onOpenConsultancy={modulesConfig.consultancyEnabled ? () => handleOpenConsultancy() : undefined}
                    showServicesLink={modulesConfig.servicesEnabled && modulesConfig.servicesHeaderLink}
                    showPartnersLink={modulesConfig.partnersEnabled && modulesConfig.partnersHeaderLink && partnerSettings.isEnabled}
                    showConsultancyButton={modulesConfig.consultancyEnabled && modulesConfig.consultancyHeaderButton}
                    showAppletButton={modulesConfig.appletEnabled}
                />
                <OrderConfirmationPage 
                    order={confirmedOrder} 
                    onBackToMarketplace={handleBackToList}
                    onOpenConsultancy={modulesConfig.consultancyEnabled ? (order) => handleOpenConsultancy(order) : undefined} 
                />
                <Footer onAdminClick={handleNavigateToAdmin} />
                {modulesConfig.consultancyEnabled && (
                    <TechnicalConsultancyModal
                        isOpen={isConsultancyOpen}
                        onClose={handleCloseConsultancy}
                        availableProducts={products}
                        initialOrderValue={confirmedOrder.total}
                        initialOrderId={confirmedOrder.id}
                        customerPreFill={{
                            name: confirmedOrder.customerInfo.fullName,
                            email: confirmedOrder.customerInfo.email
                        }}
                    />
                )}
            </div>
        );
    }

    return renderMarketplacePage();
}

export default function AppWrapper() {
    return (
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}
