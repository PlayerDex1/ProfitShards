import { useState } from "react";
import { Header } from "@/components/Header";
import { Calculator } from "@/components/Calculator";
import { Results } from "@/components/Results";
import { EquipmentComparison } from "@/components/EquipmentComparison";
import { Sidebar } from "@/components/Sidebar";
import { useCalculator } from "@/hooks/use-calculator";

export default function Home() {
  const { formData, results, breakdown, updateFormData, saveToHistory } = useCalculator();
  const [activeSection, setActiveSection] = useState('calculator');

  const handleSaveToHistory = () => {
    if (results) {
      saveToHistory(formData, results);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'equipment':
        return <EquipmentComparison />;
      case 'history':
        return (
          <div className="space-y-4">
            <Results results={results} breakdown={breakdown} includeHistory />
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <Calculator 
              formData={formData}
              onUpdateFormData={updateFormData}
              onSaveToHistory={handleSaveToHistory}
            />
            <Results results={results} breakdown={breakdown} includeHistory />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Sidebar 
              results={results}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
          
          <div className="lg:col-span-9">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
