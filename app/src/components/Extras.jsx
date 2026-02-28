import React from 'react';
import { Sparkles, User } from 'lucide-react';

export default function Extras({ data }) {
    const skincare = data.skincare || [];
    const dados = data.dados || [];

    return (
        <div className="grid">
            <div className="glass-card">
                <h2 className="flex items-center gap-2">
                    <Sparkles size={24} color="var(--color-primary)" /> Rotina de Skincare
                </h2>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '1rem' }}>
                    {['Manhã', 'Noite', 'Semanal'].map(periodo => (
                        <div key={periodo} style={{ background: 'rgba(255,255,255,0.4)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-accent)', marginBottom: '0.8rem' }}>{periodo}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {skincare.filter(s => s['Quando?'] === periodo).map((s, i) => (
                                    <div key={i} className="flex justify-between items-center" style={{ padding: '0.5rem', background: 'var(--color-white)', borderRadius: 'var(--radius-sm)' }}>
                                        <div>
                                            <span style={{ fontWeight: 600, color: 'var(--color-primary)', marginRight: '0.5rem' }}>{s['Ordem']}</span>
                                            <strong style={{ fontSize: '0.9rem' }}>{s['Produto']}</strong>
                                            {s['Observação'] && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{s['Observação']}</p>}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', background: 'var(--glass-border)', padding: '2px 6px', borderRadius: '4px' }}>{s['Área']}</span>
                                    </div>
                                ))}
                                {skincare.filter(s => s['Quando?'] === periodo).length === 0 && (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Nenhum produto cadastrado.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card">
                <h2 className="flex items-center gap-2">
                    <User size={24} color="var(--color-primary)" /> Informações Pessoais
                </h2>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginTop: '1rem' }}>
                    {dados.map((d, i) => d['Informação Pessoal'] ? (
                        <div key={i} style={{ padding: '0.8rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{d['Informação Pessoal']}</span>
                            <strong style={{ color: 'var(--color-accent)' }}>{d['Valor']}</strong>
                        </div>
                    ) : null)}
                </div>
            </div>
        </div>
    );
}
