const XLSX = require('./node_modules/xlsx');
const fs = require('fs');
const wb = XLSX.readFile('Lua de Mel.xlsx');

const allData = {};
wb.SheetNames.forEach(name => {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    allData[name] = rows.filter(row => row.some(c => c !== ''));
});

fs.writeFileSync('excel_data.json', JSON.stringify(allData, null, 2));
console.log('Salvo em excel_data.json');
console.log('Abas:', wb.SheetNames);
