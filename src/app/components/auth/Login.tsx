import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X } from 'lucide-react';

interface LoginProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export function Login({ onClose, onSwitchToSignUp }: LoginProps) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDemoMessage('');
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      
      // Make error messages more user-friendly
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again or create a new account.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-[#1B4332] mb-6">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {error === 'Invalid login credentials' && (
            <div className="text-blue-600 text-sm bg-blue-50 p-3 rounded-lg">
              Don't have an account yet? Click "Sign Up" below to create one, or use the demo credentials.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D6A4F] text-white py-3 rounded-lg hover:bg-[#1B4332] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or try demo</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'demo@retirepath.com',
                password: 'demo123456'
              });
            }}
            className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Fill Demo Credentials
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-[#2D6A4F] hover:underline"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}