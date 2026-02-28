import React, { useState, useRef, useEffect } from 'react';

// Category options with icons
const CATEGORIES = [
    { value: 'checklist', label: 'Pendente / Tarefa', icon: 'assignment' },
    { value: 'roteiro', label: 'Item no Roteiro', icon: 'map' },
    { value: 'passagens', label: 'Passagem Aérea', icon: 'flight_takeoff' },
    { value: 'dicas', label: 'Dica de Bolso', icon: 'lightbulb' },
    { value: 'custos', label: 'Custo Extra', icon: 'payments' },
];

// Reusable Custom Select component
function CustomSelect({ value, onChange, options, label, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} className="relative">
            {label && <label className="block text-xs font-semibold text-white/70 mb-1.5">{label}</label>}
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center gap-3 bg-black/20 rounded-xl p-3 text-left transition-all duration-200 border ${open ? 'border-primary ring-1 ring-primary/50' : 'border-white/10 hover:border-white/20'}`}
            >
                {selected?.icon && (
                    <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                        <span className="material-symbols-outlined !text-[20px]">{selected.icon}</span>
                    </div>
                )}
                <span className={`flex-1 text-sm font-medium truncate ${selected ? 'text-white' : 'text-white/40'}`}>
                    {selected?.label || placeholder || 'Selecione...'}
                </span>
                <span className={`material-symbols-outlined !text-[20px] text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-surface-dark border border-white/10 shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="py-1.5 max-h-64 overflow-y-auto no-scrollbar">
                        {options.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 ${isSelected ? 'bg-primary/15' : 'hover:bg-white/5'}`}
                                >
                                    {opt.icon && (
                                        <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-white/50'}`}>
                                            <span className="material-symbols-outlined !text-[20px]">{opt.icon}</span>
                                        </div>
                                    )}
                                    <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>{opt.label}</span>
                                    {isSelected && (
                                        <span className="material-symbols-outlined !text-[20px] text-primary">check</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple custom select for shorter lists (cities, dates, status, cost category)
function SimpleSelect({ value, onChange, options, label, placeholder, icon }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} className="relative">
            {label && <label className="block text-xs font-semibold text-white/70 mb-1.5">{label}</label>}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center gap-2 bg-black/20 rounded-xl p-3 text-left transition-all duration-200 border ${open ? 'border-primary ring-1 ring-primary/50' : 'border-white/10 hover:border-white/20'}`}
            >
                {icon && (
                    <span className="material-symbols-outlined !text-[18px] text-white/40">{icon}</span>
                )}
                <span className={`flex-1 text-sm font-medium truncate ${selected ? 'text-white' : 'text-white/40'}`}>
                    {selected?.label || placeholder || 'Selecione...'}
                </span>
                <span className={`material-symbols-outlined !text-[20px] text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {open && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-surface-dark border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="py-1.5 max-h-48 overflow-y-auto no-scrollbar">
                        {options.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors duration-150 ${isSelected ? 'bg-primary/15' : 'hover:bg-white/5'}`}
                                >
                                    <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>{opt.label}</span>
                                    {isSelected && <span className="material-symbols-outlined !text-[18px] text-primary">check</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AddModal({ onClose, onAdd, data }) {
    const [category, setCategory] = useState('checklist');
    const [formData, setFormData] = useState({});

    const handleSave = (e) => {
        e.preventDefault();
        onAdd(category, formData);
        onClose();
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Extract unique options from itinerary (roteiro)
    const roteiro = data?.roteiro || [];
    const uniqueCities = [...new Set(roteiro.map(r => r.Cidade).filter(Boolean))].sort();
    const uniqueDates = [...new Set(roteiro.map(r => r.Data).filter(Boolean))];

    const inputClass = "w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/30";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative overflow-visible">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h2 className="text-xl font-bold text-white">Adicionar Novo</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSave} className="relative z-10 flex flex-col gap-4">
                    {/* Category Custom Select */}
                    <CustomSelect
                        label="Categoria"
                        value={category}
                        onChange={(val) => { setCategory(val); setFormData({}); }}
                        options={CATEGORIES}
                    />

                    {category === 'checklist' && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1.5">Nome da Tarefa</label>
                                <input required type="text" onChange={e => handleInputChange('Item', e.target.value)} className={inputClass} placeholder="Ex: Comprar adaptador universal" />
                            </div>
                            <SimpleSelect
                                label="Status"
                                value={formData['Status'] || 'Fazer'}
                                onChange={(val) => handleInputChange('Status', val)}
                                options={[
                                    { value: 'Fazer', label: 'Fazer' },
                                    { value: 'OK', label: 'OK' },
                                ]}
                                icon="flag"
                            />
                        </>
                    )}

                    {category === 'roteiro' && (
                        <>
                            <SimpleSelect
                                label="Data"
                                value={formData['Data'] || ''}
                                onChange={(val) => handleInputChange('Data', val)}
                                options={uniqueDates.map(d => ({ value: d, label: d }))}
                                placeholder="Selecione a Data..."
                                icon="calendar_month"
                            />
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1.5">Horário</label>
                                <input type="time" onChange={e => handleInputChange('Horário', e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1.5">O que fazer?</label>
                                <textarea required rows="3" onChange={e => handleInputChange('O que fazer', e.target.value)} className={inputClass} placeholder="Visitar torre, jantar no restaurante X..."></textarea>
                            </div>
                        </>
                    )}

                    {category === 'passagens' && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1.5">Companhia Aérea</label>
                                <input required type="text" onChange={e => handleInputChange('Companhia Aérea', e.target.value)} className={inputClass} placeholder="Ex: Emirates" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1.5">Trecho</label>
                                <input required type="text" onChange={e => handleInputChange('Trecho/Descrição', e.target.value)} className={inputClass} placeholder="GRU -> DXB" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1.5">Código da Reserva</label>
                                <input required type="text" onChange={e => handleInputChange('Código da Reserva', e.target.value)} className={`${inputClass} uppercase`} placeholder="XXXXXX" />
                            </div>
                        </>
                    )}

                    {category === 'dicas' && (
                        <>
                            <SimpleSelect
                                label="Lugar Relacionado"
                                value={formData['Lugar'] || ''}
                                onChange={(val) => handleInputChange('Lugar', val)}
                                options={uniqueCities.map(c => ({ value: c, label: c }))}
                                placeholder="Selecione um Lugar..."
                                icon="location_on"
                            />
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1.5">Dica/Observação</label>
                                <textarea required rows="4" onChange={e => handleInputChange('Dica', e.target.value)} className={inputClass} placeholder="Levar repelente para o parque XYZ..."></textarea>
                            </div>
                        </>
                    )}

                    {category === 'custos' && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-white/70 mb-1.5">Descrição</label>
                                <input required type="text" onChange={e => handleInputChange('Descrição', e.target.value)} className={inputClass} placeholder="Ex: Jantar em Tokyo" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Valor (R$)</label>
                                    <input required type="number" step="0.01" onChange={e => handleInputChange('Valor', parseFloat(e.target.value))} className={inputClass} placeholder="150.00" />
                                </div>
                                <SimpleSelect
                                    label="Categoria"
                                    value={formData['Categoria'] || 'Outros'}
                                    onChange={(val) => handleInputChange('Categoria', val)}
                                    options={[
                                        { value: 'Comida', label: 'Comida' },
                                        { value: 'Transporte', label: 'Transporte' },
                                        { value: 'Lembrancinha', label: 'Lembrancinha' },
                                        { value: 'Outros', label: 'Outros' },
                                    ]}
                                />
                            </div>
                        </>
                    )}

                    <div className="mt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">Salvar Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
