'use client';

import { motion } from 'framer-motion';
const gradient = 'bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600';

const GradientMessageIcon = () => (
  <svg
    className="w-20 h-20 mx-auto"
    viewBox="0 0 24 24"
    fill="none"
    stroke="url(#gradStroke)"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <defs>
      <linearGradient id="gradStroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
    </defs>
    {/* Lucide "message-square" path */}
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MessagesPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-transparent px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6"
      >
        <GradientMessageIcon />
        <h1
          className={`text-4xl font-bold tracking-tight text-transparent bg-clip-text ${gradient}`}
        >
          Messages
        </h1>
        <p
          className={`text-lg max-w-md mx-auto text-transparent bg-clip-text ${gradient}`}
        >
          We're busy crafting an awesome messaging experience for you. Stay tuned — it's launching soon!
        </p>
      </motion.div>
    </div>
  );
};

export default MessagesPage;
