import { useState, useEffect } from 'react';
import { fetchAllDashboardData } from '../utils/googleSheets';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyffeb7K3WIC2zpTHxe7ulpFAMDV_LWqvqK8gz0KYV1bQvgzasl4v2_2xz6oalKZNSD5A/exec';

async function syncToGoogleSheets(action, payload) {
    try {
        console.log(`Syncing ${action} to Google Sheets...`);
        // Using 'text/plain' to avoid CORS preflight OPTIONS request
        // The Apps Script must parse JSON.parse(e.postData.contents)
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
            checklist: [], roteiro: [], passagens: [], dicas: [], custos: [], checkedItems: {}
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
        // 1. Sync to Google Sheets
        if (category === 'roteiro') {
            await syncToGoogleSheets('addItinerary', {
                date: item.Data,
                time: item.Horário,
                activity: item['O que fazer']
            });
        } else if (category === 'custos') {
            await syncToGoogleSheets('addCost', {
                description: item.Descrição,
                value: item.Valor,
                category: item.Categoria
            });
        }

        // 2. Update local state
        setLocalData(prev => {
            const next = { ...prev, [category]: [...(prev[category] || []), item] };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });
    };

    const handleAddExtraCost = async (newCost) => {
        // 1. Sync to Google Sheets
        await syncToGoogleSheets('addCost', {
            description: newCost.Descrição,
            value: newCost.Valor,
            category: newCost.Categoria
        });

        // 2. Update local state
        setLocalData(prev => {
            const currentCustos = [...(prev.custos || [])];
            currentCustos.push(newCost);
            const next = { ...prev, custos: currentCustos };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });
    };

    // Merge remote and local data
    const combinedData = { ...data };
    if (data) {
        combinedData.checklist = [...(data.checklist || []), ...(localData.checklist || [])];
        combinedData.roteiro = data.roteiro || [];
        combinedData.localRoteiro = localData.roteiro || [];
        combinedData.passagens = [...(data.passagens || []), ...(localData.passagens || [])];
        combinedData.localDicas = localData.dicas || [];
        combinedData.custosExtras = localData.custos || [];
    }

    return {
        data: combinedData,
        loading,
        refreshing,
        refreshData,
        localData,
        setLocalData,
        handleAddLocalItem,
        handleAddExtraCost
    };
}
