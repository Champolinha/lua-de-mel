import React, { useState } from 'react';
import useTripData from './hooks/useTripData';
import HomeTab from './components/HomeTab';
import ItineraryTab from './components/ItineraryTab';
import LogisticsTab from './components/LogisticsTab';
import CostsTab from './components/CostsTab';
import UtilsTab from './components/UtilsTab';
import AddModal from './components/AddModal';

function App() {
  const { data: combinedData, loading, refreshing, refreshData, localData, setLocalData, handleAddLocalItem, handleAddExtraCost, handleDeleteExtraCost, handleToggleCheck } = useTripData();

  const [activeTab, setActiveTab] = useState('home');
  const [logisticsView, setLogisticsView] = useState('flights');
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-primary mt-4 font-bold tracking-wider">Preparando a viagem...</h2>
      </div>
    );
  }

  // Calculate dynamic tripDate based on roteiro
  // Default to March 6th 19:35 as per user's trip info
  let parsedTripDate = new Date('2026-03-06T19:35:00');
  if (combinedData?.roteiro?.length > 0) {
    const firstDay = combinedData.roteiro.find(item => item['Data']);
    if (firstDay && firstDay['Data']) {
      // Data is usually in DD/MM/YYYY or DD/MM
      const parts = String(firstDay['Data']).split('/');
      let dateStr = '';
      if (parts.length === 3) {
        dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts.length === 2) {
        dateStr = `2026-${parts[1]}-${parts[0]}`;
      }

      if (dateStr) {
        // If it's the start date (March 6th), use the exact flight time
        const timeStr = dateStr === '2026-03-06' ? '19:35:00' : '00:00:00';
        parsedTripDate = new Date(`${dateStr}T${timeStr}`);
      }
    }
  }
  const tripDate = parsedTripDate;

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">

      {/* Header / Top Nav (Show on all tabs) */}
      <div className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-center">
          <h2 className="text-slate-100 text-lg font-bold tracking-tight">Nossa Lua de Mel</h2>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'home' && <HomeTab data={combinedData} tripDate={tripDate} setActiveTab={setActiveTab} setLogisticsView={setLogisticsView} localData={localData} setLocalData={setLocalData} onAddCost={handleAddExtraCost} onDeleteCost={handleDeleteExtraCost} />}
      {activeTab === 'roteiro' && <ItineraryTab data={combinedData} localData={localData} setLocalData={setLocalData} />}
      {activeTab === 'logistica' && <LogisticsTab data={combinedData} view={logisticsView} setView={setLogisticsView} localData={localData} setLocalData={setLocalData} />}
      {activeTab === 'custos' && <CostsTab data={combinedData} localData={localData} setLocalData={setLocalData} onDeleteCost={handleDeleteExtraCost} onRefresh={refreshData} refreshing={refreshing} />}
      {activeTab === 'extras' && <UtilsTab data={combinedData} localData={localData} setLocalData={setLocalData} onToggleCheck={handleToggleCheck} onRefresh={refreshData} refreshing={refreshing} />}

      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} onAdd={handleAddLocalItem} data={combinedData} />}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        aria-label="Adicionar novo item"
        className="fixed bottom-[110px] right-4 z-50 h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all duration-300 ease-out"
      >
        <span className="material-symbols-outlined !text-[32px]">add</span>
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 glass-panel border-t border-white/10 pb-6 pt-3 px-6 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            aria-label="Ir para Home"
            className="flex flex-col items-center gap-1 group w-12 appearance-none bg-transparent border-none"
          >
            <div className="relative p-1.5 flex justify-center">
              <span className={`material-symbols-outlined !text-[28px] transition-all duration-300 ${activeTab === 'home' ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-primary group-hover:scale-110'}`}>home</span>
              {activeTab === 'home' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(232,48,110,0.6)]"></span>}
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors duration-300 ${activeTab === 'home' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('roteiro')}
            aria-label="Ver Roteiro"
            className="flex flex-col items-center gap-1 group w-12 appearance-none bg-transparent border-none"
          >
            <div className="relative p-1.5 flex justify-center">
              <span className={`material-symbols-outlined !text-[28px] transition-all duration-300 ${activeTab === 'roteiro' ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-primary group-hover:scale-110'}`}>calendar_month</span>
              {activeTab === 'roteiro' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(232,48,110,0.6)]"></span>}
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors duration-300 ${activeTab === 'roteiro' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Roteiro</span>
          </button>

          <button
            onClick={() => setActiveTab('logistica')}
            aria-label="Ver Logística"
            className="flex flex-col items-center gap-1 group w-12 appearance-none bg-transparent border-none"
          >
            <div className="relative p-1.5 flex justify-center">
              <span className={`material-symbols-outlined !text-[28px] transition-all duration-300 ${activeTab === 'logistica' ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-primary group-hover:scale-110'}`}>flight_takeoff</span>
              {activeTab === 'logistica' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(232,48,110,0.6)]"></span>}
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors duration-300 ${activeTab === 'logistica' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Logística</span>
          </button>

          <button
            onClick={() => setActiveTab('custos')}
            aria-label="Ver Custos"
            className="flex flex-col items-center gap-1 group w-12 appearance-none bg-transparent border-none"
          >
            <div className="relative p-1.5 flex justify-center">
              <span className={`material-symbols-outlined !text-[28px] transition-all duration-300 ${activeTab === 'custos' ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-primary group-hover:scale-110'}`}>account_balance_wallet</span>
              {activeTab === 'custos' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(232,48,110,0.6)]"></span>}
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors duration-300 ${activeTab === 'custos' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Custos</span>
          </button>

          <button
            onClick={() => setActiveTab('extras')}
            aria-label="Ver Tarefas"
            className="flex flex-col items-center gap-1 group w-12 appearance-none bg-transparent border-none"
          >
            <div className="relative p-1.5 flex justify-center">
              <span className={`material-symbols-outlined !text-[28px] transition-all duration-300 ${activeTab === 'extras' ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-primary group-hover:scale-110'}`}>checklist</span>
              {activeTab === 'extras' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(232,48,110,0.6)]"></span>}
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors duration-300 ${activeTab === 'extras' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Tarefas</span>
          </button>
        </div>
      </nav>

    </div>
  );
}

export default App;
