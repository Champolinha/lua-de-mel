import Papa from 'papaparse';

async function test() {
    const url = `https://docs.google.com/spreadsheets/d/1E3ibnXtax2GbI0KDNQZom4xYkKPnTxUQe7NeebDt-3U/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Custo Final')}`;
    const response = await fetch(url);
    const csvText = await response.text();
    Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            console.log("Custo Keys:", Object.keys(results.data[0]));
            console.log("Custo Sample 0:", results.data[0]);
            console.log("Custo Sample 1:", results.data[1]);
            console.log("Custo Sample 2:", results.data[2]);
            console.log("Custo Sample 3:", results.data[3]);
        }
    });
}
test();
