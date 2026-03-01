import React from 'react';
import { extractFloat } from '../../utils/numbers';

export default function BudgetSummary({
    totalBudget,
    totalSpent,
    remainingFunds,
    spentPercentage,
    breakdowns,
    extraCosts,
    setLogisticsView,
    setActiveTab,
    formatCurrency,
    handleOpenEditCost,
    handleDeleteCost
}) {
    return (
        <section>
            <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Resumo de Custos</h3>
                <div className="h-[2px] flex-1 bg-white/5 mx-4 rounded-full"></div>
            </div>
            <div className="flex overflow-x-auto gap-5 py-4 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
                {/* Total Budget Card */}
                <div className="snap-center shrink-0 w-[88%] sm:w-[320px] rounded-[28px] glass-card p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(232,48,110,0.2)]">
                                <span className="material-symbols-outlined !text-[28px]">account_balance_wallet</span>
                            </div>
                            <button
                                onClick={() => { setLogisticsView('costs'); setActiveTab('logistica'); }}
                                className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 hover:bg-emerald-400/20 transition-all uppercase tracking-widest shadow-lg shadow-emerald-400/10"
                            >
                                Detalhes
                            </button>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">Orçamento Total</p>
                        <p className="text-3xl font-display font-black text-white tracking-tight mb-6">{formatCurrency(totalBudget)}</p>

                        <div className="space-y-3">
                            <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(232,48,110,0.3)] ${spentPercentage > 100 ? 'bg-error' : spentPercentage > 85 ? 'bg-warning' : 'bg-primary'}`}
                                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Investido</span>
                                    <span className="text-sm font-bold text-white">{formatCurrency(totalSpent)}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-black ${spentPercentage > 100 ? 'text-error' : 'text-primary'}`}>{spentPercentage.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remaining Card */}
                <div className="snap-center shrink-0 w-[88%] sm:w-[320px] rounded-[28px] glass-card p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                <span className="material-symbols-outlined !text-[28px]">savings</span>
                            </div>
                            {remainingFunds < 0 && (
                                <span className="text-[10px] font-black text-error bg-error/10 px-3 py-1.5 rounded-full border border-error/20 uppercase tracking-widest">Excedido</span>
                            )}
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">Total Restante</p>
                        <p className={`text-3xl font-display font-black tracking-tight ${remainingFunds < 0 ? 'text-error' : 'text-white'}`}>
                            {formatCurrency(remainingFunds)}
                        </p>
                        <div className="mt-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dinheiro para a viagem</span>
                        </div>
                    </div>
                </div>

                {/* Breakdown Cards */}
                {breakdowns.map((b, i) => (
                    <div key={i} className="snap-center shrink-0 w-[75%] sm:w-[260px] rounded-[28px] glass-card p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-slate-300">
                                    <span className="material-symbols-outlined !text-[24px]">{b.category.toLowerCase().includes('passagem') ? 'flight' : b.category.toLowerCase().includes('hotel') ? 'hotel' : b.category.toLowerCase().includes('comida') ? 'restaurant' : 'receipt_long'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] mb-1">{b.category}</p>
                                <p className="text-2xl font-display font-bold text-white tracking-tight">{formatCurrency(b.amount)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Extra Costs List (editable) */}
            {extraCosts.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-slate-300 px-1">Custos Extras Adicionados</h4>
                    {extraCosts.map((ec, i) => (
                        <div key={i} className="flex items-center gap-3 glass-card rounded-xl p-3 group">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{ec.Descrição || 'Sem descrição'}</p>
                                <p className="text-xs text-slate-400">{ec.Categoria || 'Outros'} • {formatCurrency(extractFloat(ec.Valor))}</p>
                            </div>
                            <button
                                onClick={() => handleOpenEditCost(i)}
                                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary/20 text-slate-400 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined !text-[16px]">edit</span>
                            </button>
                            <button
                                onClick={() => handleDeleteCost(ec)}
                                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            >
                                <span className="material-symbols-outlined !text-[16px]">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
