import React from 'react';

export default function UtilsTab({ data, localData, setLocalData }) {
    const checklist = data?.checklist || [];
    const dados = data?.dados || [];

    const checkedItems = localData?.checkedItems || {};


    const toggleCheck = (id, defaultValue) => {
        setLocalData(prev => {
            const currentCheckedItems = prev.checkedItems || {};
            const currentValue = currentCheckedItems[id] !== undefined ? currentCheckedItems[id] : defaultValue;
            const next = {
                ...prev,
                checkedItems: {
                    ...currentCheckedItems,
                    [id]: !currentValue
                }
            };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });
    };



    // Group Checklist Items by Category
    const checklistByCategory = checklist.reduce((acc, item) => {
        const cat = item['Categoria'] || item['Category'] || 'Outros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});
    const completed = checklist.filter((item, index) => {
        const id = `check-${item['Item'] || item.Item}-${index}`;
        const remoteChecked = item['Status (✔/✘)'] === 'OK' || item['Status (✔/✘)'] === '✔' || item.Status === 'OK' || item.Status === '✔';
        return checkedItems[id] !== undefined ? checkedItems[id] : remoteChecked;
    });
    const pending = checklist.filter(i => !completed.includes(i));

    const categoryIcons = {
        'Documentos': 'badge',
        'Tecnologia': 'devices',
        'Energia': 'bolt',
        'Bagagem': 'luggage',
        'Financeiro': 'payments',
        'Aeroporto': 'flight_takeoff',
        'Outros': 'checklist',
    };

    return (
        <div className="relative flex h-full max-h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
            <div className="relative z-10 flex flex-col pt-4 px-6 pb-6 mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Utilidades e Preparo</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Controle de rotinas e checklist de documentos.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 space-y-8">

                {/* Documentation Status Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 mt-2">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">description</span>
                            Checklist & Tarefas
                        </h2>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{completed.length} Prontos</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {Object.entries(checklistByCategory).map(([category, items]) => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-base">{categoryIcons[category] || 'checklist'}</span>
                                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{category}</h3>
                                    <span className="text-xs text-slate-400">({items.filter(it => {
                                        const id = `check-${it['Item'] || it.Item}-${checklist.indexOf(it)}`;
                                        const remoteChecked = it['Status (✔/✘)'] === 'OK' || it['Status (✔/✘)'] === '✔' || it.Status === 'OK' || it.Status === '✔';
                                        return checkedItems[id] !== undefined ? checkedItems[id] : remoteChecked;
                                    }).length}/{items.length})</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {items.map((item, i) => {
                                        const taskName = item['Item'] || item.Item;
                                        const globalIdx = checklist.indexOf(item);
                                        const id = `check-${taskName}-${globalIdx}`;
                                        const remoteIsChecked = item['Status (✔/✘)'] === 'OK' || item['Status (✔/✘)'] === '✔' || item.Status === 'OK' || item.Status === '✔';
                                        const isChecked = checkedItems[id] !== undefined ? checkedItems[id] : remoteIsChecked;
                                        return (
                                            <div key={i} onClick={() => toggleCheck(id, remoteIsChecked)} className="relative overflow-hidden rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm p-3 cursor-pointer hover:border-primary/30 transition-all flex items-center gap-3">
                                                <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0" style={isChecked ? { borderColor: '#10b981', backgroundColor: '#10b981' } : {}}>
                                                    {isChecked && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                                </div>
                                                <span className={`text-sm font-medium text-slate-900 dark:text-white flex-1 transition-all ${isChecked ? 'line-through opacity-60' : ''}`}>{taskName}</span>
                                                {item['Observações'] && <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{item['Observações']}</span>}
                                                {isChecked && <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">OK</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}

