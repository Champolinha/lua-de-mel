import React from 'react';

export default function QuickChecklist({ pendingTasks, setActiveTab }) {
    return (
        <section>
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-bold text-slate-100">Checklist Rápido</h3>
                <span className="text-xs text-slate-400">{pendingTasks.length} Pendentes</span>
            </div>
            <div className="flex flex-col gap-3">
                {pendingTasks.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl glass-card p-4 hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => setActiveTab('extras')}>
                        <div className="flex-shrink-0">
                            <div className="h-6 w-6 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors flex items-center justify-center">
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-100 truncate">{item.Item || item[Object.keys(item)[0]]}</h4>
                            <p className="text-xs text-slate-400 truncate">Pendente</p>
                        </div>
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-surface-dark text-slate-400">
                            <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
                        </div>
                    </div>
                ))}
                {pendingTasks.length === 0 && (
                    <div className="flex items-center gap-4 rounded-xl glass-card p-4">
                        <span className="text-slate-400 text-sm">Tudo pronto por aqui! 🎉</span>
                    </div>
                )}
            </div>
        </section>
    );
}
