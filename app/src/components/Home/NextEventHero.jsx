import React, { useState, useEffect } from 'react';

export default function NextEventHero({ nextEvent }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        if (!nextEvent) return;

        const timer = setInterval(() => {
            const now = new Date();
            const difference = nextEvent.date - now;
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((difference / 1000 / 60) % 60),
                    secs: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [nextEvent]);

    if (!nextEvent) {
        return (
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/30 via-surface-dark to-background-dark p-8 border border-white/10 shadow-2xl text-center">
                <p className="text-white/60 font-display">Nenhum evento próximo encontrado.</p>
            </div>
        );
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/30 via-surface-dark to-background-dark p-8 border border-white/10 shadow-2xl">
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary/30 blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl"></div>

            <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-md">
                    <span className="material-symbols-outlined !text-[16px] animate-pulse">{nextEvent.icon || 'event'}</span>
                    Próximo Evento
                </div>

                <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">{nextEvent.title}</h1>
                <p className="text-slate-400 text-sm mb-6 flex items-center justify-center gap-2">
                    <span className="font-semibold text-primary">{formatDate(nextEvent.date)}</span>
                    <span className="opacity-20 text-white">|</span>
                    <span className="font-semibold text-white">{formatTime(nextEvent.date)}</span>
                </p>

                <div className="grid grid-cols-4 gap-3">
                    {[
                        { val: timeLeft.days, label: 'Dias' },
                        { val: timeLeft.hours, label: 'Hs' },
                        { val: timeLeft.mins, label: 'Min' },
                        { val: timeLeft.secs, label: 'Seg' }
                    ].map((unit, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className="flex h-16 w-full items-center justify-center rounded-[20px] bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
                                <span className="text-2xl font-display font-black text-white tabular-nums tracking-tighter">{unit.val}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{unit.label}</span>
                        </div>
                    ))}
                </div>

                {nextEvent.details && (
                    <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-slate-400 font-medium truncate">{nextEvent.details}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
