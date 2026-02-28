import React, { useState, useEffect } from 'react';
import useCosts from '../hooks/useCosts';
import CountdownHero from './Home/CountdownHero';
import BudgetSummary from './Home/BudgetSummary';
import QuickChecklist from './Home/QuickChecklist';

export default function HomeTab({ data, tripDate, setActiveTab, setLogisticsView, localData, setLocalData, onAddCost }) {
    const [showCostModal, setShowCostModal] = useState(false);
    const [editingCostIndex, setEditingCostIndex] = useState(null);
    const [costForm, setCostForm] = useState({ Descrição: '', Valor: '', Categoria: 'Outros' });

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
        setCostForm({ Descrição: '', Valor: '', Categoria: 'Outros' });
        setShowCostModal(true);
    };

    const handleOpenEditCost = (index) => {
        const cost = extraCosts[index];
        setCostForm({
            Descrição: cost.Descrição || '',
            Valor: cost.Valor || '',
            Categoria: cost.Categoria || 'Outros'
        });
        setEditingCostIndex(index);
        setShowCostModal(true);
    };

    const handleSaveCost = (e) => {
        e.preventDefault();
        const newCost = {
            Descrição: costForm.Descrição,
            Valor: parseFloat(costForm.Valor) || 0,
            Categoria: costForm.Categoria
        };

        if (editingCostIndex !== null) {
            setLocalData(prev => {
                const currentCustos = [...(prev.custosExtras || [])];
                currentCustos[editingCostIndex] = newCost;
                const next = { ...prev, custosExtras: currentCustos };
                localStorage.setItem('tripData', JSON.stringify(next));
                return next;
            });
        } else {
            onAddCost(newCost);
        }

        setShowCostModal(false);
        setCostForm({ Descrição: '', Valor: '', Categoria: 'Outros' });
        setEditingCostIndex(null);
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
        <div className="flex-1 flex flex-col gap-6 p-4 pb-24">
            <CountdownHero tripDate={tripDate} />

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

            {/* Inspiration / Explore Small Widget */}
            <section className="rounded-2xl relative overflow-hidden h-40 group cursor-pointer" onClick={() => setActiveTab('dicas')}>
                <img alt="Destinos asiáticos de lua de mel" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Explorar</p>
                            <h3 className="text-lg font-bold text-white">Dicas & Destinos</h3>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </section>

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
                                    <label className="block text-xs font-semibold text-white/70 mb-1">Valor (R$)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={costForm.Valor}
                                        onChange={e => setCostForm(prev => ({ ...prev, Valor: e.target.value }))}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder="150.00"
                                    />
                                </div>
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
