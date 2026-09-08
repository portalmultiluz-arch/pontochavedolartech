import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Ban, 
  Search, 
  FileText, 
  Wrench, 
  BookOpen, 
  Scale, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  RefreshCw, 
  Save, 
  Printer, 
  SlidersHorizontal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import type { TechnicalConsultancyProject, Product } from '../../types';
import { 
  subscribeToCollection, 
  updateDocument, 
  deleteDocument 
} from '../../services/firebaseService';
import { analyzeTechnicalProject } from '../../services/geminiService';

interface TechnicalConsultancyManagerProps {
  products: Product[];
}

export const TechnicalConsultancyManager: React.FC<TechnicalConsultancyManagerProps> = ({ products }) => {
  const [projects, setProjects] = useState<TechnicalConsultancyProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<TechnicalConsultancyProject | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minOrderValueConfig, setMinOrderValueConfig] = useState<number>(() => {
    return Number(localStorage.getItem('pcl_min_consultancy_value')) || 250;
  });
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToCollection('technicalConsultancies', (data) => {
      setProjects(data as TechnicalConsultancyProject[]);
      if (selectedProject) {
        const updated = data.find((p: any) => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated as TechnicalConsultancyProject);
      }
    });

    return () => unsub();
  }, [selectedProject?.id]);

  const handleSelectProject = (project: TechnicalConsultancyProject) => {
    setSelectedProject(project);
    setAdminNoteInput(project.adminNotes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedProject?.id) return;
    try {
      setIsSavingNote(true);
      await updateDocument('technicalConsultancies', selectedProject.id, {
        adminNotes: adminNoteInput,
        updatedAt: new Date().toISOString()
      });
      alert('Anotações do parecer técnico salvas com sucesso!');
    } catch (e) {
      console.error("Erro ao salvar anotação:", e);
      alert('Erro ao salvar anotação.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleReanalyzeWithAI = async () => {
    if (!selectedProject?.id) return;
    if (!confirm('Deseja reexecutar a análise técnica da Inteligência Artificial para este projeto?')) return;

    try {
      setIsReanalyzing(true);
      const aiResponse = await analyzeTechnicalProject({
        customerName: selectedProject.customerName,
        projectTitle: selectedProject.projectTitle,
        projectCategory: selectedProject.projectCategory,
        propertyType: selectedProject.propertyType,
        roomDimensions: selectedProject.roomDimensions,
        voltage: selectedProject.voltage,
        projectDescription: selectedProject.projectDescription,
        orderValue: selectedProject.orderValue
      }, products);

      await updateDocument('technicalConsultancies', selectedProject.id, {
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
        updatedAt: new Date().toISOString()
      });

      alert('Projeto reanalisado pela IA com sucesso!');
    } catch (e: any) {
      console.error("Erro na reanálise:", e);
      alert('Erro ao reanalisar projeto: ' + (e?.message || 'Tente novamente.'));
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta consultoria técnica do histórico?')) return;
    try {
      await deleteDocument('technicalConsultancies', id);
      if (selectedProject?.id === id) setSelectedProject(null);
    } catch (e) {
      console.error("Erro ao excluir:", e);
    }
  };

  const handleSaveMinOrderConfig = (val: number) => {
    setMinOrderValueConfig(val);
    localStorage.setItem('pcl_min_consultancy_value', String(val));
    alert(`Valor mínimo de elegibilidade atualizado para R$ ${val.toFixed(2)}`);
  };

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = 
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.projectTitle && p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.orderId && p.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalCount = projects.length;
  const approvedCount = projects.filter(p => p.status === 'approved' || p.status === 'approved_with_warnings').length;
  const rejectedCount = projects.filter(p => p.status === 'rejected_illegal').length;

  return (
    <div className="space-y-6">
      
      {/* Header & Estatísticas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Gestão de Consultorias Técnicas IA</h2>
              <p className="text-xs text-slate-500">Pareceres técnicos, conformidade ABNT e descarte de serviços fora da lei</p>
            </div>
          </div>
        </div>

        {/* Configuração de Valor Mínimo */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          <div className="text-xs">
            <span className="font-semibold text-slate-700">Valor Mínimo Compra:</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-slate-500 font-bold">R$</span>
              <input 
                type="number" 
                value={minOrderValueConfig} 
                onChange={(e) => setMinOrderValueConfig(Number(e.target.value))}
                onBlur={() => handleSaveMinOrderConfig(minOrderValueConfig)}
                className="w-20 px-2 py-0.5 text-xs font-bold border border-slate-300 rounded bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total de Consultorias</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Aprovados & Conformes</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{approvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Descartados por Ilegalidade</p>
            <h3 className="text-2xl font-bold text-rose-700 mt-1">{rejectedCount}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Ban className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, e-mail, pedido ou projeto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({projects.length})
          </button>
          <button 
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Aprovados
          </button>
          <button 
            onClick={() => setFilterStatus('rejected_illegal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              filterStatus === 'rejected_illegal' ? 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Descarte Legal
          </button>
        </div>
      </div>

      {/* Grid Principal: Lista + Visualizador do Laudo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lista de Projetos */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filteredProjects.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
              <Sparkles className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold">Nenhuma consultoria técnica encontrada</p>
              <p className="text-xs text-slate-400 mt-1">Os projetos submetidos pelos clientes com compras elegíveis aparecerão aqui.</p>
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isSelected = selectedProject?.id === p.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-400/20' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.status === 'rejected_illegal' 
                            ? 'bg-rose-100 text-rose-800' 
                            : p.status === 'approved_with_warnings'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.status === 'rejected_illegal' ? 'Descarte Legal' : 'Aprovado ABNT'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : 'Data não informada'}
                        </span>
                        {p.attachedPdfName && (
                          <span className="text-[10px] font-bold bg-slate-900 text-amber-400 px-1.5 py-0.2 rounded flex items-center gap-1">
                            <FileText className="h-3 w-3" /> PDF Anexo
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{p.projectTitle || 'Projeto Técnico'}</h4>
                      <p className="text-xs text-slate-600 font-medium">{p.customerName}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                        R$ {Number(p.orderValue || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {p.projectDescription}
                  </p>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Categoria: <strong className="text-slate-700 capitalize">{p.projectCategory}</strong></span>
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      Ver Laudo <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Painel de Detalhes e Parecer Técnico */}
        <div className="lg:col-span-7">
          {selectedProject ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              {/* Header do Projeto Selecionado */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      selectedProject.status === 'rejected_illegal'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedProject.status === 'approved_with_warnings'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedProject.status === 'rejected_illegal' ? 'Descartado por Restrição Legal' : 'Conforme Normas ABNT'}
                    </span>
                    <span className="text-xs text-slate-500">Pedido: {selectedProject.orderId || 'N/A'}</span>
                  </div>
                  <h3 className="text-lg font-bold font-serif text-slate-900 mt-1">{selectedProject.projectTitle}</h3>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleReanalyzeWithAI}
                    disabled={isReanalyzing}
                    className="p-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    title="Reexecutar análise com a IA"
                  >
                    <RefreshCw className={`h-4 w-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
                    <span>Reanalisar IA</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id!)}
                    className="p-2 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                    title="Excluir do histórico"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Cliente:</span>
                  <span className="font-bold text-slate-800">{selectedProject.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">E-mail:</span>
                  <span className="font-bold text-slate-800">{selectedProject.customerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Telefone:</span>
                  <span className="font-bold text-slate-800">{selectedProject.customerPhone || 'Não informado'}</span>
                </div>
              </div>

              {/* Descrição Enviada pelo Cliente */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Descrição Enviada pelo Cliente
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  "{selectedProject.projectDescription}"
                </div>
                {selectedProject.attachedPdfName && (
                  <div className="flex items-center gap-2 mt-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                    <FileText className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Arquivo PDF Avaliado pela IA: <strong>{selectedProject.attachedPdfName}</strong> {selectedProject.attachedPdfSize ? `(${(selectedProject.attachedPdfSize / (1024 * 1024) >= 1 ? (selectedProject.attachedPdfSize / (1024 * 1024)).toFixed(1) + ' MB' : (selectedProject.attachedPdfSize / 1024).toFixed(0) + ' KB')})` : ''}</span>
                  </div>
                )}
                <div className="flex gap-4 mt-2 text-[11px] text-slate-500">
                  <span>Imóvel: <strong className="text-slate-700 capitalize">{selectedProject.propertyType}</strong></span>
                  <span>Tensão: <strong className="text-slate-700">{selectedProject.voltage || 'Bivolt'}</strong></span>
                  <span>Dimensões: <strong className="text-slate-700">{selectedProject.roomDimensions || 'N/A'}</strong></span>
                </div>
              </div>

              {/* Seção do Laudo Emitido pela IA */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Parecer Técnico Emitido pela IA
                  </h4>
                  <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600 font-medium">
                    Confiabilidade: {selectedProject.aiAnalysis?.approvalConfidence}%
                  </span>
                </div>

                {/* Se foi descartado com gentileza */}
                {selectedProject.status === 'rejected_illegal' && (
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-rose-700">
                      <Ban className="h-4 w-4" />
                      Mensagem de Descarte Cortês Enviada ao Cliente:
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 bg-white p-3 rounded-lg border border-rose-100">
                      {selectedProject.aiAnalysis?.courteousRejectionNotice}
                    </p>
                  </div>
                )}

                {/* Síntese Executiva */}
                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <strong className="block text-amber-900 mb-1">Síntese do Parecer:</strong>
                  {selectedProject.aiAnalysis?.executiveSummary}
                </div>

                {/* Normas ABNT Aplicáveis */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    Normas Técnicas (ABNT / NR-10):
                  </div>
                  <p>{selectedProject.aiAnalysis?.legalAndNormativeAnalysis}</p>
                </div>

                {/* Recomendações Técnicas */}
                {selectedProject.aiAnalysis?.technicalRecommendations && selectedProject.aiAnalysis.technicalRecommendations.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-slate-500" />
                      Diretrizes & Dimensionamento:
                    </h5>
                    <ul className="space-y-1.5">
                      {selectedProject.aiAnalysis.technicalRecommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Campo para Anotações do Administrador / Engenharia Interna */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Anotações Internas do Administrador / Engenheiro Responsável
                </label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Insira observações internas, materiais reservados no estoque ou feedback sobre a execução..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNote}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isSavingNote ? 'Salvando...' : 'Salvar Anotações Internas'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
              <Sparkles className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">Selecione uma consultoria para ver o laudo</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Clique em qualquer projeto da lista ao lado para inspecionar os detalhes, o parecer da IA e as normas ABNT aplicáveis.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
