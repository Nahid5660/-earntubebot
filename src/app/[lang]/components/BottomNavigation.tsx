'use client';

import { useTranslation } from "react-i18next";
import { useSelector } from 'react-redux';
import { RootState } from '@/modules/store';
import { BanknotesIcon, TrophyIcon, BellIcon, InformationCircleIcon, UsersIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface BottomNavigationProps {
    onWithdraw: () => void;
    onTopEarners: () => void;
    onAbout: () => void;
    onTasks: () => void;
    onNotice: () => void;
}

export default function BottomNavigation({ onWithdraw, onTopEarners, onAbout, onTasks, onNotice }: BottomNavigationProps) {
    const { t } = useTranslation();
    const maintenanceData = useSelector((state: RootState) => state.private.settings.maintenance);
    
    if (maintenanceData?.isEnabled) {
        return null;
    }
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0E11]/95 backdrop-blur-xl border-t border-[#2E353F] shadow-2xl pb-safe md:hidden">
            <div className="max-w-screen-xl mx-auto px-2 sm:px-4">
                <div className="grid grid-cols-5 items-end py-2 sm:py-3">
                    <NavButton icon={<TrophyIcon className="h-6 w-6" />} label={t('topEarners')} onClick={onTopEarners} />
                    <NavButton icon={<BellIcon className="h-6 w-6" />} label={t('notice')} onClick={onNotice} />
                    <NavButton 
                        icon={<BanknotesIcon className="h-7 w-7" />} 
                        label={t('withdraw')} 
                        onClick={onWithdraw}
                        variant="primary"
                    />
                    <NavButton icon={<InformationCircleIcon className="h-6 w-6" />} label={t('about')} onClick={onAbout} />
                    <NavButton icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />} label={t('tasks') || 'Tasks'} onClick={onTasks} />
                     
                </div>
            </div>
        </nav>
    );
}

interface NavButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary';
}

function NavButton({ icon, label, onClick, variant = 'default' }: NavButtonProps) {
    if (variant === 'primary') {
        return (
            <div className="flex flex-col items-center justify-center">
                <button
                    onClick={onClick}
                    aria-label={label}
                    className="group grid place-items-center w-14 h-14 rounded-2xl bg-[#F0B90B] text-[#1E2329] shadow-[0_8px_24px_rgba(240,185,11,0.35)] hover:bg-[#F0B90B]/90 active:scale-95 transition-all"
                >
                    <span className="group-active:scale-95 transition-transform duration-150">{icon}</span>
                </button>
                <span className="mt-1 text-[10px] font-semibold text-[#EAECEF]">{label}</span>
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="group flex flex-col items-center justify-center px-2 py-1"
        >
            <span className="mb-1 text-[#A8B0BA] group-hover:text-white transition-colors">
                {icon}
            </span>
            <span className="text-[10px] font-medium text-[#A8B0BA] group-hover:text-white transition-colors">{label}</span>
        </button>
    );
}
