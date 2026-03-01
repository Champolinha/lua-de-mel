import { useState, useEffect } from 'react';
import { fetchAllDashboardData } from '../utils/googleSheets';
import { extractFloat } from '../utils/numbers';
import { fetchExchangeRates, convertToBRL } from '../utils/currencies';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_hoU28p6wXk4kORqXE-71j6gilR99VSPHA382iEkkeYHN7xNLgIF0PwQwGyiyAAZOng/exec';

async function syncToGoogleSheets(action, payload) {
    try {
        console.log(`Syncing ${action} to Google Sheets...`, payload);
        // Using 'text/plain' to avoid CORS preflight OPTIONS request
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, payload })
        });
        console.log(`Sync ${action} complete.`);
    } catch (error) {
        console.error('Failed to sync with Google Sheets:', error);
    }
}

export default function useTripData() {
    const [data, setData] = useState(null);
    const [localData, setLocalData] = useState(() => {
        const saved = localStorage.getItem('tripData');
        const defaultData = {
            checklist: [], roteiro: [], passagens: [], dicas: [], custos: [], checkedItems: {},
            deletedRemoteCosts: []
        };
        if (!saved) return defaultData;
        try {
            const parsed = JSON.parse(saved);
            return { ...defaultData, ...parsed };
        } catch (e) {
            return defaultData;
        }
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const refreshData = async () => {
        setRefreshing(true);
        try {
            const sheetsData = await fetchAllDashboardData();
            setData(sheetsData);
            // Clear synced optimistic data
            setLocalData(prev => {
                const next = { ...prev, roteiro: [], custos: [] };
                localStorage.setItem('tripData', JSON.stringify(next));
                return next;
            });
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        async function initData() {
            setLoading(true);
            try {
                const sheetsData = await fetchAllDashboardData();
                setData(sheetsData);
                // Clear synced optimistic data on initial load as well
                setLocalData(prev => {
                    const next = { ...prev, roteiro: [], custos: [] };
                    localStorage.setItem('tripData', JSON.stringify(next));
                    return next;
                });
            } catch (error) {
                console.error('Error initializing data:', error);
            } finally {
                setLoading(false);
            }
        }
        initData();

        // Background auto-refresh logic
        const autoRefresh = () => {
            if (document.visibilityState === 'visible') {
                refreshData();
            }
        };

        // Refresh every 2 minutes
        const intervalId = setInterval(autoRefresh, 2 * 60 * 1000);

        // Refresh when tab regains focus
        document.addEventListener('visibilitychange', autoRefresh);
        window.addEventListener('focus', autoRefresh);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', autoRefresh);
            window.removeEventListener('focus', autoRefresh);
        };
    }, []);

    const handleAddLocalItem = async (category, item) => {
        if (category === 'roteiro') {
            await syncToGoogleSheets('addItinerary', {
                date: item.Data,
                time: item.Horário,
                activity: item['O que fazer']
            });
        } else if (category === 'custos') {
            const rates = await fetchExchangeRates();
            const valBRL = convertToBRL(extractFloat(item.Valor), item.Moeda, rates);

            await syncToGoogleSheets('addCost', {
                description: item.Descrição,
                valueOriginal: extractFloat(item.Valor),
                currency: item.Moeda,
                valueBRL: valBRL,
                category: item.Categoria
            });

            // Update item with BRL value for local state
            item.ValorBRL = valBRL;
        }

        setLocalData(prev => {
            const next = { ...prev, [category]: [...(prev[category] || []), item] };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });
    };

    const handleAddExtraCost = async (newCost) => {
        const rates = await fetchExchangeRates();
        const valBRL = convertToBRL(extractFloat(newCost.Valor), newCost.Moeda || 'BRL', rates);

        const payload = {
            description: newCost.Descrição,
            valueOriginal: extractFloat(newCost.Valor),
            currency: newCost.Moeda || 'BRL',
            valueBRL: valBRL,
            category: newCost.Categoria
        };
        await syncToGoogleSheets('addCost', payload);

        setLocalData(prev => {
            const currentCustos = [...(prev.custos || [])];
            currentCustos.push({ ...newCost, ValorBRL: valBRL });
            const next = { ...prev, custos: currentCustos };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });
    };

    function costMatches(a, b) {
        const descA = (a.Descrição || '').trim().toLowerCase();
        const descB = (b.Descrição || '').trim().toLowerCase();
        const valA = extractFloat(a.Valor);
        const valB = extractFloat(b.Valor);
        return descA === descB && Math.abs(valA - valB) < 0.01;
    }

    const handleDeleteExtraCost = async (costToDelete) => {
        const payload = {
            description: costToDelete.Descrição,
            value: extractFloat(costToDelete.Valor)
        };

        // 1. Sync deletion to Google Sheets
        await syncToGoogleSheets('deleteCost', payload);

        // 2. Update local state
        setLocalData(prev => {
            const currentCustos = [...(prev.custos || [])];
            const filtered = currentCustos.filter(c => !costMatches(c, costToDelete));
            const wasLocal = filtered.length < currentCustos.length;
            const deletedRemote = [...(prev.deletedRemoteCosts || [])];
            if (!wasLocal) {
                deletedRemote.push({
                    Descrição: costToDelete.Descrição,
                    Valor: costToDelete.Valor,
                    Categoria: costToDelete.Categoria
                });
            }
            const next = { ...prev, custos: filtered, deletedRemoteCosts: deletedRemote };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });

        // 3. Refresh from Sheets after a delay
        setTimeout(refreshData, 2000);
    };

    // Merge remote and local data
    const combinedData = { ...data };
    if (data) {
        combinedData.checklist = [...(data.checklist || []), ...(localData.checklist || [])];
        combinedData.roteiro = data.roteiro || [];
        combinedData.localRoteiro = localData.roteiro || [];
        combinedData.passagens = [...(data.passagens || []), ...(localData.passagens || [])];
        combinedData.localDicas = localData.dicas || [];
        const deletedRemote = localData.deletedRemoteCosts || [];
        const remoteExtras = (data.custosExtrasRemotos || []).filter(
            rem => !deletedRemote.some(d => costMatches(d, rem))
        );
        combinedData.custosExtras = [
            ...remoteExtras,
            ...(localData.custos || []),
        ];
    }

    const handleToggleCheck = async (itemName, isChecked) => {
        await syncToGoogleSheets('toggleCheck', {
            item: itemName,
            isChecked: isChecked
        });
    };

    return {
        data: combinedData,
        loading,
        refreshing,
        refreshData,
        localData,
        setLocalData,
        handleAddLocalItem,
        handleAddExtraCost,
        handleDeleteExtraCost,
        handleToggleCheck
    };
}
