import React, { useState, useEffect } from 'react';
import useCosts from '../hooks/useCosts';
import { extractFloat } from '../utils/numbers';
import { SUPPORTED_CURRENCIES, fetchExchangeRates, getBRLRate } from '../utils/currencies';

export default function CostsTab({ data, localData, setLocalData, onDeleteCost, onRefresh, refreshing }) {
    const { totalBudget, totalSpent, remainingFunds, spentPercentage, breakdowns, extraCosts } = useCosts(data);
    const [view, setView] = useState('summary'); // 'summary' or 'rates'
    const [exchangeRates, setExchangeRates] = useState(null);

    useEffect(() => {
        async function loadRates() {
            const rates = await fetchExchangeRates();
            setExchangeRates(rates);
        }
        loadRates();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const handleDeleteCost = (costToDelete) => {
        onDeleteCost(costToDelete);
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-48">
            <div className="sticky top-0 z-40 px-4 py-4 bg-[#211116] flex items-center gap-3">
                <div className="flex h-12 flex-1 items-center rounded-2xl bg-slate-200 dark:bg-surface-dark p-1.5 shadow-inner">
                    <label className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView('summary')}>
                        <span className={`absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm transition-opacity ${view === 'summary' ? 'opacity-100' : 'opacity-0'}`}></span>
                        <span className={`relative z-10 text-sm font-semibold truncate ${view === 'summary' ? 'text-primary' : 'text-slate-500 dark:text-white/60'}`}>Resumo Geral</span>
                    </label>
                    <label className="relative flex flex-1 cursor-pointer h-full items-center justify-center rounded-lg px-2 transition-all duration-200" onClick={() => setView('rates')}>
                        <span className={`absolute inset-0 rounded-lg bg-white dark:bg-white/10 shadow-sm transition-opacity ${view === 'rates' ? 'opacity-100' : 'opacity-0'}`}></span>
                        <span className={`relative z-10 text-sm font-semibold truncate ${view === 'rates' ? 'text-primary' : 'text-slate-500 dark:text-white/60'}`}>Cotações</span>
                    </label>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="flex size-12 items-center justify-center rounded-2xl bg-slate-200 dark:bg-surface-dark border border-slate-300 dark:border-white/5 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
                    title="Atualizar dados da planilha"
                >
                    <span className={`material-symbols-outlined !text-xl ${refreshing ? 'animate-spin' : ''}`}>sync</span>
                </button>
            </div>

            <div className="flex flex-col gap-6 px-4 pt-4">
                {view === 'summary' ? (
                    <>
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
                                            <div className="text-right flex flex-col items-end">
                                                <p className="text-sm font-bold text-white">{formatCurrency(extractFloat(ec.Valor))}</p>
                                                {ec.Moeda && ec.Moeda !== 'BRL' && (
                                                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                                                        {ec.ValorOriginal} {ec.Moeda}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCost(ec)}
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <span className="material-symbols-outlined !text-[14px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* Exchange Rates View */
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Cotações do Dia (Base BRL)</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {SUPPORTED_CURRENCIES.filter(c => c.value !== 'BRL').map((currency) => {
                                const rate = getBRLRate(currency.value, exchangeRates);
                                return (
                                    <div key={currency.value} className="glass-card p-4 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-2xl">
                                                {currency.flag}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white tracking-wide">{currency.label}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currency.value}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-primary">R$ {rate > 0 ? rate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '---'}</p>
                                            <p className="text-[10px] text-slate-500">por 1 unidade</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="mt-4 text-[10px] text-slate-500 italic text-center">As cotações são atualizadas em tempo real via Open Exchange Rates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

