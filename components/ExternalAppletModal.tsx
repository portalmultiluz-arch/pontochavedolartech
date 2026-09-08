import React, { useState } from 'react';
import { X, ExternalLink, Maximize2, Minimize2, Sparkles, RefreshCw } from 'lucide-react';

interface ExternalAppletModalProps {
  isOpen: boolean;
  onClose: () => void;
  appletUrl?: string;
  title?: string;
}

export const ExternalAppletModal: React.FC<ExternalAppletModalProps> = ({
  isOpen,
  onClose,
  appletUrl = 'https://aistudio.google.com/apps/8ae1e6e8-3a58-4152-813a-bcbba0f508f2?showAssistant=true&showPreview=true&fullscreenApplet=true',
  title = 'Serviço Especialista Integrado'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-6xl h-[90vh]'
        }`}
      >
        {/* Header do Modal */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center select-none">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-400/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-white tracking-tight">{title}</h3>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.2 rounded-full uppercase">
                  App Integrado
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Acesse o ambiente do assistente ou abra em uma nova aba
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              title="Recarregar aplicativo"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <a
              href={appletUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir em nova aba"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Aba</span>
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Restaurar tamanho" : "Tela cheia"}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={onClose}
              title="Fechar"
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="relative flex-grow bg-slate-50 w-full h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-6 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col items-center">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-full mb-3">
              <ExternalLink className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Abrir Serviço Especialista</h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              O link do AI Studio exige autenticação da sua conta Google e não permite exibição dentro de janelas embutidas (erro 401 por políticas de segurança do Google).
            </p>
            <a
              href={appletUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              <span>Acessar no AI Studio</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
