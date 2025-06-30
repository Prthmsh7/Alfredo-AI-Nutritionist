import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border-2 border-black shadow-solid-xl max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {isSignUp ? 'Join Alfredo today' : 'Sign in to continue'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border-2 border-black bg-gray-100 shadow-solid-sm hover:shadow-solid transition-all duration-200"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Prominent Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img 
              src="/white_circle_360x360 copy.png" 
              alt="Alfredo Logo" 
              className="w-24 h-24 object-contain drop-shadow-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-primary-500 rounded-xl border-2 border-black shadow-solid-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Text */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-black">Alfredo</h3>
          <p className="text-gray-600 text-sm">AI Nutrition Assistant</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none font-medium"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none font-medium"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-xl shadow-solid-sm focus:shadow-solid focus:outline-none font-medium"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-xl border-2 border-black shadow-solid-sm hover:shadow-solid transition-all duration-200 hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={toggleMode}
              className="ml-2 text-primary-500 font-semibold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;