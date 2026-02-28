import React from 'react';

export default function Home({ data }) {
    // Calculate days until trip
    const tripDate = new Date('2026-03-07T00:00:00');
    const today = new Date();
    const diffTime = Math.max(0, tripDate - today);

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffTime / 1000 / 60) % 60);
    const secs = Math.floor((diffTime / 1000) % 60);

    // Parse costs (Custo Final is an array of arrays now because header is false)
    // Expected Row 0: ["", "R$ 48.343,83", "R$ 31.656,17"]
    // Row 1: ["Passagens", "R$ 29.582,99", ""]
    let totalEstimado = 'R$ 0,00';
    let totalGasto = 'R$ 0,00';
    let percentage = 0;

    if (data.custos && data.custos.length > 0) {
        totalEstimado = data.custos[0][1] || 'R$ 0,00';
        totalGasto = data.custos[0][2] || 'R$ 0,00';

        // Naive percentage calculation if currency string matches pattern
        try {
            const eFloat = parseFloat(totalEstimado.replace(/[R$\s.]/g, '').replace(',', '.'));
            const gFloat = parseFloat(totalGasto.replace(/[R$\s.]/g, '').replace(',', '.'));
            if (eFloat > 0) {
                percentage = Math.min(100, Math.round((gFloat / eFloat) * 100));
            }
        } catch (e) { }
    }

    // Pending checklist
    const pending = (data.checklist || []).filter(i => i.Status !== 'OK' && i.Status !== '✔').slice(0, 3);

    return (
        <main className="flex-1 flex flex-col gap-6 p-4 pb-24 relative z-10 overflow-y-auto no-scrollbar">
            {/* Header Info */}
            <div className="flex items-center justify-between pt-8 mb-2">
                <h2 className="text-slate-100 text-2xl font-bold tracking-tight">Nossa Lua de Mel</h2>
                <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors text-slate-100">
                    <span className="material-symbols-outlined !text-[24px]">notifications</span>
                    {pending.length > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background-dark"></span>}
                </button>
            </div>

            {/* Hero Section with Countdown */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-surface-dark to-background-dark p-6 border border-white/5 shadow-xl">
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>

                <div className="relative z-10 text-center">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider border border-primary/20">
                        <span className="material-symbols-outlined !text-[14px]">flight_takeoff</span>
                        Próxima Viagem
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-6 mt-2">Contagem Regressiva</h1>

                    <div className="grid grid-cols-4 gap-3">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner">
                                <span className="text-2xl font-bold text-white">{days.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400">Dias</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner">
                                <span className="text-2xl font-bold text-white">{hours.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400">Horas</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner">
                                <span className="text-2xl font-bold text-white">{mins.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400">Mins</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner">
                                <span className="text-2xl font-bold text-white">{secs.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400">Segs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Summary */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-slate-100">Resumo de Custos</h3>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 snap-x no-scrollbar">

                    <div className="snap-center shrink-0 w-[85%] sm:w-[300px] rounded-2xl glass-card p-5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-surface-dark border border-white/5 text-primary">
                                    <span className="material-symbols-outlined">account_balance_wallet</span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Custo Estimado Total</p>
                            <p className="text-3xl font-bold text-white tracking-tight">{totalEstimado}</p>

                            <div className="mt-4 h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="mt-2 text-xs text-slate-400 flex justify-between">
                                <span>{totalGasto} gasto</span>
                                <span>{percentage}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="snap-center shrink-0 w-[85%] sm:w-[300px] rounded-2xl glass-card p-5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-surface-dark border border-white/5 text-blue-400">
                                    <span className="material-symbols-outlined">savings</span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Categoria de Maior Peso</p>
                            <p className="text-2xl font-bold text-white tracking-tight">
                                {data.custos && data.custos[1] && data.custos[1][0] ? data.custos[1][0] : "N/A"}
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-xs text-slate-400">Valor Estimado:</span>
                                <span className="text-sm font-semibold text-white">
                                    {data.custos && data.custos[1] && data.custos[1][1] ? data.custos[1][1] : "R$ 0"}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Quick Checklist */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-slate-100">Checklist Rápido</h3>
                    <span className="text-xs text-slate-400">{pending.length} Pendentes</span>
                </div>
                <div className="flex flex-col gap-3">
                    {pending.length === 0 ? (
                        <div className="glass-card p-4 rounded-xl text-center text-slate-400 text-sm">Tudo concluído! 🎉</div>
                    ) : (
                        pending.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 rounded-xl glass-card p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors flex items-center justify-center bg-transparent"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-100 truncate">{item['Item']}</h4>
                                    <p className="text-xs text-slate-400 truncate">{item['Categoria']} {item['Observações'] ? `• ${item['Observações']}` : ''}</p>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-surface-dark text-slate-400">
                                    <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Action / Explore Widget (Using real images later, placeholder for now, styled specifically) */}
            <section className="rounded-2xl relative overflow-hidden h-40 group cursor-pointer mb-6">
                <img alt="Tropical Beach" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50" src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=1000&auto=format&fit=crop" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Explorar</p>
                            <h3 className="text-lg font-bold text-white">Singapura e Tailândia</h3>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
