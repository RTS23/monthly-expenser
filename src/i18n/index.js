import { en } from './en';
import { id } from './id';

export const translations = { en, id };

export const getTranslation = (language, key) => {
    const keys = key.split('.');
    let value = translations[language] || translations.en;

    for (const k of keys) {
        value = value?.[k];
    }

    return value || key;
};
