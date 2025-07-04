import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
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

        {/* Built with Bolt badge */}
        <div className="hidden sm:flex items-center">
          <a 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5"
          >
            <img 
              src="/bolt-logo.svg" 
              alt="Built with Bolt" 
              className="w-6 h-6"
            />
            <span className="text-xs font-medium text-black">Built with Bolt</span>
          </a>
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