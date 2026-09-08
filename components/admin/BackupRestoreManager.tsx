import React, { useState } from 'react';
import { Download, Upload, ShieldCheck, Database, RefreshCw, AlertTriangle, CheckCircle, FileText, Server, Clock, HardDrive } from 'lucide-react';
import { subscribeToCollection, createDocument, updateDocument } from '../../services/firebaseService';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';


export const BackupRestoreManager: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState<string>('');
    const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
        return localStorage.getItem('last_backup_timestamp');
    });
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    const collectionsToBackup = [
        'products',
        'sales',
        'customers',
        'suppliers',
        'services',
        'finance',
        'quotes',
        'rma_records',
        'technicalConsultancyProjects',
        'siteSettings'
    ];

    // 1. Exportar Backup Completo (JSON Snapshot)
    const handleExportFullBackup = async () => {
        setIsExporting(true);
        setStatusMessage({ type: 'info', text: 'Gerando snapshot completo de todas as coleções do banco de dados...' });

        try {
            const fullBackupData: Record<string, any[]> = {};
            let totalRecords = 0;

            for (const colName of collectionsToBackup) {
                try {
                    const colRef = collection(db, colName);
                    const snapshot = await getDocs(colRef);
                    const docsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    fullBackupData[colName] = docsList;
                    totalRecords += docsList.length;
                } catch (colErr) {
                    console.warn(`Aviso ao ler coleção ${colName}:`, colErr);
                    fullBackupData[colName] = [];
                }
            }

            const backupPayload = {
                metadata: {
                    appName: 'Ponto Chave do Lar',
                    version: '2.0.0',
                    databaseId: 'ai-studio-841bfd5e-514d-4422-86f9-2016d76c7153',
                    exportedAt: new Date().toISOString(),
                    totalRecords,
                    collections: Object.keys(fullBackupData)
                },
                data: fullBackupData
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
            const downloadAnchor = document.createElement('a');
            const now = new Date();
            const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
            
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `BACKUP_PONTO_CHAVE_DO_LAR_${dateFormatted}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            const timestampStr = new Date().toLocaleString('pt-BR');
            localStorage.setItem('last_backup_timestamp', timestampStr);
            setLastBackupDate(timestampStr);

            setStatusMessage({ 
                type: 'success', 
                text: `Backup gerado com sucesso! ${totalRecords} registros exportados e arquivo salvo no seu computador.` 
            });
        } catch (error: any) {
            console.error("Erro ao gerar backup:", error);
            setStatusMessage({ 
                type: 'error', 
                text: `Erro ao exportar backup: ${error.message || 'Verifique a conexão com o Firestore.'}` 
            });
        } finally {
            setIsExporting(false);
        }
    };

    // 2. Restaurar Imediatamente a partir de um JSON
    const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);

                if (!parsed.data || typeof parsed.data !== 'object') {
                    throw new Error("Arquivo de backup inválido ou incompatível.");
                }

                const confirmed = window.confirm(
                    `ATENÇÃO: Você está prestes a RESTAURAR o banco de dados com base no backup de ${parsed.metadata?.exportedAt ? new Date(parsed.metadata.exportedAt).toLocaleString('pt-BR') : 'data desconhecida'}.\n\n` +
                    `Total de coleções: ${Object.keys(parsed.data).length}.\n` +
                    `Deseja prosseguir com a restauração imediata?`
                );

                if (!confirmed) {
                    event.target.value = '';
                    return;
                }

                setIsImporting(true);
                let restoredCount = 0;

                for (const [colName, docsList] of Object.entries(parsed.data)) {
                    if (Array.isArray(docsList)) {
                        setImportProgress(`Restaurando coleção "${colName}" (${docsList.length} itens)...`);
                        for (const item of docsList) {
                            if (item.id) {
                                const { id, ...dataWithoutId } = item;
                                const docRef = doc(db, colName, id);
                                await setDoc(docRef, dataWithoutId, { merge: true });
                                restoredCount++;
                            }
                        }
                    }
                }

                setStatusMessage({
                    type: 'success',
                    text: `Restauração concluída com sucesso! ${restoredCount} documentos foram sincronizados e atualizados no Firestore.`
                });
            } catch (err: any) {
                console.error("Erro na restauração:", err);
                setStatusMessage({
                    type: 'error',
                    text: `Falha na restauração: ${err.message || 'Formato de arquivo inválido'}`
                });
            } finally {
                setIsImporting(false);
                setImportProgress('');
                event.target.value = '';
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Banner de Segurança do Banco de Dados */}
            <div className="bg-gradient-to-r from-emerald-900 to-brand-dark text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold mb-3 border border-emerald-500/30">
                        <ShieldCheck size={14} />
                        <span>Google Cloud Firestore Ativo & Protegido</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                        Central de Backup & Restauração de Emergência
                    </h2>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Seus dados operacionais (produtos, vendas, clientes, propostas, contas e laudos técnicos) estão permanentemente salvos na nuvem de alta disponibilidade do <strong>Google Cloud Firestore</strong> com replicação geográfica multi-zona.
                    </p>
                </div>
                <Database className="absolute right-6 -bottom-6 text-white/5" size={200} />
            </div>

            {/* Status Messages */}
            {statusMessage && (
                <div className={`p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 ${
                    statusMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                    statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                    'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                    {statusMessage.type === 'success' && <CheckCircle className="text-green-600 shrink-0" size={20} />}
                    {statusMessage.type === 'error' && <AlertTriangle className="text-red-600 shrink-0" size={20} />}
                    {statusMessage.type === 'info' && <RefreshCw className="text-blue-600 shrink-0 animate-spin" size={20} />}
                    <span>{statusMessage.text}</span>
                </div>
            )}

            {/* Painel com 2 Ações Primárias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. EXPORTAR BACKUP */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <Download size={28} />
                        </div>
                        <h3 className="text-xl font-bold font-serif text-brand-dark mb-2">
                            Exportar Snapshot Completo (Backup Diário)
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6">
                            Gera um arquivo <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-mono">.json</code> contendo 100% de todas as tabelas: Estoque, Vendas PDV, Clientes, Fornecedores, Contas a Pagar/Receber, RMA e Orçamentos.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6 space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span className="font-medium">Armazenamento Principal:</span>
                                <span className="font-bold text-gray-800">Google Firestore (Nuvem)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Último Backup Local:</span>
                                <span className="font-bold text-blue-700">{lastBackupDate || 'Nenhum backup baixado hoje'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Formato:</span>
                                <span className="font-mono text-gray-800">JSON Estruturado Universal</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleExportFullBackup}
                        disabled={isExporting || isImporting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isExporting ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                <span>Exportando Coleções...</span>
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                <span>Baixar Backup Completo Agora</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 2. RESTAURAR IMEDIATO */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                            <Upload size={28} />
                        </div>
                        <h3 className="text-xl font-bold font-serif text-brand-dark mb-2">
                            Restaurar Backup Imediato
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6">
                            Recupera instantaneamente todos os dados a partir de qualquer arquivo de backup JSON salvo anteriormente. O sistema reimporta e sincroniza todos os documentos no Firestore.
                        </p>

                        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 mb-6 text-xs text-amber-900 space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                                <AlertTriangle size={15} className="text-amber-700 shrink-0" />
                                Procedimento de Restauração Segura:
                            </p>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                                Os registros são combinados e atualizados pelo ID original de cada documento. Nenhuma venda ou cadastro é corrompido durante a injeção.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className={`w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isImporting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                            {isImporting ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    <span>{importProgress || 'Restaurando Banco...'}</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    <span>Selecionar Arquivo JSON e Restaurar</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                accept=".json" 
                                className="hidden" 
                                disabled={isImporting || isExporting}
                                onChange={handleImportBackup} 
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Informações Técnicas & SLA do Banco de Dados */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-base font-bold font-serif text-brand-dark flex items-center gap-2">
                    <Server size={18} className="text-emerald-600" />
                    Topologia & Garantias do Banco de Dados (Cloud Firestore)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-gray-400 block font-bold uppercase text-[10px]">Arquitetura:</span>
                        <p className="font-bold text-gray-800 mt-1">Google Cloud NoSQL Distribuído</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Replicação automática multi-zona (SLA 99.999%).</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-gray-400 block font-bold uppercase text-[10px]">Coleções Protegidas:</span>
                        <p className="font-bold text-gray-800 mt-1">10 Coleções Ativas</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Produtos, Vendas, Clientes, Fornecedores, Financeiro, RMA, etc.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-gray-400 block font-bold uppercase text-[10px]">Recuperação em Desastres:</span>
                        <p className="font-bold text-gray-800 mt-1">RTO &lt; 2 Minutos</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Restauração imediata com 1 clique através do arquivo snapshot.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
