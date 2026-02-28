import React, { useState } from 'react';

export default function Profile({ data, updateData }) {
    const [view, setView] = useState('checklist');
    const checklist = data.checklist || [];
    const skincare = data.skincare || [];
    const dados = data.dados || [];

    const handleToggleChecklist = (index) => {
        updateData('checklist', index, (item) => ({
            ...item,
            Status: item.Status === 'OK' || item.Status === '✔' ? '' : 'OK'
        }));
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
            <div className="sticky top-0 z-20 flex items-center justify-between p-4 pt-8 pb-4 glass-panel border-b border-white/5">
                <h2 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 text-slate-900 dark:text-white">Perfil & Utilitários</h2>
                <button className="flex size-10 items-center justify-center rounded-full hover:bg-white/10 text-slate-900 dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">settings</span>
                </button>
            </div>

            <div className="sticky top-[68px] z-10 px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
                <div className="flex h-12 w-full items-center rounded-xl bg-slate-200 dark:bg-surface-dark p-1">
                    {['checklist', 'skincare', 'dados'].map((tab) => (
                        <label key={tab} className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView(tab)}>
                            <input checked={view === tab} className="peer sr-only" name="profile-view" type="radio" value={tab} readOnly />
                            <span className="absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                            <span className="relative z-10 text-sm font-semibold text-slate-500 dark:text-white/60 peer-checked:text-primary dark:peer-checked:text-primary truncate capitalize">
                                {tab === 'checklist' ? 'Checklists' : tab === 'skincare' ? 'Skincare' : 'Perfil'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-6 px-4 mt-2">
                {view === 'checklist' && (
                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Checklist da Viagem</h3>
                        <div className="flex flex-col gap-3">
                            {checklist.map((item, idx) => {
                                const isChecked = item.Status === 'OK' || item.Status === '✔';
                                if (!item['Item']) return null;
                                return (
                                    <div key={idx} onClick={() => handleToggleChecklist(idx)} className="flex items-center gap-4 rounded-xl glass-card p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex-shrink-0">
                                            <div className={`h-6 w-6 rounded-full border-2 transition-colors flex items-center justify-center ${isChecked ? 'bg-primary border-primary' : 'border-primary/50 group-hover:border-primary bg-transparent'}`}>
                                                {isChecked && <span className="w-2.5 h-2.5 bg-white rounded-full"></span>}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-semibold truncate ${isChecked ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{item['Item']}</h4>
                                            <p className="text-xs text-slate-400 truncate">{item['Categoria']} {item['Observações'] ? `• ${item['Observações']}` : ''}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {view === 'skincare' && (
                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Rotina Skincare</h3>
                        {['Manhã', 'Noite', 'Semanal'].map(periodo => (
                            <div key={periodo} className="mb-6">
                                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                                    <h4 className="text-base font-bold text-primary">{periodo}</h4>
                                </div>
                                <div className="rounded-2xl glass-card border border-white/5 p-2 shadow-sm">
                                    {skincare.filter(s => s['Quando?'] === periodo).map((s, i) => (
                                        <div key={i} className={`p-3 hover:bg-white/5 transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">{s['Ordem']}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{s['Produto']}</p>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-white/60 mt-1">{s['Observação']}</p>
                                                    </div>
                                                </div>
                                                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 whitespace-nowrap">{s['Área']}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {view === 'dados' && (
                    <section>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Meus Dados</h3>
                        <div className="rounded-2xl glass-card border border-white/5 p-4 shadow-sm flex flex-col gap-4">
                            {dados.map((d, i) => d['Informação Pessoal'] ? (
                                <div key={i} className="flex flex-col">
                                    <span className="text-xs text-slate-500 dark:text-white/60">{d['Informação Pessoal']}</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white break-words">{d['Valor']}</span>
                                </div>
                            ) : null)}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
