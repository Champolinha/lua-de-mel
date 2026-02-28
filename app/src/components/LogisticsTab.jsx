import React, { useState } from 'react';
import { getHotelImage } from '../utils/images';
import LazyImage from './LazyImage';

export default function LogisticsTab({ data, view, setView, localData, setLocalData }) {
    const flights = data?.passagens || [];
    const hotels = data?.hoteis || [];
    const vip = data?.vip || []; return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {/* Segmented Control */}
            <div className="sticky top-0 z-40 px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
                <div className="flex h-12 w-full items-center rounded-2xl bg-slate-200 dark:bg-surface-dark p-1.5 shadow-inner">
                    <label className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView('flights')}>
                        <span className={`absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm transition-opacity ${view === 'flights' ? 'opacity-100' : 'opacity-0'}`}></span>
                        <span className={`relative z-10 text-sm font-semibold truncate ${view === 'flights' ? 'text-primary' : 'text-slate-500 dark:text-white/60'}`}>Vôos</span>
                    </label>
                    <label className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView('hotels')}>
                        <span className={`absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm transition-opacity ${view === 'hotels' ? 'opacity-100' : 'opacity-0'}`}></span>
                        <span className={`relative z-10 text-sm font-semibold truncate ${view === 'hotels' ? 'text-primary' : 'text-slate-500 dark:text-white/60'}`}>Hotéis</span>
                    </label>
                    <label className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView('lounges')}>
                        <span className={`absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm transition-opacity ${view === 'lounges' ? 'opacity-100' : 'opacity-0'}`}></span>
                        <span className={`relative z-10 text-sm font-semibold truncate ${view === 'lounges' ? 'text-primary' : 'text-slate-500 dark:text-white/60'}`}>VIP</span>
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-6 px-4 pt-2">

                {view === 'flights' && (
                    <>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Passagens Aéreas</h3>
                        </div>
                        {flights.map((f, i) => f['Companhia Aérea'] ? (
                            <div key={i} className="relative overflow-hidden rounded-2xl glass-card p-5 group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                                    <span className="material-symbols-outlined text-[120px] text-white rotate-45">flight</span>
                                </div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                                                <span className="material-symbols-outlined">airlines</span>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-900 dark:text-white">{f['Companhia Aérea'] || 'TBA'}</p>
                                                <p className="text-xs font-medium text-slate-500 dark:text-white/60">Voo</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">Confirmado</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-2">
                                        <div className="text-left flex-1">
                                            <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{f['Trecho/Descrição']}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-500 dark:text-white/60">Reserva</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{f['Código da Reserva'] || 'TBA'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null)}
                    </>
                )}

                {view === 'hotels' && (
                    <>
                        <div className="flex items-center justify-between pt-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Acomodações</h3>
                        </div>
                        {hotels.map((h, i) => h.Cidade ? (
                            <div key={i} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-white/5 mb-4">
                                <div className="absolute inset-0">
                                    <LazyImage className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={getHotelImage(h.Cidade)} alt={h.Cidade} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                </div>
                                <div className="relative z-10 flex flex-col justify-end p-5 h-64">
                                    <div className="glass-panel p-4 rounded-xl border border-white/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 mr-2">
                                                <h4 className="text-base font-bold text-white leading-tight">{h['Nome do hotel']}</h4>
                                                <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {h['Cidade']}
                                                </p>
                                            </div>
                                            {h['Café da manhã?'] && h['Café da manhã?'] !== 'Não' && (
                                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">☕ Café Incluso</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10">
                                            <div>
                                                <p className="text-[10px] text-white/50 uppercase tracking-wider">Check-In</p>
                                                <p className="text-sm font-semibold text-white">{h['Data de Chegada']}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-white/50 uppercase tracking-wider">Check-Out</p>
                                                <p className="text-sm font-semibold text-white">{h['Data de Saída']}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-white/70">{h['Site da reserva']} • {h['Qtd de diárias']} diária(s)</span>
                                            <span className="text-base font-bold text-white whitespace-nowrap">{h['Valor em BRL']}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null)}
                    </>
                )}

                {view === 'lounges' && (
                    <>
                        <div className="flex items-center justify-between pt-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Salas VIP / Escalas</h3>
                        </div>
                        <div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 p-2 shadow-sm">
                            {vip.map((v, i) => v['Local'] ? (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer mb-2">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                                        <LazyImage className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=300" alt="Lounge" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{v['Local']}</h4>
                                        <p className="text-xs text-slate-500 dark:text-white/60">{v['Data']}</p>
                                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                                            {v['Horário'] && (
                                                <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                    ⏰ {v['Horário']}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-500 dark:text-purple-300">
                                                {v['Duração/Observação'] || 'Escala'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : null)}
                            {vip.length === 0 && <p className="text-slate-400 p-4">Nenhuma sala VIP salva.</p>}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
