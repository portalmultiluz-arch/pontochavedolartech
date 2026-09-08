import React from 'react';
import { IconLogo } from './IconLogo';
import { CartIcon } from './CartIcon';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
    onNavigate: (sectionId?: string) => void;
    onCartClick: () => void;
    onOpenConsultancy?: () => void;
    onOpenExternalApplet?: () => void;
    showServicesLink?: boolean;
    showPartnersLink?: boolean;
    showConsultancyButton?: boolean;
    showAppletButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    onNavigate, 
    onCartClick, 
    onOpenConsultancy, 
    onOpenExternalApplet,
    showServicesLink = false,
    showPartnersLink = false,
    showConsultancyButton = false,
    showAppletButton = false
}) => {
    return (
        <header className="bg-brand-light/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => onNavigate()} className="flex items-center space-x-3 cursor-pointer">
                    <IconLogo className="h-8 w-8 text-brand-primary" />
                    <span className="text-2xl font-bold font-serif text-brand-primary">Ponto Chave do Lar</span>
                </button>
                <div className="flex items-center space-x-6">
                    <nav className="hidden lg:flex items-center space-x-7">
                        <a href="#top" onClick={(e) => { e.preventDefault(); onNavigate(); }} className="text-brand-dark hover:text-brand-accent transition-colors duration-300 font-medium">Início</a>
                        <a href="#products" onClick={(e) => { e.preventDefault(); onNavigate('products'); }} className="text-brand-dark hover:text-brand-accent transition-colors duration-300 font-medium">Produtos</a>
                        <a href="#presentes" onClick={(e) => { e.preventDefault(); onNavigate('gifts'); }} className="text-rose-700 hover:text-rose-900 transition-colors duration-300 font-bold flex items-center gap-1">
                            <span>🎁 Presentes</span>
                        </a>
                        {showServicesLink && (
                            <a href="#services" onClick={(e) => { e.preventDefault(); onNavigate('services'); }} className="text-brand-dark hover:text-brand-accent transition-colors duration-300 font-medium">Serviços</a>
                        )}
                        {showPartnersLink && (
                            <a href="#partner-installers" onClick={(e) => { e.preventDefault(); onNavigate('partner-installers'); }} className="text-amber-800 hover:text-amber-600 transition-colors duration-300 font-bold flex items-center gap-1">
                                <span>Instaladores Parceiros</span>
                            </a>
                        )}
                        <a href="#about-us" onClick={(e) => { e.preventDefault(); onNavigate('about-us'); }} className="text-brand-dark hover:text-brand-accent transition-colors duration-300 font-medium">Sobre Nós</a>
                        <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="text-brand-dark hover:text-brand-accent transition-colors duration-300 font-medium">Contato</a>
                    </nav>

                    <div className="flex items-center gap-2">
                        {showConsultancyButton && onOpenConsultancy && (
                            <button
                                onClick={onOpenConsultancy}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-amber-900 border border-amber-300 rounded-full text-xs font-bold transition-all shadow-sm"
                            >
                                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                                <span>Consultoria IA</span>
                                <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full uppercase">Novo</span>
                            </button>
                        )}

                        {showAppletButton && onOpenExternalApplet && (
                            <button
                                onClick={onOpenExternalApplet}
                                title="Abrir Ferramenta Especialista"
                                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full text-xs font-bold transition-all shadow-sm"
                            >
                                <span>Applet Especialista</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                         <CartIcon onClick={onCartClick} />
                    </div>
                </div>
            </div>
        </header>
    );
};
