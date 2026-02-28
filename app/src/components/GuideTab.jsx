import React, { useState } from 'react';
import { getCityImage } from '../utils/images';
import LazyImage from './LazyImage';

export default function GuideTab({ data }) {
    const cidades = data?.cidades || [];
    const palavras = data?.palavras || [];
    const restaurantes = data?.restaurantes || [];

    const getCountry = (name) => {
        if (!name) return '';
        // Names with " – " separator: use the part after it as the country
        const parts = name.split(' – ');
        if (parts.length > 1) return parts[1].trim();
        // Special standalone city-states and regions
        if (name.includes('Pequim') || name.includes('Beijing')) return 'China';
        if (name.includes('Macau')) return 'China';
        if (name.includes('Hong Kong')) return 'Hong Kong';
        if (name.includes('Singapura') || name.includes('Singapore')) return 'Singapura';
        // City is its own country (e.g. "Singapura", "Hong Kong")
        return name.trim();
    };

    // Map country to its relevant city names for filtering restaurants
    const getCountryCityNames = (country) => {
        const c = (country || '').toLowerCase();
        const names = [];
        if (c.includes('singapura') || c.includes('singapore')) names.push('singapura', 'singapore');
        if (c.includes('tailândia') || c.includes('thailand')) names.push('bangkok', 'krabi', 'phi phi', 'tailândia', 'thailand', 'bkk');
        if (c.includes('filipinas') || c.includes('philippines')) names.push('coron', 'filipinas', 'philippines', 'manila');
        if (c.includes('hong kong')) names.push('hong kong', 'hk');
        if (c.includes('china')) names.push('macau', 'pequim', 'beijing', 'china');
        if (c.includes('coreia') || c.includes('korea') || c.includes('seul')) names.push('seul', 'seoul', 'coreia', 'korea');
        if (c.includes('japão') || c.includes('japan') || c.includes('tóquio') || c.includes('tokyo')) names.push('tóquio', 'tokyo', 'japão', 'japan');
        if (c.includes('eau') || c.includes('dubai') || c.includes('abu dhabi')) names.push('dubai', 'abu dhabi', 'eau', 'uae');
        if (c.includes('catar') || c.includes('qatar') || c.includes('doha')) names.push('doha', 'catar', 'qatar');
        return names;
    };

    // Map country to its "País / Região" values in the dictionary for filtering
    const getCountryRegions = (country) => {
        const c = (country || '').toLowerCase();
        if (c.includes('singapura') || c.includes('singapore')) return ['singapura', 'singapore', 'sg'];
        if (c.includes('tailândia') || c.includes('thailand')) return ['tailândia', 'thailand', 'thai', 'th'];
        if (c.includes('filipinas') || c.includes('philippines')) return ['filipinas', 'philippines', 'ph'];
        if (c.includes('hong kong')) return ['hong kong', 'hk'];
        if (c.includes('china')) return ['china', 'cn', 'pequim', 'beijing', 'macau'];
        if (c.includes('coreia') || c.includes('korea') || c.includes('seul')) return ['coreia', 'korea', 'kr', 'seul', 'seoul'];
        if (c.includes('japão') || c.includes('japan') || c.includes('tóquio') || c.includes('tokyo')) return ['japão', 'japan', 'jp', 'tóquio', 'tokyo'];
        if (c.includes('eau') || c.includes('dubai') || c.includes('abu dhabi')) return ['eau', 'uae', 'dubai', 'abu dhabi', 'emirados'];
        if (c.includes('catar') || c.includes('qatar') || c.includes('doha')) return ['catar', 'qatar', 'doha', 'qa'];
        return [];
    };



    // Visa links per city
    const visaLinks = {
        'Singapura': 'https://eservices.ica.gov.sg/sgarrivalcard/',
        'Krabi / Phi Phi – Tailândia': 'https://tdac.immigration.go.th/arrival-card/',
        'Bangkok – Tailândia': 'https://tdac.immigration.go.th/arrival-card/',
        'Coron – Filipinas': 'https://etravel.gov.ph/',
        'Hong Kong': 'https://www.gov.hk/en/residents/immigration/control/clearance.htm',
        'Macau': 'https://www.immd.gov.hk/eng/service/travel_document/visa_free_access.html',
        'Pequim': 'https://s.nia.gov.cn/ArrivalCardFillingPC/',
        'Seul – Coreia do Sul': 'https://www.k-eta.go.kr/portal/newapply/index.do',
        'Tóquio – Japão': 'https://www.vjw.digital.go.jp/main/#/vjwplo001',
        'Dubai – EAU': null,
        'Abu Dhabi – EAU': null,
        'Doha – Catar': 'https://hayya.qa/en',
    };

    const getVisaLink = (cityName) => {
        if (!cityName) return null;
        // Direct match
        if (visaLinks[cityName] !== undefined) return visaLinks[cityName];
        // Partial match
        const key = Object.keys(visaLinks).find(k => cityName.includes(k) || k.includes(cityName));
        return key !== undefined ? visaLinks[key] : null;
    };

    if (!cidades || cidades.length === 0) return <div className="p-4 text-white">Nenhuma cidade encontrada na planilha.</div>;

    // Dynamically find mapping keys from transposed data
    const cityKey = 'Cidade / País';
    const tempKey = Object.keys(cidades[0]).find(k => k.startsWith('Temperatura')) || 'Temperatura média';
    const climateKey = Object.keys(cidades[0]).find(k => k.startsWith('Clima')) || 'Clima';
    const clothesGenKey = Object.keys(cidades[0]).find(k => k.startsWith('Roupas gerais')) || 'Roupas gerais recomendadas';
    const clothesTemKey = Object.keys(cidades[0]).find(k => k.startsWith('Roupas adequadas') || k.startsWith('Roupas para templos')) || 'Roupas adequadas para templos';
    const moneyKey = Object.keys(cidades[0]).find(k => k.startsWith('Moeda') && !k.includes('USD') && !k.includes('BRL')) || 'Moeda';
    const currencyKey = Object.keys(cidades[0]).find(k => k.startsWith('Moeda') && !k.includes('USD') && !k.includes('BRL') && !k.includes('Espé')) || 'Moeda';
    const visaKey = Object.keys(cidades[0]).find(k => k.startsWith('Visto') && k.includes('🇧🇷')) || 'Visto 🇧🇷';
    const fusoKey = Object.keys(cidades[0]).find(k => k.startsWith('Fuso')) || 'Fuso (mar/26)';

    const validCidades = cidades.filter(c => c[cityKey]);
    const countries = [...new Set(validCidades.map(c => getCountry(c[cityKey])))];

    // Default to the first country available
    const [activeCountry, setActiveCountry] = useState(countries[0] || '');

    if (validCidades.length === 0) return <div className="p-4 text-white">Nenhuma cidade encontrada (Verifique o formato da planilha).</div>;

    const countryCities = validCidades.filter(c => getCountry(c[cityKey]) === activeCountry);
    const heroImage = getCityImage(activeCountry);

    // Filter restaurants: only show restaurants that are available in the selected country's cities
    const countryCityNames = getCountryCityNames(activeCountry);
    const filteredRestaurants = restaurantes
        .filter(r => r['Restaurante'])
        .map(r => {
            // Check if this restaurant has locations matching the current country
            const matchingLocations = Object.entries(r)
                .filter(([city, val]) => {
                    if (city === 'Restaurante') return false;
                    if (!val || val === '❌') return false;
                    const cityLower = city.toLowerCase();
                    return countryCityNames.some(name => cityLower.includes(name));
                });
            return { ...r, matchingLocations };
        })
        .filter(r => r.matchingLocations.length > 0);

    // Filter dictionary: only show languages relevant to the selected country
    const countryRegions = getCountryRegions(activeCountry);
    const filteredPalavras = palavras.filter(p => {
        if (!p['País / Região']) return false;
        const pais = (p['País / Região'] || '').toLowerCase();
        return countryRegions.some(region => pais.includes(region));
    });

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24">
            {/* Country Selector (Horizontal Scroll) - Fixed at top */}
            <div className="sticky top-0 z-[40] px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar w-full bg-background-dark/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
                {countries.map((country, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveCountry(country)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${activeCountry === country
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {country}
                    </button>
                ))}
            </div>

            <div className="mt-12"></div>

            {/* Header Image & Nav */}
            <div className="relative w-full h-40 shrink-0 mt-4">
                <img alt={activeCountry} className="absolute inset-0 h-full w-full object-cover opacity-50" src={heroImage} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background-dark"></div>
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Guia do País</p>
                            <h1 className="text-white text-3xl font-bold tracking-tight">{activeCountry}</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* City Essentials / Quick Tips */}
            <div className="px-4 pt-6 pb-2 flex flex-col gap-8">
                {countryCities.map((currentCity, idx) => (
                    <div key={idx}>
                        <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            {String(currentCity[cityKey]).split(' – ')[0]}
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Weather Card */}
                            <div className="glass-card rounded-xl p-4 flex flex-col gap-3 group hover:border-primary/50 transition duration-300">
                                <div className="flex justify-between items-start">
                                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">wb_sunny</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white text-sm">{currentCity[tempKey] || '-'}</p>
                                    <p className="text-white/60 text-xs">{currentCity[climateKey] || '-'}</p>
                                </div>
                            </div>

                            {/* Dress Code Card */}
                            <div className="glass-card rounded-xl p-4 flex flex-col gap-3 group hover:border-primary/50 transition duration-300">
                                <div className="flex justify-between items-start">
                                    <div className="size-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <span className="material-symbols-outlined">styler</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white text-sm">Geral</p>
                                    <p className="text-white/60 text-[10px] leading-tight mt-1">{currentCity[clothesGenKey] || '-'}</p>
                                </div>
                            </div>

                            {/* Temples Card */}
                            {currentCity[clothesTemKey] && currentCity[clothesTemKey] !== '-' && (
                                <div className="glass-card rounded-xl p-4 flex flex-col gap-3 group hover:border-primary/50 transition duration-300 col-span-2">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                            <span className="material-symbols-outlined">account_balance</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-base font-bold text-white text-sm">Roupas para Templos</p>
                                            <p className="text-white/60 text-xs mt-1">{currentCity[clothesTemKey]}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Currency info */}
                            {currentCity['Moeda'] && currentCity['Moeda'] !== '-' && (
                                <div className="glass-card rounded-xl p-4 flex flex-col gap-2 group hover:border-primary/50 transition duration-300">
                                    <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-wider">Moeda</p>
                                        <p className="text-white font-bold text-sm">{currentCity['Moeda']}</p>
                                        {currentCity['USD → Moeda (≈)'] && <p className="text-white/50 text-[10px]">USD: {currentCity['USD → Moeda (≈)']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Timezone */}
                            {currentCity[fusoKey] && currentCity[fusoKey] !== '-' && (
                                <div className="glass-card rounded-xl p-4 flex flex-col gap-2 group hover:border-primary/50 transition duration-300">
                                    <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <span className="material-symbols-outlined">schedule</span>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-wider">Fuso Horário</p>
                                        <p className="text-white font-bold text-sm">{currentCity[fusoKey]}</p>
                                    </div>
                                </div>
                            )}

                            {/* Visa info */}
                            {currentCity[visaKey] && currentCity[visaKey] !== '-' && (() => {
                                const link = getVisaLink(currentCity[cityKey]);
                                const CardTag = link ? 'a' : 'div';
                                const cardProps = link ? { href: link, target: '_blank', rel: 'noopener noreferrer' } : {};
                                return (
                                    <CardTag {...cardProps} className={`glass-card rounded-xl p-4 flex flex-col gap-2 group hover:border-primary/50 transition duration-300 col-span-2 ${link ? 'cursor-pointer hover:bg-purple-500/10' : ''}`} style={{ textDecoration: 'none' }}>
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-full flex items-center justify-center ${link ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                <span className="material-symbols-outlined">{link ? 'travel_explore' : 'badge'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white/60 text-[10px] uppercase tracking-wider">Visto / Entrada 🇧🇷</p>
                                                {link ? (
                                                    <>
                                                        <p className="text-amber-400 font-semibold text-sm">⚠️ Formulário de entrada necessário</p>
                                                        <p className="text-primary text-xs mt-1 group-hover:underline flex items-center gap-1">
                                                            Acessar formulário
                                                            <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-white font-semibold text-sm">{currentCity[visaKey]}</p>
                                                )}
                                            </div>
                                            {link && (
                                                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/40 transition-colors">
                                                    <span className="material-symbols-outlined !text-[18px]">open_in_new</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardTag>
                                );
                            })()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Gastronomy Section - Filtered by country */}
            <div className="mt-6 px-4">
                <h2 className="text-white text-xl font-bold mb-4">Restaurantes de Rede</h2>
                {filteredRestaurants.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {filteredRestaurants.map((r, i) => (
                            <div key={i} className="glass-card rounded-xl p-4 group">
                                <h3 className="text-white font-bold text-base mb-3">{r['Restaurante']}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {r.matchingLocations.map(([city, val]) => (
                                        <span key={city} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-white/80">
                                            <span className="text-primary font-semibold">{city}:</span> {val}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-white/40 text-sm">Nenhum restaurante de rede encontrado para {activeCountry}.</p>
                    </div>
                )}
            </div>

            {/* Dictionary / Quick Phrases - Filtered by language */}
            <div className="mt-8 px-4 pb-6">
                <h2 className="text-white text-xl font-bold mb-4">Dicionário de Sobrevivência</h2>
                {filteredPalavras.length > 0 ? (
                    <div className="flex overflow-x-auto gap-3 pt-4 pb-4 -mx-4 px-4 no-scrollbar snap-x">
                        {filteredPalavras.map((p, i) => (
                            <div key={i} className="glass-card min-w-[200px] p-4 rounded-xl flex flex-col h-auto snap-center border-l-4 border-l-primary gap-2">
                                <div>
                                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{p['País / Região']} • {p['Idioma']}</p>

                                    <div className="mt-2 text-sm">
                                        <span className="text-white/50 text-xs">Oi: </span>
                                        <span className="text-white font-bold">{p['Oi']}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-white/50 text-xs">Obrigado: </span>
                                        <span className="text-white font-bold">{p['Obrigado(a)']}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-white/50 text-xs">Banheiro: </span>
                                        <span className="text-white font-bold">{p['Banheiro']}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-white/40 text-sm">Nenhuma tradução encontrada para {activeCountry}.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
