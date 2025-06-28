import React from 'react';
import { Home, Utensils, Package, ShoppingCart, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'meals', label: 'Meals', icon: Utensils },
    { id: 'pantry', label: 'Pantry', icon: Package },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-40 lg:hidden">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-solid-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;