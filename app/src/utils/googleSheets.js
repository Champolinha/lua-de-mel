import Papa from 'papaparse';

const SHEET_ID = '1E3ibnXtax2GbI0KDNQZom4xYkKPnTxUQe7NeebDt-3U';

export const SHEET_NAMES = {
    CUSTO_FINAL: 'Custo Final',
    CUSTOS_RAW: 'Custos',
    MAPS: 'Roteiro google maps',
    ROTEIRO: 'Roteiro final',
    VIP: 'Salas VIP',
    RESTAURANTES: 'Restaurantes de rede',
    CIDADES: 'Resumo cidades',
    PALAVRAS: 'Palavras',
    CHECKLIST: 'Checklist',
    PASSEIOS: 'Passeios',
    HOTEL: 'Hotel',
    DADOS: 'Dados',
    PASSAGENS: 'Passagens'
};

/**
 * Fetch a specific sheet as CSV and parse it into an array of objects
 */
export async function fetchSheetData(sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&_=${new Date().getTime()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch sheet');

        const csvText = await response.text();

        // Sheets parsed as raw arrays (no header row)
        const noHeaderSheets = [
            SHEET_NAMES.CUSTO_FINAL,
            SHEET_NAMES.VIP,
            SHEET_NAMES.PASSEIOS,
            SHEET_NAMES.PASSAGENS,
            SHEET_NAMES.DADOS,
            SHEET_NAMES.MAPS,
        ];
        const useHeader = !noHeaderSheets.includes(sheetName);

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: useHeader,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: (error) => reject(error)
            });
        });
    } catch (error) {
        console.error(`Error fetching sheet ${sheetName}:`, error);
        return [];
    }
}

const CUSTOS_HEADER_HINTS = ['descrição', 'descricao', 'valor', 'categoria'];

function looksLikeCustosHeader(row) {
    if (!Array.isArray(row) || row.length === 0) return false;
    const first = String(row[0] || '').trim().toLowerCase();
    const second = String(row[1] || '').trim().toLowerCase();
    return CUSTOS_HEADER_HINTS.some(h => first.includes(h) || second.includes(h));
}

/**
 * Fetch Custos sheet as raw rows (no header), then build custosExtrasRemotos.
 * Optionally skips the first row if it looks like a header (Descrição, Valor, Categoria).
 */
export async function fetchCustosExtrasRaw() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAMES.CUSTOS_RAW)}&_=${new Date().getTime()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch Custos sheet');
        const csvText = await response.text();
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = (results.data || []).filter(row => Array.isArray(row) && row.some(c => String(c || '').trim() !== ''));
                    const skipFirst = rows.length > 0 && looksLikeCustosHeader(rows[0]);
                    const dataRows = skipFirst ? rows.slice(1) : rows;
                    const custosExtrasRemotos = dataRows
                        .map(row => {
                            const desc = String(row[0] || '').trim();

                            // Let's decide if it's new (5 columns) or old (3 columns) format
                            // New: [desc, valOrig, moeda, valBRL, cat]
                            // Old: [desc, val, cat]
                            let val, cat, valOrig, currency;

                            if (row.length >= 5) {
                                valOrig = String(row[1] || '').trim();
                                currency = String(row[2] || '').trim();
                                val = String(row[3] || '').trim(); // Value in BRL
                                cat = String(row[4] || '').trim() || 'Outros';
                            } else {
                                val = String(row[1] || '').trim();
                                cat = String(row[2] || '').trim() || 'Outros';
                                valOrig = val;
                                currency = 'BRL';
                            }

                            if (!desc && !val && !cat) return null;
                            return {
                                Descrição: desc,
                                Valor: val, // We'll keep this as the main "Real" value for existing UI components
                                ValorOriginal: valOrig,
                                Moeda: currency,
                                Categoria: cat,
                            };
                        })
                        .filter(Boolean);
                    resolve(custosExtrasRemotos);
                },
                error: (error) => reject(error)
            });
        });
    } catch (error) {
        console.error('Error fetching Custos extras:', error);
        return [];
    }
}

/**
 * Fetch all critical sheets at once (useful for initial load)
 */
