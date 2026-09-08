import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Ban, 
  FileText, 
  Wrench, 
  CheckCircle2, 
  X, 
  Printer, 
  ShoppingBag, 
  Scale, 
  BookOpen, 
  Send,
  Loader2,
  Info,
  UploadCloud,
  FileCheck2,
  Trash2
} from 'lucide-react';
import type { Product, TechnicalConsultancyProject } from '../types';
import { analyzeTechnicalProject } from '../services/geminiService';
import { createDocument } from '../services/firebaseService';

interface TechnicalConsultancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProducts: Product[];
  initialOrderValue?: number;
  initialOrderId?: string;
  customerPreFill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const TechnicalConsultancyModal: React.FC<TechnicalConsultancyModalProps> = ({
  isOpen,
  onClose,
  availableProducts,
  initialOrderValue = 250,
  initialOrderId,
  customerPreFill
}) => {
  const [formData, setFormData] = useState({
    customerName: customerPreFill?.name || '',
    customerEmail: customerPreFill?.email || '',
    customerPhone: customerPreFill?.phone || '',
    orderId: initialOrderId || '',
    orderValue: initialOrderValue,
    projectTitle: '',
    projectCategory: 'iluminacao' as TechnicalConsultancyProject['projectCategory'],
    propertyType: 'residencial' as TechnicalConsultancyProject['propertyType'],
    roomDimensions: '',
    voltage: 'bivolt' as NonNullable<TechnicalConsultancyProject['voltage']>,
    projectDescription: ''
  });

  const [pdfFile, setPdfFile] = useState<{
    name: string;
    size: number;
    base64: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TechnicalConsultancyProject | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processSelectedPdf = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Por favor, selecione apenas arquivos em formato PDF (.pdf).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage('O arquivo PDF deve ter no máximo 12 MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:application/pdf;base64,
      const base64Data = result.includes(',') ? result.split(',')[1] : result;
      setPdfFile({
        name: file.name,
        size: file.size,
        base64: base64Data
      });
      if (!formData.projectTitle) {
        setFormData(prev => ({
          ...prev,
          projectTitle: `Projeto: ${file.name.replace(/\.[^/.]+$/, "")}`
        }));
      }
    };
    reader.onerror = () => {
      setErrorMessage('Erro ao ler o arquivo PDF. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedPdf(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedPdf(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!formData.projectDescription.trim() && !pdfFile) || !formData.customerName.trim() || !formData.customerEmail.trim()) {
      setErrorMessage('Por favor, preencha o seu nome, e-mail e a descrição detalhada do seu projeto ou anexe um arquivo PDF com o descritivo.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMessage(null);

      const descriptionToSend = formData.projectDescription.trim() 
        ? formData.projectDescription 
        : `[Descrição detalhada fornecida no arquivo PDF em anexo: "${pdfFile?.name}"]`;

      const aiResponse = await analyzeTechnicalProject({
        customerName: formData.customerName,
        projectTitle: formData.projectTitle || (pdfFile ? `Projeto PDF: ${pdfFile.name}` : 'Projeto Técnico Residencial/Comercial'),
        projectCategory: formData.projectCategory,
        propertyType: formData.propertyType,
        roomDimensions: formData.roomDimensions,
        voltage: formData.voltage,
        projectDescription: descriptionToSend,
        orderValue: Number(formData.orderValue) || initialOrderValue,
        pdfBase64: pdfFile?.base64,
        pdfFileName: pdfFile?.name
      }, availableProducts);

      const newProject: TechnicalConsultancyProject = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        orderId: formData.orderId || `PED-${Math.floor(100000 + Math.random() * 900000)}`,
        orderValue: Number(formData.orderValue) || initialOrderValue,
        projectTitle: formData.projectTitle || (pdfFile ? `Projeto PDF: ${pdfFile.name}` : `Consultoria Técnica - ${formData.projectCategory.toUpperCase()}`),
        projectCategory: formData.projectCategory,
        propertyType: formData.propertyType,
        roomDimensions: formData.roomDimensions,
        voltage: formData.voltage,
        projectDescription: descriptionToSend,
        attachedPdfName: pdfFile?.name,
        attachedPdfSize: pdfFile?.size,
        status: aiResponse.status,
        aiAnalysis: {
          isLegallyCompliant: aiResponse.isLegallyCompliant,
          executiveSummary: aiResponse.executiveSummary,
          legalAndNormativeAnalysis: aiResponse.legalAndNormativeAnalysis,
          technicalRecommendations: aiResponse.technicalRecommendations,
          safetyWarnings: aiResponse.safetyWarnings,
          requiredMaterials: aiResponse.requiredMaterials,
          courteousRejectionNotice: aiResponse.courteousRejectionNotice,
          approvalConfidence: aiResponse.approvalConfidence,
          suggestedPclProducts: aiResponse.suggestedPclProducts
        },
        createdAt: new Date().toISOString()
      };

      // Salva no Firestore
      try {
        const savedId = await createDocument('technicalConsultancies', newProject);
        newProject.id = savedId;
      } catch (err) {
        console.warn("Aviso ao salvar no Firestore (projeto exibido normalmente):", err);
      }

      setAnalysisResult(newProject);
    } catch (err: any) {
      console.error("Erro ao analisar projeto:", err);
      setErrorMessage(err?.message || 'Ocorreu um erro ao processar a análise técnica da IA. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 flex justify-between items-center relative">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-400">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif tracking-tight">Consultoria Técnica IA Especialista</h2>
                <span className="text-xs bg-amber-500 text-slate-950 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Exclusivo</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Avaliação de engenharia, normas técnicas brasileiras (ABNT / NBR / NR-10) e conformidade legal
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6 bg-slate-50/50">
          
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Atenção</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {!analysisResult ? (
            /* Formulário de Envio do Projeto */
            <form onSubmit={handleAnalyze} className="space-y-6">
              
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 flex items-start gap-3 text-amber-900">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold">Como funciona:</span> Em compras a partir de R$ 250,00, no mesmo mês da compra você envia a descrição do seu projeto e recebe um laudo completo de orientação, com base nas Normas ABNT (NBR 5410 / NR-10) e legislação vigente. 
                  <span className="block mt-1 font-semibold text-amber-950">
                    * Projetos e solicitações que envolvam ilegalidades, fraudes ou riscos graves à segurança pública serão descartados com gentileza e orientação legal.
                  </span>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  1. Identificação do Cliente & Pedido
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                    <input 
                      type="text" 
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Ex: Carlos Eduardo Silva"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail para Envio do Laudo *</label>
                    <input 
                      type="email" 
                      name="customerEmail"
                      required
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="Ex: carlos@email.com"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telefone</label>
                    <input 
                      type="tel" 
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Especificações do Ambiente */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-slate-500" />
                  2. Parâmetros Técnicos do Ambiente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria do Projeto</label>
                    <select 
                      name="projectCategory"
                      value={formData.projectCategory}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    >
                      <option value="iluminacao">Iluminação & Design de Luz</option>
                      <option value="eletrica">Instalação Elétrica & Quadros</option>
                      <option value="seguranca_fechaduras">Fechaduras Digitais & Controle de Acesso</option>
                      <option value="automacao">Automação Residencial Smart</option>
                      <option value="decoracao_reforma">Reforma & Acabamentos</option>
                      <option value="outros">Outras Soluções do Lar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Imóvel</label>
                    <select 
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    >
                      <option value="residencial">Residencial (Casa / Apto)</option>
                      <option value="comercial">Comercial (Loja / Escritório)</option>
                      <option value="condominio">Área Comum de Condomínio</option>
                      <option value="industrial">Galpão / Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensões / Metragem</label>
                    <input 
                      type="text" 
                      name="roomDimensions"
                      value={formData.roomDimensions}
                      onChange={handleInputChange}
                      placeholder="Ex: 24m² (6m x 4m)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tensão Elétrica Local</label>
                    <select 
                      name="voltage"
                      value={formData.voltage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    >
                      <option value="110v">110V / 127V</option>
                      <option value="220v">220V Monofásico/Bifásico</option>
                      <option value="bivolt">Bivolt Automático</option>
                      <option value="trifasico">220V/380V Trifásico</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Descrição Detalhada & Upload de Arquivo PDF do Projeto */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    3. Descrição do Projeto & Arquivo PDF Anexo
                  </label>
                  <span className="text-[11px] text-slate-500">Texto ou upload de memorial em PDF</span>
                </div>

                {/* Upload de Arquivo PDF */}
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="technical-pdf-upload"
                  />

                  {!pdfFile ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-amber-500 bg-amber-50/80 scale-[1.01]' 
                          : 'border-slate-300 bg-slate-50/80 hover:bg-amber-50/40 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-full">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800">
                            Clique para selecionar ou arraste o arquivo PDF do seu projeto aqui
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Aceita memorial descritivo, planta, lista técnica ou especificação em PDF (até 12 MB)
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100/70 hover:bg-amber-200/80 px-3 py-1 rounded-full transition-colors">
                          Selecionar PDF do Projeto
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-emerald-500 text-white rounded-lg flex-shrink-0">
                          <FileCheck2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {pdfFile.name}
                            </p>
                            <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded">
                              PDF Carregado
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Tamanho: {formatFileSize(pdfFile.size)} • Pronto para leitura e análise pela IA
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                        title="Remover arquivo PDF"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <input 
                    type="text" 
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    placeholder="Título do Projeto (Ex: Projeto Elétrico da Sala e Iluminação LED)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white font-medium"
                  />
                  <textarea 
                    name="projectDescription"
                    rows={3}
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    placeholder={pdfFile ? "Observações ou comentários adicionais sobre o arquivo PDF (opcional)..." : "Descreva seu projeto com detalhes (ou anexe o arquivo PDF acima). Ex: Quero instalar spots LED 3000K no forro de gesso e fechadura digital biométrica..."}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white resize-none"
                  />
                </div>
              </div>

              {/* Botão de Análise */}
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Processando Parecer Técnico com IA...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-slate-950" />
                      <span>Emitir Laudo & Análise Técnica IA</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Visualização do Laudo / Parecer Técnico Gerado */
            <div className="space-y-6 print:p-0">
              
              {/* Card de Status e Resumo */}
              <div className={`p-6 rounded-2xl border ${
                analysisResult.status === 'rejected_illegal'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : analysisResult.status === 'approved_with_warnings'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-200/60">
                  <div className="flex items-center gap-3">
                    {analysisResult.status === 'rejected_illegal' ? (
                      <div className="p-3 bg-rose-100 text-rose-700 rounded-xl border border-rose-300">
                        <Ban className="h-7 w-7" />
                      </div>
                    ) : analysisResult.status === 'approved_with_warnings' ? (
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-xl border border-amber-300">
                        <AlertTriangle className="h-7 w-7" />
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-300">
                        <ShieldCheck className="h-7 w-7" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 shadow-sm border border-slate-200">
                          Laudo Técnico Oficial
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(analysisResult.createdAt).toLocaleDateString('pt-BR')} às {new Date(analysisResult.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-serif mt-0.5">
                        {analysisResult.projectTitle}
                      </h3>
                      {analysisResult.attachedPdfName && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 bg-white/90 px-2.5 py-1 rounded-md border border-slate-200 w-fit">
                          <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Arquivo PDF Analisado: <strong>{analysisResult.attachedPdfName}</strong> {analysisResult.attachedPdfSize ? `(${formatFileSize(analysisResult.attachedPdfSize)})` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                      analysisResult.status === 'rejected_illegal'
                        ? 'bg-rose-600 text-white'
                        : analysisResult.status === 'approved_with_warnings'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                    }`}>
                      {analysisResult.status === 'rejected_illegal'
                        ? 'Descartado por Restrição Legal / Normativa'
                        : analysisResult.status === 'approved_with_warnings'
                          ? 'Aprovado com Recomendações'
                          : 'Aprovado em Plena Conformidade'}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Confiabilidade Técnica: {analysisResult.aiAnalysis?.approvalConfidence}%
                    </p>
                  </div>
                </div>

                {/* Se foi descartado com gentileza */}
                {analysisResult.status === 'rejected_illegal' && analysisResult.aiAnalysis?.courteousRejectionNotice && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-rose-200 text-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                      <Scale className="h-4 w-4" />
                      Parecer de Legalidade & Respeito às Normas
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {analysisResult.aiAnalysis.courteousRejectionNotice}
                    </p>
                  </div>
                )}

                {/* Resumo Executivo */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-900 mb-1">Síntese do Parecer:</p>
                  <p className="text-sm leading-relaxed text-slate-700 bg-white/70 p-3.5 rounded-xl border border-slate-200/60">
                    {analysisResult.aiAnalysis?.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Fundamentação Legal e Normativa ABNT */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                  Normas Técnicas Aplicáveis (ABNT / Legislação Vigente)
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {analysisResult.aiAnalysis?.legalAndNormativeAnalysis}
                </p>
              </div>

              {/* Recomendações Técnicas e Avisos de Segurança */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Recomendações Técnicas */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    Diretrizes Técnicas de Instalação
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.aiAnalysis?.technicalRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Alertas de Segurança */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Cuidados Críticos de Segurança & NR-10
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.aiAnalysis?.safetyWarnings.map((warn, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Materiais e Produtos Recomendados do Ponto Chave do Lar */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShoppingBag className="h-4 w-4 text-amber-600" />
                  Materiais Necessários & Produtos Recomendados (Ponto Chave do Lar)
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lista de Insumos:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.aiAnalysis?.requiredMaterials.map((mat, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysisResult.aiAnalysis?.suggestedPclProducts && analysisResult.aiAnalysis.suggestedPclProducts.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Soluções da nossa loja:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.aiAnalysis.suggestedPclProducts.map((prod, idx) => (
                          <span key={idx} className="text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
                            ✓ {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações de Impressão e Novo Projeto */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200 print:hidden">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ← Analisar Outro Projeto
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="h-4 w-4 text-slate-600" />
                    Imprimir / Salvar Laudo
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-colors"
                  >
                    Concluir
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
