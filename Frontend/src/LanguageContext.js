// src/LanguageContext.js
import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('EN');

    const toggleLanguage = () => {
        setLanguage((prevLang) => {
            const newLang = prevLang === 'EN' ? 'TH' : 'EN';
            localStorage.setItem('language', newLang); // บันทึกภาษาใน localStorage
            return newLang;
        });
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};