import { useState, useEffect, useCallback } from 'react';
import { fetchAllDashboardData } from '../utils/googleSheets';
import { extractFloat } from '../utils/numbers';
import { fetchExchangeRates, convertToBRL } from '../utils/currencies';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_hoU28p6wXk4kORqXE-71j6gilR99VSPHA382iEkkeYHN7xNLgIF0PwQwGyiyAAZOng/exec';

const CACHE_KEY = 'tripDataCache';
const QUEUE_KEY = 'tripSyncQueue';

async function syncToGoogleSheets(action, payload) {
    console.log(`Syncing ${action} to Google Sheets...`, payload);
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload })
    });
    console.log(`Sync ${action} complete.`);
    return response;
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
            return { ...defaultData, ...JSON.parse(saved) };
        } catch (e) {
            return defaultData;
        }
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const syncWithQueue = async (action, payload) => {
        const queueItem = { action, payload, id: Date.now() };

        if (!navigator.onLine) {
            console.log('📱 Offline: Ação salva na fila de sincronização', queueItem);
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            queue.push(queueItem);
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            return;
        }

        try {
            await syncToGoogleSheets(action, payload);
        } catch (error) {
            console.warn('⚠️ Falha ao sincronizar, salvando na fila...', error);
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            queue.push(queueItem);
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        }
    };

    const processSyncQueue = useCallback(async () => {
        if (!navigator.onLine) return false;

        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        if (queue.length === 0) return true;

        console.log(`🔄 Processando ${queue.length} itens da fila de sincronização...`);
        const remainingQueue = [];

        for (const item of queue) {
            try {
                await syncToGoogleSheets(item.action, item.payload);
            } catch (e) {
                console.error('❌ Falha ao processar item da fila, mantendo na fila:', item);
                remainingQueue.push(item);
            }
        }

        localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));

        if (remainingQueue.length === 0) {
            console.log('✅ Fila de sincronização concluída com sucesso!');
            return true;
        }
        return false;
    }, []);

    const refreshData = async () => {
        if (!navigator.onLine) return;

        setRefreshing(true);
        try {
            const sheetsData = await fetchAllDashboardData();

            // --- TRAVA DE SEGURANÇA CONTRA APAGÃO DE CACHE ---
            // Verifica se as abas principais retornaram com dados. Se vierem zeradas,
            // significa que o Google Sheets falhou ou a rede caiu no meio do request.
            const isDataValid = sheetsData && (
                (sheetsData.cidades && sheetsData.cidades.length > 0) ||
                (sheetsData.roteiro && sheetsData.roteiro.length > 0) ||
                (sheetsData.passagens && sheetsData.passagens.length > 0)
            );

            if (isDataValid) {
                setData(sheetsData);
                localStorage.setItem(CACHE_KEY, JSON.stringify(sheetsData));

                // Só limpa os dados locais de inserção SE a fila de sync estiver vazia
                const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
                if (queue.length === 0) {
                    setLocalData(prev => {
                        const next = { ...prev, roteiro: [], custos: [], deletedRemoteCosts: [] };
                        localStorage.setItem('tripData', JSON.stringify(next));
                        return next;
                    });
                }
            } else {
                console.warn('⚠️ Download vazio detectado! Ignorando a atualização para não apagar o cache local.');
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        async function initData() {
            setLoading(true);

            // 1. Carrega o Cache Seguro com Try/Catch contra corrupção
            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    if (parsed && Object.keys(parsed).length > 0) {
                        setData(parsed);
                    }
                }
            } catch (e) {
                console.error("Erro ao ler o cache offline:", e);
            }

            // 2. Tenta sincronizar se tiver internet
            if (navigator.onLine) {
                const queueSuccess = await processSyncQueue();
                if (queueSuccess) {
                    await refreshData();
                }
            }
            setLoading(false);
        }
        initData();

        const autoRefresh = async () => {
            if (document.visibilityState === 'visible' && navigator.onLine) {
                const queueSuccess = await processSyncQueue();
                if (queueSuccess) {
                    refreshData();
                }
            }
        };

        const intervalId = setInterval(autoRefresh, 2 * 60 * 1000);
        document.addEventListener('visibilitychange', autoRefresh);
        window.addEventListener('focus', autoRefresh);
        window.addEventListener('online', autoRefresh);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', autoRefresh);
            window.removeEventListener('focus', autoRefresh);
            window.removeEventListener('online', autoRefresh);
        };
    }, [processSyncQueue]);

    const handleAddLocalItem = async (category, item) => {
        if (category === 'roteiro') {
            await syncWithQueue('addItinerary', {
                date: item.Data,
                time: item.Horário,
                activity: item['O que fazer']
            });
        } else if (category === 'custos') {
            let valBRL = extractFloat(item.Valor);
            try {
                const rates = await fetchExchangeRates();
                valBRL = convertToBRL(extractFloat(item.Valor), item.Moeda, rates);
            } catch (e) {
                console.warn("Offline: Usando valor original temporariamente.");
            }

            await syncWithQueue('addCost', {
                description: item.Descrição,
                valueOriginal: extractFloat(item.Valor),
                currency: item.Moeda,
                valueBRL: valBRL,
                category: item.Categoria
            });
            item.ValorBRL = valBRL;
        }

        setLocalData(prev => {
            const next = { ...prev, [category]: [...(prev[category] || []), item] };
            localStorage.setItem('tripData', JSON.stringify(next));
            return next;
        });
    };

    const handleAddExtraCost = async (newCost) => {
        let valBRL = extractFloat(newCost.Valor);
        try {
            const rates = await fetchExchangeRates();
            valBRL = convertToBRL(extractFloat(newCost.Valor), newCost.Moeda || 'BRL', rates);
        } catch (e) {
            console.warn("Offline: Câmbio falhou, usando valor base.");
        }

        await syncWithQueue('addCost', {
            description: newCost.Descrição,
            valueOriginal: extractFloat(newCost.Valor),
            currency: newCost.Moeda || 'BRL',
            valueBRL: valBRL,
            category: newCost.Categoria
        });

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
        await syncWithQueue('deleteCost', {
            description: costToDelete.Descrição,
            value: extractFloat(costToDelete.Valor)
        });

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
    };

    const handleToggleCheck = async (itemName, isChecked) => {
        await syncWithQueue('toggleCheck', {
            item: itemName,
            isChecked: isChecked
        });
    };

    // Construção segura do state final: previne quebras se `data` ainda for null
    const combinedData = data ? { ...data } : {
        checklist: [], roteiro: [], passagens: [], custos: [], dicas: [],
        cidades: [], vip: [], hoteis: [], passeios: [], restaurantes: [], palavras: [], custosExtrasRemotos: []
    };

    combinedData.checklist = [...(combinedData.checklist || []), ...(localData.checklist || [])];
    combinedData.roteiro = combinedData.roteiro || [];
    combinedData.localRoteiro = localData.roteiro || [];
    combinedData.passagens = [...(combinedData.passagens || []), ...(localData.passagens || [])];
    combinedData.localDicas = localData.dicas || [];

    const deletedRemote = localData.deletedRemoteCosts || [];
    const remoteExtras = (combinedData.custosExtrasRemotos || []).filter(
        rem => !deletedRemote.some(d => costMatches(d, rem))
    );

    combinedData.custosExtras = [
        ...remoteExtras,
        ...(localData.custos || []),
    ];

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