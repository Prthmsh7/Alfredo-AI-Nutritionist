import React from 'react';
import { User, Settings, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl border-2 border-black shadow-solid-sm flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-black">Alfredo</h1>
            <p className="text-xs text-gray-600">AI Nutrition Assistant</p>
          </div>
        </div>

        {/* Made with Bolt.new badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-yellow-200 px-3 py-1.5 rounded-lg border-2 border-black shadow-solid-sm">
          <Zap className="w-4 h-4 text-black" />
          <span className="text-xs font-medium text-black">Made with Bolt.new</span>
        </div>

        {/* User menu */}
        {user && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg border-2 border-black bg-white shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5"
            >
              <Settings className="w-5 h-5 text-black" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg border-2 border-black bg-white shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5"
            >
              <LogOut className="w-5 h-5 text-black" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;