/**
 * Parses a time string like "19h35", "19:35", "19h", "19:00-20:00"
 * Returns { h, m }
 */
export function parseTime(t) {
    if (!t || t === '-') return null;
    const match = t.match(/(\d{1,2})[h:](\d{0,2})/);
    if (match) return { h: parseInt(match[1]), m: parseInt(match[2]) || 0 };
    return null;
}

/**
 * Parses a date string "DD/MM/YYYY" or "DD/MM"
 * Returns Date object at 00:00
 */
export function parseDate(dStr) {
    if (!dStr) return null;
    const parts = dStr.split('/');
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1;
    const y = parts.length === 3 ? parseInt(parts[2]) : new Date().getFullYear();
    return new Date(y, m, d);
}

/**
 * Finds the next event in the itinerary
 */
export function findNextEvent(data) {
    if (!data) return null;
    const now = new Date();
    const allEvents = [];

    // 1. Core Roteiro items
    (data.roteiro || []).forEach(day => {
        const baseDate = parseDate(day['Data']);
        if (!baseDate) return;

        const y = baseDate.getFullYear();
        const m = baseDate.getMonth();
        const d = baseDate.getDate();

        // Wake up
        const wakeTime = parseTime(day['Horário pra acordar'] || day['Horario pra acordar']);
        if (wakeTime) {
            allEvents.push({
                title: 'Acordar',
                date: new Date(y, m, d, wakeTime.h, wakeTime.m),
                type: 'wake',
                icon: 'wb_sunny'
            });
        }

        // Travel / Displacement
        const travelTime = parseTime(day['Horário deslocamento'] || day['Horário deslocamento/vôo']);
        if (travelTime) {
            allEvents.push({
                title: 'Deslocamento/Voo',
                date: new Date(y, m, d, travelTime.h, travelTime.m),
                type: 'travel',
                icon: 'flight',
                details: day['CIA'] !== '-' ? day['CIA'] : ''
            });
        }

        // Hotel
        if (day['Hotel'] && day['Hotel'] !== '-') {
            // Assume check-in around 14h if not specified? Or just daytime
            allEvents.push({
                title: 'Check-in Hotel',
                date: new Date(y, m, d, 14, 0),
                type: 'hotel',
                icon: 'hotel',
                details: day['Hotel']
            });
        }

        // Bedtime
        const sleepTime = parseTime(day['Horário pra dormir'] || day['Horário pra dormir']);
        if (sleepTime) {
            allEvents.push({
                title: 'Hora de Descansar',
                date: new Date(y, m, d, sleepTime.h, sleepTime.m),
                type: 'sleep',
                icon: 'bedtime'
            });
        }
    });

    // 2. Passeios
    (data.passeios || []).forEach(p => {
        const baseDate = parseDate(p['Data']);
        if (!baseDate) return;

        const y = baseDate.getFullYear();
        const m = baseDate.getMonth();
        const d = baseDate.getDate();

        const time = parseTime(p['Horário']);
        allEvents.push({
            title: p['Passeio'],
            date: time ? new Date(y, m, d, time.h, time.m) : new Date(y, m, d, 9, 0),
            type: 'activity',
            icon: 'local_activity',
            details: p['O que é / Link']
        });
    });

    // 3. Local Roteiro
    (data.localRoteiro || []).forEach(item => {
        const baseDate = parseDate(item['Data']);
        if (!baseDate) return;

        const y = baseDate.getFullYear();
        const m = baseDate.getMonth();
        const d = baseDate.getDate();

        const time = parseTime(item['Horário']);
        allEvents.push({
            title: item['O que fazer'],
            date: time ? new Date(y, m, d, time.h, time.m) : new Date(y, m, d, 10, 0),
            type: 'local',
            icon: 'explore',
            details: 'Adicionado localmente'
        });
    });

    // Sort all events by date
    const sorted = allEvents.sort((a, b) => a.date - b.date);

    // Find the first one after now
    return sorted.find(e => e.date > now) || null;
}
