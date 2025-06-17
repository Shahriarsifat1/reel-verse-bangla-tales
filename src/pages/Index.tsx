
import React, { useState } from 'react';
import ReelsViewer from '@/components/ReelsViewer';
import AdminPanel from '@/components/AdminPanel';
import Navigation from '@/components/Navigation';

const Index = () => {
  const [currentView, setCurrentView] = useState<'reels' | 'admin'>('reels');

  return (
    <div className="relative">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      {currentView === 'reels' ? (
        <ReelsViewer />
      ) : (
        <AdminPanel />
      )}
    </div>
  );
};

export default Index;