export async function fetchAllDashboardData() {
    const sheetsToFetch = [
        SHEET_NAMES.CUSTO_FINAL,    // 0
        SHEET_NAMES.CHECKLIST,      // 1
        SHEET_NAMES.DADOS,          // 2
        SHEET_NAMES.ROTEIRO,        // 3
        SHEET_NAMES.PASSAGENS,      // 4
        SHEET_NAMES.HOTEL,          // 5
        SHEET_NAMES.VIP,            // 6
        SHEET_NAMES.PASSEIOS,       // 7
        SHEET_NAMES.RESTAURANTES,   // 8
        SHEET_NAMES.PALAVRAS,       // 9
    ];

    const [results, custosExtrasRemotos] = await Promise.all([
        Promise.all(sheetsToFetch.map(sheet => fetchSheetData(sheet))),
        fetchCustosExtrasRaw(),
    ]);

    // ---- Process Passagens ----
    // Raw rows (no header): [companhia, trecho, codigo, valor_formatado, ...]
    // Values from Google Sheets come pre-formatted: "R$ 29.582,99"
    const rawPassagens = results[4] || [];
    const passagens = rawPassagens
        .filter(r => {
            const company = (r[0] || '').trim();
            // Skip empty rows, total rows, and junk (Bangkok description text, etc.)
            return company.length > 0 && company.length < 50 &&
                !company.startsWith('Bangkok') && !company.startsWith('Day') &&
                !company.startsWith('Holiday') && !company.startsWith('Private') &&
                !company.startsWith('Passenger') && !company.startsWith('Pickup') &&
                !company.startsWith('Thailand') && !company.startsWith('Damnoen') &&
                !company.startsWith('There') && !company.startsWith('CECILIA') &&
                !company.startsWith('SARAIVA') && !company.startsWith('MASCARENHAS') &&
                !company.startsWith('Holidav') && !company.startsWith('01 ');
        })
        .map(r => ({
            'Companhia Aérea': r[0] || '',
            'Trecho/Descrição': r[1] || '',
            'Código da Reserva': r[2] || '',
            'Valor BRL': r[3] || '',   // Already formatted: "R$ 29.582,99"
        }));

    // ---- Process VIP ----
    // Raw rows (no header): [data, local, horario, duracao]
    // Google Sheets already formats: dates as "07/03 - 08/03", no conversion needed
    const rawVip = results[6] || [];
    const vip = rawVip
        .filter(r => (r[0] || '').trim() || (r[1] || '').trim())
        .map(r => ({
            'Data': r[0] || '',
            'Local': r[1] || '',
            'Horário': r[2] || '',
            'Duração/Observação': r[3] || '',
        }));

    // ---- Process Roteiro ----
    // Has header row. Dates come as "DD/MM/YYYY" strings directly from Google Sheets
    const roteiro = (results[3] || []).filter(r => r['Data'] || r['Cidade']);

    // ---- Process Hoteis ----
    // Has header row. Dates come as "DD/MM/YYYY", values as "R$ 812,68"
    const hoteis = (results[5] || [])
        .filter(h => h.Cidade && h.Cidade !== '-')
        .map(h => ({
            ...h,
            // Google Sheets CSV already provides formatted values
            'Valor em BRL': h['Valor reais'] || h['Valor moeda local'] || '',
        }));

    // ---- Process Passeios ----
    // Raw rows (no header): [nome, data, valor, descricao, status, horario, ...]
    const rawPasseios = results[7] || [];
    const passeios = rawPasseios
        .filter(r => {
            const nome = (r[0] || '').trim();
            return nome.length > 0 && nome.length < 60 && nome !== '';
        })
        .map(r => ({
            'Passeio': r[0] || '',
            'Data': r[1] || '',   // Already "DD/MM/YYYY" from Google Sheets
            'Valor (BRL)': r[2] || '',
            'O que é / Link': r[3] || '',
            'Status': (r[4] || '').replace('/', '').trim(),
            'Horário': (r[5] || '').replace('/', '').trim(),
        }));

    // ---- Process Dados ----
    // Raw rows: each row has a single value in column 0
    const rawDados = results[2] || [];
    const dadosLabels = ['Nome', 'Sobrenome', 'Email', 'Endereço', 'Telefone', 'Contato Emergência', 'Número do Cartão', 'Validade Cartão', 'CVV'];
    const dados = rawDados
        .filter(row => (row[0] || '').toString().trim())
        .map((row, i) => ({
            'Informação Pessoal': dadosLabels[i] || `Campo ${i + 1}`,
            'Valor': String(row[0] || ''),
        }));

    // ---- Process Cidades (Resumo cidades) ----
    // This sheet uses MERGED CELLS for the first 9 cities, making them appear
    // as concatenated text in column headers of the gviz JSON response.
    // The last 3 cities (Dubai, Abu Dhabi, Doha) appear as normal data rows.
    //
    // Strategy: fetch gviz JSON (not CSV) for this sheet to get column labels
    // and parse city data from both column labels and row data.

    let cidades = [];
    try {
        const cidadesUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAMES.CIDADES)}&_=${new Date().getTime()}`;
        const cidadesResp = await fetch(cidadesUrl);
        const cidadesText = await cidadesResp.text();
        // Remove google wrapper: "/*O_o*/\ngoogle.visualization.Query.setResponse(...);"
        const cidadesJson = JSON.parse(cidadesText.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, ''));
        const table = cidadesJson.table;
        const cols = table.cols || [];
        const rows = table.rows || [];

        // The first 9 cities are encoded in column LABELS (due to merged cells).
        // Each column label is "PropertyName City1Val City2Val City3Val..."
        // Column A label: "Cidade / País Singapura Krabi / Phi Phi – Tailândia..."
        // City names known:
        const CITIES_IN_COLS = [
            'Singapura',
            'Krabi / Phi Phi – Tailândia',
            'Bangkok – Tailândia',
            'Coron – Filipinas',
            'Hong Kong',
            'Macau',
            'Pequim',
            'Seul – Coreia do Sul',
            'Tóquio – Japão',
        ];

        // Initialize city objects for first 9 cities
        CITIES_IN_COLS.forEach(city => {
            cidades.push({ 'Cidade / País': city });
        });

        // The 9 merged cities' data is hardcoded because the column labels
        // concatenate all values making reliable splitting impossible for long text.
        // Data extracted from the gviz JSON column labels.
        const HARDCODED_CITY_DATA = {
            'Singapura': {
                'Temperatura média': '27–31 °C', 'Clima': 'Quente e úmido',
                'Roupas gerais recomendadas': 'Roupas leves, algodão, sandálias, tênis leve',
                'Roupas adequadas para templos': 'Ombros e joelhos cobertos; echarpe resolve',
                'Tomada (vs Brasil)': 'Tipo G', 'Precisa adaptador?': '✅ Sim', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'SGD', 'USD → Moeda (≈)': '1 USD ≈ 1,35 SGD', 'BRL → Moeda (≈)': '1 BRL ≈ 0,18 SGD',
                'Fuso (mar/26)': '+11h', 'Visto 🇧🇷': '❌ Não',
            },
            'Krabi / Phi Phi – Tailândia': {
                'Temperatura média': '26–32 °C', 'Clima': 'Muito quente e úmido',
                'Roupas gerais recomendadas': 'Roupas de praia, chinelo, chapéu',
                'Roupas adequadas para templos': 'Vestido/bermuda abaixo do joelho + camiseta',
                'Tomada (vs Brasil)': 'Tipo A/B/C', 'Precisa adaptador?': '⚠️ Parcial', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'THB', 'USD → Moeda (≈)': '1 USD ≈ 36 THB', 'BRL → Moeda (≈)': '1 BRL ≈ 7 THB',
                'Fuso (mar/26)': '+10h', 'Visto 🇧🇷': '❌ Não',
            },
            'Bangkok – Tailândia': {
                'Temperatura média': '28–34 °C', 'Clima': 'Muito quente',
                'Roupas gerais recomendadas': 'Roupas bem leves, tênis/sandália',
                'Roupas adequadas para templos': 'Obrigatório cobrir ombros e joelhos',
                'Tomada (vs Brasil)': 'Tipo A/B/C', 'Precisa adaptador?': '⚠️ Parcial', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'THB', 'USD → Moeda (≈)': '1 USD ≈ 36 THB', 'BRL → Moeda (≈)': '1 BRL ≈ 7 THB',
                'Fuso (mar/26)': '+10h', 'Visto 🇧🇷': '❌ Não',
            },
            'Coron – Filipinas': {
                'Temperatura média': '26–31 °C', 'Clima': 'Quente tropical',
                'Roupas gerais recomendadas': 'Roupas leves, praia, repelente',
                'Roupas adequadas para templos': 'Pouca exigência; evitar roupa de praia em igrejas',
                'Tomada (vs Brasil)': 'Tipo A/B/C', 'Precisa adaptador?': '⚠️ Parcial', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'PHP', 'USD → Moeda (≈)': '1 USD ≈ 56 PHP', 'BRL → Moeda (≈)': '1 BRL ≈ 6 PHP',
                'Fuso (mar/26)': '+11h', 'Visto 🇧🇷': '❌ Não (59 dias)',
            },
            'Hong Kong': {
                'Temperatura média': '18–24 °C', 'Clima': 'Agradável, úmido',
                'Roupas gerais recomendadas': 'Calça leve, camiseta, jaqueta fina',
                'Roupas adequadas para templos': 'Roupas discretas; ombros cobertos',
                'Tomada (vs Brasil)': 'Tipo G', 'Precisa adaptador?': '✅ Sim', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'HKD', 'USD → Moeda (≈)': '1 USD ≈ 7,8 HKD', 'BRL → Moeda (≈)': '1 BRL ≈ 1,3 HKD',
                'Fuso (mar/26)': '+11h', 'Visto 🇧🇷': '❌ Não',
            },
            'Macau': {
                'Temperatura média': '18–24 °C', 'Clima': 'Agradável, úmido',
                'Roupas gerais recomendadas': 'Calça leve, camiseta, jaqueta fina',
                'Roupas adequadas para templos': 'Roupas discretas; ombros cobertos',
                'Tomada (vs Brasil)': 'Tipo G', 'Precisa adaptador?': '✅ Sim', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'MOP (Pataca)', 'USD → Moeda (≈)': '1 USD ≈ 8,1', 'BRL → Moeda (≈)': '1 BRL ≈ 1,40',
                'Fuso (mar/26)': '+11h', 'Visto 🇧🇷': '❌ isento (90 dias)',
            },
            'Pequim': {
                'Temperatura média': '5–13 °C', 'Clima': 'Frio (fim do inverno)',
                'Roupas gerais recomendadas': 'Casaco médio, calça, tênis fechado',
                'Roupas adequadas para templos': 'Roupas discretas; sapatos fáceis de tirar',
                'Tomada (vs Brasil)': 'Tipo C/F', 'Precisa adaptador?': '❌ Não', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'KRW', 'USD → Moeda (≈)': '1 USD ≈ 1.300 KRW', 'BRL → Moeda (≈)': '1 BRL ≈ 270 KRW',
                'Fuso (mar/26)': '+12h', 'Visto 🇧🇷': '⚠️ K-ETA',
            },
            'Seul – Coreia do Sul': {
                'Temperatura média': '8–17 °C', 'Clima': 'Primavera',
                'Roupas gerais recomendadas': 'Casaco leve, roupas em camadas',
                'Roupas adequadas para templos': 'Roupas discretas; evitar shorts/decotes',
                'Tomada (vs Brasil)': 'Tipo A', 'Precisa adaptador?': '❌ Não', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'JPY', 'USD → Moeda (≈)': '1 USD ≈ 150 JPY', 'BRL → Moeda (≈)': '1 BRL ≈ 22 JPY',
                'Fuso (mar/26)': '+12h', 'Visto 🇧🇷': '❌ Não',
            },
            'Tóquio – Japão': {
                'Temperatura média': '10–18 °C', 'Clima': 'Primavera',
                'Roupas gerais recomendadas': 'Camadas leves, tênis confortável',
                'Roupas adequadas para templos': 'Roupas discretas',
                'Tomada (vs Brasil)': 'Tipo A', 'Precisa adaptador?': '❌ Não', 'VPN p/ WhatsApp': '❌ Não',
                'Moeda': 'JPY', 'USD → Moeda (≈)': '1 USD ≈ 150 JPY', 'BRL → Moeda (≈)': '1 BRL ≈ 22 JPY',
                'Fuso (mar/26)': '+12h', 'Visto 🇧🇷': '❌ Não',
            },
        };

        // Apply hardcoded data for first 9 cities
        CITIES_IN_COLS.forEach(city => {
            const cityObj = cidades.find(c => c['Cidade / País'] === city);
            if (cityObj && HARDCODED_CITY_DATA[city]) {
                Object.assign(cityObj, HARDCODED_CITY_DATA[city]);
            }
        });

        // Add the data rows: Dubai, Abu Dhabi, Doha (and any others)
        rows.forEach(row => {
            if (!row || !row.c) return;
            const cells = row.c;
            const cityName = cells[0]?.v || '';
            if (!cityName) return;

            const cityObj = { 'Cidade / País': cityName };

            // Map row columns to property names (cols[0]=Cidade, cols[1]=Datas, ...)
            cols.forEach((col, colIdx) => {
                const label = (col.label || '').trim();
                // Get the property name (prefix of the label)
                const PROP_NAMES = ['Cidade / País', 'Datas', 'Pendências', 'Temperatura média', 'Clima', 'Roupas gerais recomendadas', 'Roupas adequadas para templos', 'Tomada (vs Brasil)', 'Precisa adaptador?', 'VPN p/ WhatsApp', 'Moeda', 'USD → Moeda (≈)', 'BRL → Moeda (≈)', 'Fuso (mar/26)', 'Visto 🇧🇷', 'Visto 🇮🇹', 'Custo visto', 'Antecedência', 'Hotel casal (média)', 'Remédio controlado', 'Receita exigida', 'Idioma', 'Febre Amarela (🇧🇷)', 'Observação prática'];
                const propName = PROP_NAMES.find(p => label.startsWith(p)) || label;
                if (!propName || propName === 'Cidade / País') return;

                const cell = cells[colIdx];
                // Use formatted value for dates, raw for others
                const val = cell?.f || cell?.v || '';
                cityObj[propName] = String(val);
            });

            cidades.push(cityObj);
        });

    } catch (err) {
        console.error('Error fetching cidades:', err);
        cidades = [];
    }

    // custosExtrasRemotos já preenchido por fetchCustosExtrasRaw()

    return {
        custos: results[0],
        checklist: results[1],
        dados,
        roteiro,
        passagens,
        hoteis,
        vip,
        passeios,
        cidades,
        restaurantes: results[8],
        palavras: results[9],
        custosExtrasRemotos,
    };
}


