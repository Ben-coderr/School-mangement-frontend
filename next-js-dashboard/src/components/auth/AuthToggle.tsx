import React from 'react';

interface AuthToggleProps {
  activeTab: 'login' | 'register';
  setActiveTab: (tab: 'login' | 'register') => void;
}

const AuthToggle: React.FC<AuthToggleProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="inline-flex items-center p-1 w-full rounded-lg bg-gray-50">
      <button
        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
          activeTab === 'login'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        onClick={() => setActiveTab('login')}
      >
        Sign In
      </button>
      
      {/*<button*/}
      {/*  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${*/}
      {/*    activeTab === 'register'*/}
      {/*      ? 'bg-white text-blue-600 shadow-sm'*/}
      {/*      : 'text-gray-600 hover:text-gray-900'*/}
      {/*  }`}*/}
      {/*  onClick={() => setActiveTab('register')}*/}
      {/*>*/}
      {/*  Sign Up*/}
      {/*</button>*/}
    </div>
  );
};

export default AuthToggle;