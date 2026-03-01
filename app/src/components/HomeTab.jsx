import React, { useState, useEffect } from 'react';
import useCosts from '../hooks/useCosts';
import NextEventHero from './Home/NextEventHero';
import BudgetSummary from './Home/BudgetSummary';
import QuickChecklist from './Home/QuickChecklist';
import { SUPPORTED_CURRENCIES, fetchExchangeRates, convertToBRL, getBRLRate } from '../utils/currencies';
import { findNextEvent } from '../utils/itinerary';

export default function HomeTab({ data, tripDate, setActiveTab, setLogisticsView, localData, setLocalData, onAddCost, onDeleteCost }) {
    const [showCostModal, setShowCostModal] = useState(false);
    const [editingCostIndex, setEditingCostIndex] = useState(null);
    const [costForm, setCostForm] = useState({ Descrição: '', Valor: '', Categoria: 'Outros', Moeda: 'BRL' });
    const [exchangeRates, setExchangeRates] = useState(null);

    useEffect(() => {
        async function loadRates() {
            const rates = await fetchExchangeRates();
            setExchangeRates(rates);
        }
        loadRates();
    }, []);

    const { totalBudget, totalSpent, remainingFunds, spentPercentage, breakdowns, extraCosts } = useCosts(data);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    // Checklist computation
    const pendingTasks = data?.checklist?.filter(i => {
        const status = i['Status (✔/✘)'] || i.Status || '';
        return status !== 'OK' && status !== '✔';
    }) || [];

    // --- Cost management functions ---
    const handleOpenAddCost = () => {
        setEditingCostIndex(null);
        setCostForm({ Descrição: '', Valor: '', Categoria: 'Outros', Moeda: 'BRL' });
        setShowCostModal(true);
    };

    const handleOpenEditCost = (index) => {
        const cost = extraCosts[index];
        setCostForm({
            Descrição: cost.Descrição || '',
            Valor: cost.ValorOriginal || cost.Valor || '',
            Categoria: cost.Categoria || 'Outros',
            Moeda: cost.Moeda || 'BRL'
        });
        setEditingCostIndex(index);
        setShowCostModal(true);
    };

    const remoteExtrasCount = data?.custosExtrasRemotos?.length ?? 0;

    const handleSaveCost = (e) => {
        e.preventDefault();
        const newCost = {
            Descrição: costForm.Descrição,
            Valor: parseFloat(costForm.Valor) || 0,
            Categoria: costForm.Categoria,
            Moeda: costForm.Moeda || 'BRL'
        };

        if (editingCostIndex !== null) {
            // Só persiste edição em itens locais (índice >= quantidade de remotos)
            if (editingCostIndex >= remoteExtrasCount) {
                const localIndex = editingCostIndex - remoteExtrasCount;
                setLocalData(prev => {
                    const currentCustos = [...(prev.custos || [])];
                    if (localIndex >= 0 && localIndex < currentCustos.length) {
                        currentCustos[localIndex] = newCost;
                    }
                    const next = { ...prev, custos: currentCustos };
                    localStorage.setItem('tripData', JSON.stringify(next));
                    return next;
                });
            }
        } else {
            onAddCost(newCost);
        }

        setShowCostModal(false);
        setCostForm({ Descrição: '', Valor: '', Categoria: 'Outros' });
        setEditingCostIndex(null);
    };

    const handleDeleteCost = (costToDelete) => {
        onDeleteCost(costToDelete);
    };

    const nextEvent = findNextEvent(data);

    return (
        <div className="flex-1 flex flex-col gap-6 p-4 pb-48">
            <NextEventHero nextEvent={nextEvent} />

            <BudgetSummary
                totalBudget={totalBudget}
                totalSpent={totalSpent}
                remainingFunds={remainingFunds}
                spentPercentage={spentPercentage}
                breakdowns={breakdowns}
                extraCosts={extraCosts}
                setLogisticsView={setLogisticsView}
                setActiveTab={setActiveTab}
                formatCurrency={formatCurrency}
                handleOpenEditCost={handleOpenEditCost}
                handleDeleteCost={handleDeleteCost}
            />

            <QuickChecklist
                pendingTasks={pendingTasks}
                setActiveTab={setActiveTab}
            />
            {/* Cost Add/Edit Modal */}
            {showCostModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-surface-dark border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h2 className="text-xl font-bold text-white">
                                {editingCostIndex !== null ? 'Editar Custo' : 'Adicionar Custo'}
                            </h2>
                            <button onClick={() => setShowCostModal(false)} className="text-white/50 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveCost} className="relative z-10 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1">Descrição</label>
                                <input
                                    required
                                    type="text"
                                    value={costForm.Descrição}
                                    onChange={e => setCostForm(prev => ({ ...prev, Descrição: e.target.value }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="Ex: Jantar em Tokyo"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-white/70 mb-1">Moeda</label>
                                    <select
                                        value={costForm.Moeda}
                                        onChange={e => setCostForm(prev => ({ ...prev, Moeda: e.target.value }))}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                                    >
                                        {SUPPORTED_CURRENCIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.flag} {c.value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-white/70 mb-1">Valor Original</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={costForm.Valor}
                                        onChange={e => setCostForm(prev => ({ ...prev, Valor: e.target.value }))}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {costForm.Moeda !== 'BRL' && parseFloat(costForm.Valor) > 0 && (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Valor em Real (Estimado)</span>
                                        <span className="text-sm font-bold text-white">
                                            R$ {convertToBRL(parseFloat(costForm.Valor), costForm.Moeda, exchangeRates).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-white/40 text-right">
                                        1 {costForm.Moeda} = R$ {getBRLRate(costForm.Moeda, exchangeRates).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1">Categoria</label>
                                <select
                                    value={costForm.Categoria}
                                    onChange={e => setCostForm(prev => ({ ...prev, Categoria: e.target.value }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="Comida">Comida</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Lembrancinha">Lembrancinha</option>
                                    <option value="Passeio">Passeio</option>
                                    <option value="Hospedagem">Hospedagem</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <button type="button" onClick={() => setShowCostModal(false)} className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                                    {editingCostIndex !== null ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
