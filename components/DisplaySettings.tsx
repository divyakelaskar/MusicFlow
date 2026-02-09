'use client';
import { useState } from 'react';
import { DisplaySettings as DisplaySettingsType } from '@/types';

interface DisplaySettingsProps {
    settings: DisplaySettingsType;
    onSettingsChange: (settings: DisplaySettingsType) => void;
    colors: {
        heading: string;
        accent: string;
    };
}

export default function DisplaySettings({ settings, onSettingsChange, colors }: DisplaySettingsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSetting = (key: keyof DisplaySettingsType) => {
        onSettingsChange({
            ...settings,
            [key]: !settings[key]
        });
    };

    const settingLabels: Record<keyof DisplaySettingsType, string> = {
        showYear: 'Year',
        showGenre: 'Genre',
        showTrackNumber: 'Track Number',
        showDuration: 'Duration',
        showComposer: 'Composer',
        showComment: 'Comment',
        showLyrics: 'Lyrics',
    };

    return (
        <div className="relative">
            <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: colors.accent }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
            
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-50 border border-gray-200"
                    style={{ color: colors.heading }}
                >
                    <div className="p-4">
                        <h3 className="font-bold mb-3" style={{ color: colors.heading }}>
                            Display Settings
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(settingLabels).map(([key, label]) => (
                                key !== 'showFileInfo'&& (
                                    <label key={key} className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm">{label}</span>
                                        <button
                                            onClick={() => toggleSetting(key as keyof DisplaySettingsType)}
                                            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${settings[key as keyof DisplaySettingsType] ? 'bg-blue-500' : 'bg-gray-300'}`}
                                        >
                                            <div 
                                                className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${settings[key as keyof DisplaySettingsType] ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </label>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}