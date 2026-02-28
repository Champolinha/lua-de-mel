import React, { useState, useEffect } from 'react';

export default function CountdownHero({ tripDate }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = tripDate - now;
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((difference / 1000 / 60) % 60),
                    secs: Math.floor((difference / 1000) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [tripDate]);

    return (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/30 via-surface-dark to-background-dark p-8 border border-white/10 shadow-2xl">
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary/30 blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl"></div>
            <div className="relative z-10 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-md">
                    <span className="material-symbols-outlined !text-[16px] animate-pulse">flight_takeoff</span>
                    Próxima Viagem
                </div>
                <h1 className="text-4xl font-serif font-bold text-white mb-8 tracking-tight">Contagem Regressiva</h1>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { val: timeLeft.days, label: 'Dias' },
                        { val: timeLeft.hours, label: 'Horas' },
                        { val: timeLeft.mins, label: 'Mins' },
                        { val: timeLeft.secs, label: 'Segs' }
                    ].map((unit, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="flex h-20 w-full items-center justify-center rounded-[20px] bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
                                <span className="text-3xl font-display font-black text-white tabular-nums tracking-tighter">{unit.val}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unit.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
