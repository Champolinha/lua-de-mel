import React, { useState } from 'react';

export default function Logistica({ data }) {
    const [view, setView] = useState('flights');

    // States for adding an item
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({
        'Companhia Aérea': '', 'Trecho/Descrição': '', 'Código da Reserva': ''
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (addForm['Companhia Aérea']) {
            // Typically we'd append to App state, for simplicity let's just push it to the passed `data.passagens` array
            // Note: Data fetching mutates this array. In a real app we'd dispatch to parent.
            data.passagens.unshift({ ...addForm });
            setShowAddForm(false);
            setAddForm({ 'Companhia Aérea': '', 'Trecho/Descrição': '', 'Código da Reserva': '' });
        }
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
            <div className="sticky top-0 z-20 flex items-center justify-between p-4 pt-8 pb-4 glass-panel border-b border-white/5">
                <h2 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 text-slate-900 dark:text-white">Logística de Viagem</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex size-10 items-center justify-center rounded-full hover:bg-white/10 text-slate-900 dark:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">{showAddForm ? 'close' : 'add'}</span>
                </button>
            </div>

            {showAddForm && (
                <div className="glass-card p-4 m-4 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold mb-2">Adicionar Passagem (Local)</h3>
                    <form onSubmit={handleAdd} className="flex flex-col gap-3 text-sm">
                        <input className="p-2 rounded bg-surface-dark border border-white/10 text-white"
                            placeholder="Companhia Aérea" value={addForm['Companhia Aérea']} onChange={e => setAddForm({ ...addForm, 'Companhia Aérea': e.target.value })} required />
                        <input className="p-2 rounded bg-surface-dark border border-white/10 text-white"
                            placeholder="Trecho" value={addForm['Trecho/Descrição']} onChange={e => setAddForm({ ...addForm, 'Trecho/Descrição': e.target.value })} required />
                        <input className="p-2 rounded bg-surface-dark border border-white/10 text-white"
                            placeholder="Código Reserva" value={addForm['Código da Reserva']} onChange={e => setAddForm({ ...addForm, 'Código da Reserva': e.target.value })} required />
                        <button className="bg-primary text-white p-2 rounded-lg font-bold" type="submit">Salvar Localmente</button>
                    </form>
                </div>
            )}

            {/* Segmented Control */}
            <div className="sticky top-[68px] z-10 px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
                <div className="flex h-12 w-full items-center rounded-xl bg-slate-200 dark:bg-surface-dark p-1">
                    {['flights', 'hotels', 'lounges'].map((tab) => (
                        <label key={tab} className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView(tab)}>
                            <input checked={view === tab} className="peer sr-only" name="logistics-view" type="radio" value={tab} readOnly />
                            <span className="absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                            <span className="relative z-10 text-sm font-semibold text-slate-500 dark:text-white/60 peer-checked:text-primary dark:peer-checked:text-primary truncate capitalize">
                                {tab === 'flights' ? 'Voos' : tab === 'hotels' ? 'Hoteis' : 'Salas VIP'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-6 px-4">
                {view === 'flights' && (
                    <>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Seus Voos</h3>
                        </div>
                        {data.passagens && data.passagens.map((v, i) => (
                            <div key={i} className="relative overflow-hidden rounded-2xl glass-card p-5 group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                                    <span className="material-symbols-outlined text-[120px] text-white rotate-45">flight</span>
                                </div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                                                <span className="material-symbols-outlined">airlines</span>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-900 dark:text-white uppercase">{v['Companhia Aérea']}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left mt-2 border-b border-white/10 pb-4">
                                        <p className="text-xl font-bold">{v['Trecho/Descrição']}</p>
                                        {v['Valor BRL'] && <p className="text-sm mt-1 text-primary">{v['Valor BRL']}</p>}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex flex-col text-left">
                                            <span className="text-xs text-slate-500 dark:text-white/60">Reserva</span>
                                            <span className="text-sm font-bold text-blue-900 dark:text-blue-300 font-mono tracking-wider">{v['Código da Reserva'] || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {view === 'hotels' && (
                    <>
                        <div className="flex items-center justify-between pt-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Acomodações</h3>
                        </div>
                        {data.hoteis && data.hoteis.map((h, i) => h.Cidade ? (
                            <div key={i} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-white/5">
                                <div className="absolute inset-0">
                                    <img alt="Hotel" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                </div>
                                <div className="relative z-10 flex flex-col justify-end p-5 h-64">
                                    <div className="glass-panel p-4 rounded-xl border border-white/10">
                                        <h4 className="text-lg font-bold text-white leading-tight mb-2">{h['Nome do hotel']}</h4>
                                        <p className="text-xs text-white/70 flex items-center gap-1 mb-2">
                                            <span className="material-symbols-outlined text-sm">location_on</span> {h['Cidade']}
                                        </p>
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
                                            <span className="text-xs text-white/70">{h['Site da reserva']} • {h['Qtd de diárias']} diárias</span>
                                            <span className="text-lg font-bold text-white whitespace-nowrap">{h['Valor em BRL'] || h['Valor moeda local']}</span>
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Salas VIP</h3>
                        </div>
                        <div className="rounded-2xl bg-white dark:glass-card border border-slate-100 dark:border-white/5 p-2 shadow-sm">
                            {data.vip && data.vip.map((v, i) => v['Local'] ? (
                                <div key={i}>
                                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{v['Local']}</h4>
                                            <p className="text-xs text-slate-500 dark:text-white/60 truncate">{v['Data']}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{v['Horário']}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-white/60">{v['Duração/Observação']}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {i !== data.vip.length - 1 && <div className="my-1 h-px w-full bg-slate-100 dark:bg-white/5"></div>}
                                </div>
                            ) : null)}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
