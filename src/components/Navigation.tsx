
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: 'reels' | 'admin';
  onViewChange: (view: 'reels' | 'admin') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <Button
        onClick={() => onViewChange('reels')}
        variant={currentView === 'reels' ? 'default' : 'secondary'}
        className={`${
          currentView === 'reels'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'bg-white/10 backdrop-blur-sm text-white border-white/20'
        }`}
      >
        <Video size={16} className="mr-2" />
        রিলস
      </Button>
      
      <Button
        onClick={() => onViewChange('admin')}
        variant={currentView === 'admin' ? 'default' : 'secondary'}
        className={`${
          currentView === 'admin'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'bg-white/10 backdrop-blur-sm text-white border-white/20'
        }`}
      >
        <Settings size={16} className="mr-2" />
        অ্যাডমিন
      </Button>
    </div>
  );
};

export default Navigation;
