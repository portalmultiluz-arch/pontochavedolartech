import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight, Scale, CheckCircle2 } from 'lucide-react';

interface TechnicalConsultancyBannerProps {
  onOpenConsultancy: () => void;
  minEligibleAmount?: number;
  currentAmount?: number;
  isCompact?: boolean;
}

export const TechnicalConsultancyBanner: React.FC<TechnicalConsultancyBannerProps> = ({
  onOpenConsultancy,
  minEligibleAmount = 250,
  currentAmount = 0,
  isCompact = false
}) => {
  const isEligible = currentAmount >= minEligibleAmount;
  const remaining = Math.max(0, minEligibleAmount - currentAmount);

  if (isCompact) {
    return (
      <div className={`p-4 rounded-xl border transition-all ${
        isEligible 
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-500/10 border-amber-300' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              isEligible ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-200 text-slate-600'
            }`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-bold text-slate-900">Consultoria Técnica IA Especialista</h4>
                {isEligible ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                    LIBERADO
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-medium px-2 py-0.2 rounded-full">
                    Acima de R$ {minEligibleAmount.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                {isEligible 
                  ? 'Sua compra atingiu o valor elegível! Solicite o parecer de engenharia e normas ABNT.'
                  : `Adicione mais R$ ${remaining.toFixed(2)} para ganhar análise técnica e parecer de normas ABNT gratuito.`}
              </p>
            </div>
          </div>
          {isEligible && (
            <button
              type="button"
              onClick={onOpenConsultancy}
              className="text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap transition-colors flex items-center gap-1"
            >
              Enviar Projeto
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden my-8">
      {/* Decoração de fundo sutil */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Serviço Exclusivo de Inteligência Artificial
          </div>

          <h3 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-white">
            Gestão & Consultoria Técnica Especializada com IA
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed">
            Vai reformar, trocar fechaduras, instalar circuitos de LED ou automação? Em compras a partir de <strong className="text-amber-400">R$ {minEligibleAmount.toFixed(2)}</strong>, no mesmo mês da compra você envia a descrição do seu projeto e recebe um laudo completo de orientação, com base nas <strong className="text-white">Normas ABNT (NBR 5410 / NR-10)</strong> e legislação vigente.
          </p>

          <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Dimensionamento e Bitolas de Cabos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Conformidade ABNT e NR-10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-blue-400" />
              <span>Análise Rigorosa da Realidade Legal</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 w-full lg:w-auto">
          <button
            onClick={onOpenConsultancy}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-slate-950" />
            <span>Solicitar Consultoria Técnica</span>
            <ArrowRight className="h-4 w-4 text-slate-950" />
          </button>
          
          <div className="text-center text-[11px] text-slate-400">
            * Serviços fora da realidade legal são descartados com gentileza e orientação segura.
          </div>
        </div>
      </div>
    </div>
  );
};
