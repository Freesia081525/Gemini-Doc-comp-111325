
import React from 'react';
import { Theme, ThemeKey, Language } from '../types';
import { FLOWER_THEMES } from '../constants';
import { Palette, Languages, Moon, Sun, KeyRound } from 'lucide-react';

// Fix: Removed API key props as they are no longer managed through the UI.
interface SidebarProps {
    theme: ThemeKey;
    setTheme: (theme: ThemeKey) => void;
    darkMode: boolean;
    setDarkMode: (dark: boolean) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: any;
    currentTheme: Theme;
}

export const Sidebar: React.FC<SidebarProps> = ({
    theme, setTheme, darkMode, setDarkMode, language, setLanguage, t, currentTheme
}) => {
    return (
        <aside className="fixed top-0 left-0 w-64 h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-2xl z-10 p-4 transform -translate-x-full md:translate-x-0 transition-transform duration-300">
            <div className="flex flex-col h-full">
                <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: currentTheme.accent }}>
                    {currentTheme.icon} {t.sidebar.title}
                </h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold flex items-center mb-2"><Palette className="w-4 h-4 mr-2" />{t.sidebar.theme}</label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as ThemeKey)}
                            className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        >
                            {Object.keys(FLOWER_THEMES).map(key => (
                                <option key={key} value={key}>
                                    {FLOWER_THEMES[key as ThemeKey].icon} {key}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold flex items-center mb-2"><Languages className="w-4 h-4 mr-2" />{t.sidebar.language}</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        >
                            <option value="en">English</option>
                            <option value="zh_TW">繁體中文</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold flex items-center mb-2">{darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}{t.sidebar.darkMode}</label>
                        <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-between p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                           <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                           {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
                        </button>
                    </div>

                    {/* Fix: Removed API Key input from UI as per guidelines. */}
                </div>

                <div className="mt-auto text-center text-xs opacity-60">
                    <p>Agentic AI System v1.0</p>
                    <p>&copy; 2024</p>
                </div>
            </div>
        </aside>
    );
};
