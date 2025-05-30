'use client'
import React, { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import AuthToggle from '../../components/auth/AuthToggle';
import AuthFooter from '../../components/auth/AuthFooter';

const AuthPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* EduSphere-style Navbar */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <a href="https://eduspherepublic.netlify.app/" className="flex items-center">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <img src="/logo.png" alt="EduSphere" className="h-10 w-auto"/>
                                </div>
                            </div>
                        </a>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="https://eduspherepublic.netlify.app/#features"
                               className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
                            <a href="https://eduspherepublic.netlify.app/#demo" className="text-gray-600 hover:text-gray-900 font-medium">Demo</a>
                            <a href="https://eduspherepublic.netlify.app/#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
                            <a href="https://eduspherepublic.netlify.app/#testimonials" className="text-gray-600 hover:text-gray-900 font-medium">Testimonials</a>
                            <a href="https://eduspherepublic.netlify.app/#faq" className="text-gray-600 hover:text-gray-900 font-medium">FAQ</a>
                        </nav>

                        {/* Auth Buttons - Desktop */}
                        {/*<div className="hidden md:flex items-center space-x-4">*/}
                        {/*    <button*/}
                        {/*        className="text-gray-800 font-medium hover:text-blue-600 transition-colors"*/}
                        {/*        onClick={() => setActiveTab('login')}*/}
                        {/*    >*/}
                        {/*        Login*/}
                        {/*    </button>*/}
                        {/*    <button*/}
                        {/*        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"*/}
                        {/*        onClick={() => setActiveTab('register')}*/}
                        {/*    >*/}
                        {/*        Sign Up*/}
                        {/*    </button>*/}
                        {/*</div>*/}

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden flex items-center p-2 rounded-md text-gray-700 hover:text-blue-600"
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                            aria-label="Toggle menu"
                        >
                            {!isMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4 shadow-md">
                        <nav className="flex flex-col space-y-3">
                            <a href="#" className="text-gray-600 hover:text-gray-900 py-2">Features</a>
                            <a href="#" className="text-gray-600 hover:text-gray-900 py-2">Demo</a>
                            <a href="#" className="text-gray-600 hover:text-gray-900 py-2">Pricing</a>
                            <a href="#" className="text-gray-600 hover:text-gray-900 py-2">Testimonials</a>
                            <a href="#" className="text-gray-600 hover:text-gray-900 py-2">FAQ</a>
                            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100 mt-2">
                                <button
                                    className="text-gray-800 font-medium hover:text-blue-600 py-2 text-left"
                                    onClick={() => setActiveTab('login')}
                                >
                                    Login
                                </button>
                                <button
                                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                                    onClick={() => setActiveTab('register')}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Auth Content */}
            <div className="flex items-center justify-center h-[75vh] p-4 sm:p-6 pt-16">
                <div className="w-full  max-w-md">
                    <div className="bg-white rounded-xl shadow-lg">
                        <div className="p-6 sm:p-8">
                            <AuthToggle activeTab={activeTab} setActiveTab={setActiveTab} />
                            <div className="mt-8">
                                {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
                            </div>
                        </div>
                        <AuthFooter />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;