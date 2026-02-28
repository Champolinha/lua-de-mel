import React from 'react';
import useCosts from '../hooks/useCosts';

export default function CostsTab({ data, localData, setLocalData }) {
    const { totalBudget, totalSpent, remainingFunds, spentPercentage, breakdowns, extraCosts } = useCosts(data);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const handleDeleteCost = (index) => {
        setLocalData(prev => {
            const currentCustos = [...(prev.custos || [])];
            currentCustos.splice(index, 1);
            const next = { ...prev, custos: currentCustos };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            <div className="sticky top-0 z-40 px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-white/5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">Detalhamento de Custos</h3>
            </div>

            <div className="flex flex-col gap-6 px-4 pt-4">
                {/* Budget Status Cards */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-2xl glass-card p-5 border border-primary/20 bg-primary/5">
                        <p className="text-slate-400 text-sm font-medium mb-1">Status do Orçamento</p>
                        <div className="flex items-end gap-2 mb-4">
                            <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(remainingFunds)}</p>
                            <p className="text-xs text-slate-400 mb-1.5 pb-0.5">restantes</p>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.min(spentPercentage, 100)}%` }}></div>
                        </div>
                        <div className="mt-2 flex justify-between text-[11px] font-medium uppercase tracking-wider">
                            <span className="text-slate-500">Gasto: {formatCurrency(totalSpent)}</span>
                            <span className="text-primary">{spentPercentage.toFixed(1)}% utilizado</span>
                        </div>
                    </div>
                </div>

                {/* Categories List */}
                <div className="flex flex-col gap-3 mt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Por Categoria</h4>
                    {breakdowns.map((b, i) => (
                        <div key={i} className="flex items-center justify-between glass-card p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined !text-[18px]">
                                        {b.category.toLowerCase().includes('passagem') ? 'flight' : b.category.toLowerCase().includes('hotel') ? 'hotel' : b.category.toLowerCase().includes('comida') ? 'restaurant' : 'receipt_long'}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-white">{b.category}</span>
                            </div>
                            <span className="text-sm font-bold text-white">{formatCurrency(b.amount)}</span>
                        </div>
                    ))}
                </div>

                {/* Extra Costs Detailed List */}
                {extraCosts.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Custos Extras</h4>
                        {extraCosts.map((ec, i) => (
                            <div key={i} className="glass-card p-4 rounded-xl relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="text-sm font-bold text-white">{ec.Descrição || 'Sem descrição'}</h5>
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-tight">{ec.Categoria || 'Outros'}</p>
                                    </div>
                                    <p className="text-sm font-bold text-white">{formatCurrency(parseFloat(ec.Valor) || 0)}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteCost(i)}
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <span className="material-symbols-outlined !text-[14px]">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

