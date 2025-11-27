import React from 'react';

const Header = () => {
    return (
        <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        Absent<span className="text-indigo-600">Doc</span>
                    </h1>
                </div>
                <nav className="flex gap-4">
                    <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                        사용 가이드
                    </button>
                    <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                        문의하기
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
