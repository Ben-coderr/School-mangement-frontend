import React from 'react';

const AuthFooter: React.FC = () => {
  return (
    <div className="px-6 py-4 bg-gray-50 rounded-b-xl text-center text-gray-500 text-sm">
      <p>
        By continuing, you agree to our{' '}
        <a href="#" className="text-blue-600 hover:text-blue-500 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-blue-600 hover:text-blue-500 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default AuthFooter;