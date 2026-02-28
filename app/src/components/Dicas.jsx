import React, { useState } from 'react';

export default function Dicas({ data, addData }) {
    const cidades = data.cidades || [];
    const palavras = data.palavras || [];
    const restaurantes = data.restaurantes || [];

    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({ 'Restaurante': '', 'Dubai': '', 'Singapura': '' });

    const handleAdd = (e) => {
        e.preventDefault();
        if (addForm.Restaurante) {
            addData('restaurantes', { ...addForm });
            setShowAddForm(false);
            setAddForm({ 'Restaurante': '', 'Dubai': '', 'Singapura': '' });
        }
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
            <div className="sticky top-0 z-20 flex items-center justify-between p-4 pt-8 pb-4 glass-panel border-b border-white/5">
                <h2 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 text-slate-900 dark:text-white">Dicas & Tracking</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex size-10 items-center justify-center rounded-full hover:bg-white/10 text-slate-900 dark:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">{showAddForm ? 'close' : 'add'}</span>
                </button>
            </div>

            {showAddForm && (
                <div className="glass-card p-4 m-4 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold mb-2">Adicionar Fast Food Tracker</h3>
                    <form onSubmit={handleAdd} className="flex flex-col gap-3 text-sm">
                        <input className="p-2 rounded bg-surface-dark border border-white/10 text-white"
                            placeholder="Restaurante" value={addForm.Restaurante} onChange={e => setAddForm({ ...addForm, Restaurante: e.target.value })} required />
                        <input className="p-2 rounded bg-surface-dark border border-white/10 text-white"
                            placeholder="Em Dubai? Onde?" value={addForm.Dubai} onChange={e => setAddForm({ ...addForm, Dubai: e.target.value })} />
                        <input className="p-2 rounded bg-surface-dark border border-white/10 text-white"
                            placeholder="Em Singapura? Onde?" value={addForm.Singapura} onChange={e => setAddForm({ ...addForm, Singapura: e.target.value })} />
                        <button className="bg-primary text-white p-2 rounded-lg font-bold" type="submit">Salvar Localmente</button>
                    </form>
                </div>
            )}

            <div className="flex flex-col gap-6 px-4 mt-6">

                {/* Ciadads Info */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Explorar Destinos</h3>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-2 snap-x no-scrollbar">
                        {cidades.map((c, i) => c['Cidade / País'] ? (
                            <div key={i} className="snap-center shrink-0 w-[280px] rounded-2xl glass-card relative overflow-hidden group border border-white/5">
                                <div className="h-24 bg-gradient-to-br from-primary/30 to-surface-dark relative">
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-white shadow-sm">explore</span>
                                        <h4 className="text-lg font-bold text-white leading-tight shadow-sm">{c['Cidade / País']}</h4>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="inline-flex items-center rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-300 border border-blue-500/20">{c['Temperatura média']}</span>
                                        <span className="text-xs text-slate-400">{c['Clima']}</span>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Roupas</h5>
                                        <p className="text-sm text-slate-300 mb-3">{c['Roupas gerais recomendadas']}</p>
                                        <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Templos</h5>
                                        <p className="text-sm text-slate-300">{c['Roupas adequadas para templos']}</p>
                                    </div>
                                </div>
                            </div>
                        ) : null)}
                    </div>
                </section>

                {/* Tracking Fast Foods */}
                <section>
                    <div className="flex items-center justify-between mb-4 mt-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tracker de Restaurantes</h3>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 p-2 shadow-sm">
                        {restaurantes.map((r, i) => r['Restaurante'] ? (
                            <div key={i} className={`p-3 hover:bg-white/5 transition-colors ${i !== restaurantes.length - 1 ? 'border-b border-white/5' : ''}`}>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate mb-2">{r['Restaurante']}</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {r['Dubai'] && <div><span className="text-slate-500 block">Dubai</span><span className="text-slate-200 truncate">{r['Dubai'] === '✘' ? 'Não tem' : r['Dubai']}</span></div>}
                                    {r['Singapura'] && <div><span className="text-slate-500 block">Singapura</span><span className="text-slate-200 truncate">{r['Singapura'] === '✘' ? 'Não tem' : r['Singapura']}</span></div>}
                                </div>
                            </div>
                        ) : null)}
                    </div>
                </section>

                {/* Palavras / Traduções */}
                <section>
                    <div className="flex items-center justify-between mb-4 mt-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tradutor / Sobrevivência</h3>
                    </div>
                    <div className="gap-3 grid">
                        {palavras.map((p, i) => p['País / Região'] ? (
                            <div key={i} className="glass-card rounded-2xl p-4 border border-white/5 relative overflow-hidden">
                                <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-white">translate</span></div>
                                <h4 className="text-lg font-bold text-white mb-1">{p['País / Região']}</h4>
                                <span className="text-xs text-primary mb-3 block">{p['Idioma']}</span>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-3 relative z-10">
                                    <div>
                                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Oi</span>
                                        <span className="text-slate-200 font-medium">{p['Oi']}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Obrigado(a)</span>
                                        <span className="text-slate-200 font-medium">{p['Obrigado(a)']}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Banheiro</span>
                                        <span className="text-slate-200 font-medium">{p['Banheiro'] || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Por Favor</span>
                                        <span className="text-slate-200 font-medium">{p['Por favor'] || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : null)}
                    </div>
                </section>

            </div>
        </div>
    );
}
