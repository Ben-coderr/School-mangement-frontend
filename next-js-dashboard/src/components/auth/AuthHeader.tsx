import React from 'react';
import { BookOpen } from 'lucide-react';

const AuthHeader: React.FC = () => {
  return (
    <div className="text-center p-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-2xl">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm">
        <BookOpen className="w-8 h-8 text-white" />
      </div>
    </div>
  );
};

export default AuthHeader;