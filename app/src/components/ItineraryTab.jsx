import React, { useState } from 'react';
import { getCityImage } from '../utils/images';
import LazyImage from './LazyImage';
import GuideTab from './GuideTab';

export default function ItineraryTab({ data, localData, setLocalData }) {
    const [view, setView] = useState('roteiro');

    const handleDeleteLocalItem = (itemToDelete) => {
        setLocalData(prev => {
            const next = {
                ...prev,
                roteiro: (prev.roteiro || []).filter(item => item !== itemToDelete)
            };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });
    };
    const [activeIdx, setActiveIdx] = useState(0);

    const roteiro = data?.roteiro || [];
    const passeios = data?.passeios || [];
    const localRoteiro = data?.localRoteiro || [];

    if (roteiro.length === 0) return <div className="p-6 text-center">Nenhum roteiro encontrado.</div>;

    const activeDia = roteiro[activeIdx];
    const activeDate = activeDia?.['Data'];
    const activeCity = activeDia?.['Cidade'] || 'Em deslocamento';

    // Find passeios for the active day
    const passeiosDoDia = passeios.filter(p => p['Data'] === activeDate);

    // Find locally added roteiro items for the active day
    const localItensDoDia = localRoteiro.filter(item => item['Data'] === activeDate);

    // Combine passeios + local items into a single sorted list
    const allTimelineItems = [
        ...passeiosDoDia.map(p => ({
            type: 'passeio',
            time: p['Horário'] || '',
            data: p,
        })),
        ...localItensDoDia.map(item => ({
            type: 'local',
            time: item['Horário'] || '',
            data: item,
        })),
    ].sort((a, b) => {
        // Sort by time string (HH:mm or HH:MM-HH:MM)
        const getMinutes = (t) => {
            if (!t) return 9999;
            const match = t.match(/(\d{1,2})[h:](\d{0,2})/);
            if (match) return parseInt(match[1]) * 60 + (parseInt(match[2]) || 0);
            return 9999;
        };
        return getMinutes(a.time) - getMinutes(b.time);
    });

    // Robust Background image based on city
    const heroImage = getCityImage(activeCity);

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-24">
            {/* Segmented Control */}
            <div className="sticky top-0 z-40 px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
                <div className="flex h-12 w-full items-center rounded-2xl bg-slate-200 dark:bg-surface-dark p-1.5 shadow-inner">
                    <label className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView('roteiro')}>
                        <span className={`absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm transition-opacity ${view === 'roteiro' ? 'opacity-100' : 'opacity-0'}`}></span>
                        <span className={`relative z-10 text-sm font-semibold truncate ${view === 'roteiro' ? 'text-primary' : 'text-slate-500 dark:text-white/60'}`}>Roteiro</span>
                    </label>
                    <label className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView('guia')}>
                        <span className={`absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm transition-opacity ${view === 'guia' ? 'opacity-100' : 'opacity-0'}`}></span>
                        <span className={`relative z-10 text-sm font-semibold truncate ${view === 'guia' ? 'text-primary' : 'text-slate-500 dark:text-white/60'}`}>Guia</span>
                    </label>
                </div>
            </div>

            {view === 'roteiro' && (
                <div className="pt-2">
                    {/* Date Scroller */}
                    <div className="relative z-10 pt-4 pb-2 pl-6 overflow-x-auto no-scrollbar flex gap-3 mb-4">
                        {roteiro.map((dia, idx) => {
                            if (!dia['Data']) return null;
                            const isActive = idx === activeIdx;
                            // Date is now DD/MM/YYYY string from googleSheets.js
                            const dateParts = String(dia['Data']).split('/');
                            if (dateParts.length < 2) return null;
                            const [dayStr, monthStr] = dateParts;
                            const monthNames = { '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez' };
                            const shortMonth = monthNames[monthStr] || monthStr;

                            if (isActive) {
                                return (
                                    <div key={idx} onClick={() => setActiveIdx(idx)} className="cursor-pointer flex-shrink-0 w-16 h-20 rounded-2xl bg-primary shadow-lg shadow-primary/40 flex flex-col items-center justify-center transform scale-105 border border-primary/50 transition-all">
                                        <span className="text-xs font-medium text-white/90">{shortMonth}</span>
                                        <span className="text-xl font-bold text-white">{dayStr}</span>
                                    </div>
                                );
                            }
                            return (
                                <div key={idx} onClick={() => setActiveIdx(idx)} className="cursor-pointer flex-shrink-0 w-16 h-20 rounded-2xl glass-panel flex flex-col items-center justify-center border border-white/5 opacity-60 hover:opacity-100 transition-all">
                                    <span className="text-xs font-medium text-slate-400">{shortMonth}</span>
                                    <span className="text-xl font-bold text-slate-200">{dayStr}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Hero Image / Location Card */}
                    <div className="mx-6 mb-8 rounded-3xl overflow-hidden relative h-48 group">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={heroImage} alt={activeCity} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                            <h2 className="text-2xl font-serif font-bold text-white">{activeCity}</h2>
                            <p className="text-sm text-slate-300">{activeDia['Dia da Semana']} • Dia {activeDia['Nº Dia']}</p>
                        </div>
                        {allTimelineItems.length > 0 && (
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-white border border-white/30 truncate max-w-[120px]">
                                {allTimelineItems.length} Atividade(s)
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="px-6 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[39px] top-4 bottom-0 w-[2.5px] bg-white/5 rounded-full"></div>
                        <div className="absolute left-[39px] top-4 bottom-12 w-[2.5px] bg-gradient-to-b from-primary via-primary/40 to-transparent rounded-full shadow-[0_0_15px_rgba(232,48,110,0.2)]"></div>

                        {/* Start / Acordar */}
                        {(activeDia['Horario pra acordar'] || activeDia['Horário pra acordar']) && (activeDia['Horario pra acordar'] !== '-') && (
                            <div className="relative grid grid-cols-[auto_1fr] gap-6 mb-8 group">
                                <div className="flex flex-col items-center pt-2">
                                    <div className="w-8 h-8 rounded-full bg-surface-dark border border-primary/50 flex items-center justify-center text-primary z-10 shadow-[0_0_15px_rgba(232,48,110,0.3)]">
                                        <span className="material-symbols-outlined text-sm">wb_sunny</span>
                                    </div>
                                </div>
                                <div className="glass-panel p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 bg-white/5">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-serif font-semibold text-white">Bom dia!</h3>
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{activeDia['Horario pra acordar'] || activeDia['Horário pra acordar']}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">Horário sugerido para acordar.</p>
                                </div>
                            </div>
                        )}

                        {/* Deslocamento / Voo */}
                        {(activeDia['Horário deslocamento'] || activeDia['Horário deslocamento/vôo']) && (activeDia['Horário deslocamento'] !== '-') && (
                            <div className="relative grid grid-cols-[auto_1fr] gap-6 mb-8 group">
                                <div className="flex flex-col items-center pt-2">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white z-10 shadow-[0_0_20px_rgba(232,48,110,0.6)] ring-4 ring-primary/10 transition-transform group-hover:scale-110">
                                        <span className="material-symbols-outlined text-sm">flight</span>
                                    </div>
                                </div>
                                <div className="glass-card p-5 rounded-[24px] group-hover:bg-primary/5 border-primary/20 bg-primary/5 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                        <span className="material-symbols-outlined !text-[80px]">flight</span>
                                    </div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-serif font-semibold text-white">Deslocamento/Voo</h3>
                                        {activeDia['CIA'] && activeDia['CIA'] !== '-' && <span className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded-md">{activeDia['CIA']}</span>}
                                    </div>
                                    <p className="text-sm text-white/80 mb-2">{activeDia['Horário deslocamento'] || activeDia['Horário deslocamento/vôo']}</p>
                                </div>
                            </div>
                        )}

                        {/* Hotel */}
                        {activeDia['Hotel'] && activeDia['Hotel'] !== '-' && (
                            <div className="relative grid grid-cols-[auto_1fr] gap-6 mb-8 group">
                                <div className="flex flex-col items-center pt-2">
                                    <div className="w-8 h-8 rounded-full bg-surface-dark border border-white/20 flex items-center justify-center text-slate-300 z-10">
                                        <span className="material-symbols-outlined text-sm">hotel</span>
                                    </div>
                                </div>
                                <div className="glass-panel p-4 rounded-2xl transition-all duration-300 hover:bg-white/5">
                                    <h3 className="text-lg font-serif font-semibold text-white mb-2">Hospedagem</h3>
                                    <p className="text-sm text-slate-400 whitespace-pre-wrap">{activeDia['Hotel']}</p>
                                </div>
                            </div>
                        )}

                        {/* O que fazer */}
                        {(activeDia['Roteiro'] || activeDia['O que fazer']) && (
                            <div className="relative grid grid-cols-[auto_1fr] gap-6 mb-8 group">
                                <div className="flex flex-col items-center pt-2">
                                    <div className="w-8 h-8 rounded-full bg-surface-dark border border-white/20 flex items-center justify-center text-slate-300 z-10">
                                        <span className="material-symbols-outlined text-sm">explore</span>
                                    </div>
                                </div>
                                <div className="glass-panel p-4 rounded-2xl transition-all duration-300 hover:bg-white/5">
                                    <h3 className="text-lg font-serif font-semibold text-white mb-2">O que fazer</h3>
                                    <p className="text-sm text-slate-400 whitespace-pre-wrap">{activeDia['Roteiro'] || activeDia['O que fazer']}</p>
                                </div>
                            </div>
                        )}

                        {/* Timeline Items - Passeios + Local items sorted by time */}
                        {allTimelineItems.map((item, i) => {
                            if (item.type === 'passeio') {
                                const passeio = item.data;
                                return (
                                    <div key={`passeio-${i}`} className="relative grid grid-cols-[auto_1fr] gap-6 mb-8 group">
                                        <div className="flex flex-col items-center pt-2">
                                            <div className="w-8 h-8 rounded-full bg-surface-dark border border-emerald-500/50 flex items-center justify-center text-emerald-400 z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                                <span className="material-symbols-outlined text-sm">local_activity</span>
                                            </div>
                                        </div>
                                        <div className="glass-panel p-4 rounded-2xl transition-all duration-300 hover:bg-white/5">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-lg font-serif font-semibold text-white">{passeio['Passeio']}</h3>
                                                {passeio['Horário'] && (
                                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">{passeio['Horário']}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`text-xs px-2 py-0.5 rounded border ${passeio['Status'] === 'Pago' ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'}`}>
                                                    {passeio['Status'] || 'Agendado'}
                                                </span>
                                                {passeio['Valor (BRL)'] && <span className="text-xs text-slate-400">{passeio['Valor (BRL)']}</span>}
                                            </div>
                                            {passeio['O que é / Link'] && <p className="text-sm text-slate-400 line-clamp-2">{passeio['O que é / Link']}</p>}
                                        </div>
                                    </div>
                                );
                            }
                            // Local item
                            const local = item.data;
                            return (
                                <div key={`local-${i}`} className="relative grid grid-cols-[auto_1fr] gap-6 mb-8 group">
                                    <div className="flex flex-col items-center pt-2">
                                        <div className="w-8 h-8 rounded-full bg-surface-dark border border-cyan-500/50 flex items-center justify-center text-cyan-400 z-10 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                            <span className="material-symbols-outlined text-sm">add_task</span>
                                        </div>
                                    </div>
                                    <div className="glass-panel p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 border-l-2 border-l-cyan-500/40">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-serif font-semibold text-white">{local['O que fazer']}</h3>
                                            <div className="flex flex-col items-end gap-1.5">
                                                {local['Horário'] && (
                                                    <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md">{local['Horário']}</span>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteLocalItem(local)}
                                                    className="flex items-center gap-1 text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-400/10 px-1.5 py-0.5 rounded transition-colors"
                                                >
                                                    <span className="material-symbols-outlined !text-[14px]">close</span>
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 rounded border text-cyan-400 bg-cyan-400/10 border-cyan-400/20">Adicionado</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Dormir */}
                        {(activeDia['Horario pra dormir'] || activeDia['Horário pra dormir']) && (activeDia['Horario pra dormir'] !== '-') && (
                            <div className="relative grid grid-cols-[auto_1fr] gap-6 mb-8 group">
                                <div className="flex flex-col items-center pt-2">
                                    <div className="w-8 h-8 rounded-full bg-surface-dark border border-white/20 flex items-center justify-center text-slate-400 z-10">
                                        <span className="material-symbols-outlined text-sm">bedtime</span>
                                    </div>
                                </div>
                                <div className="glass-panel p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 opacity-80">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-serif font-semibold text-white">Boa noite!</h3>
                                        <span className="text-xs font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-md">{activeDia['Horario pra dormir'] || activeDia['Horário pra dormir']}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">Hora de descansar para o próximo dia.</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {view === 'guia' && (
                <GuideTab data={data} />
            )}
        </div>
    );
}
