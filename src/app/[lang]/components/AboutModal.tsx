'use client';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    dictionary?: {
        about: string;
        close: string;
        welcome: string;
        description: string;
        features: string;
        howItWorks: string;
        support: string;
        version: string;
        rules: string;
        general: string;
        earnings: string;
        withdrawals: string;
        safety: string;
    };
}

export default function AboutModal({
    isOpen,
    onClose,
    dictionary = {
        // Header texts
        about: 'About Adscoun',
        close: 'Close',

        // Welcome section
        welcome: 'Welcome to Adscoun',
        description: 'Your trusted platform for earning rewards by watching ads',

        // Section titles
        features: 'Amazing Features',
        howItWorks: 'How It Works',
        support: 'Get Support',
        rules: 'Rules & Guidelines',
        general: 'General Rules',
        earnings: 'Earnings',
        withdrawals: 'Withdrawals',
        safety: 'Safety & Security',

        // Footer
        version: 'Version'
    }






}: AboutModalProps) {
    if (!isOpen) return null;




    const features = [
        { icon: '💰', title: 'Earn Rewards', description: 'Get paid for watching advertisements' },
        { icon: '🎯', title: 'Daily Tasks', description: 'Complete tasks for bonus earnings' },
        { icon: '🔄', title: 'Auto-Play', description: 'Automated ad viewing experience' },
        { icon: '📊', title: 'Statistics', description: 'Track your earnings and progress' },
        { icon: '🏆', title: 'Achievements', description: 'Unlock rewards for milestones' },
        { icon: '💳', title: 'Easy Withdrawals', description: 'Multiple payment options available' }
    ];



    const howItWorks = [
        'Sign in with your Telegram account',
        'Watch ads to earn rewards',
        'Complete daily tasks for bonuses',
        'Track your progress and achievements',
        'Withdraw earnings when ready'
    ];

    const rules = {
        general: [
            'Watch ads to earn rewards',
            'One account per user',
            'Complete daily tasks for bonuses',
            'Follow community guidelines',
            'Report any issues to support'
        ],
        earnings: [
            'Earn per valid ad view',
            'Daily earnings are capped',
            'Bonus rewards for consistency',
            'Extra earnings from referrals',
            'Achievement rewards available'
        ],
        withdrawals: [
            
            'Processed within 24 hours',
            'Verified account required',
            'Multiple payment methods',
            'Weekly withdrawal limits'
        ],
        safety: [
            'Keep your account secure',
            'Never share your credentials',
            'Use official channels only',
            'Beware of scam attempts',
            'Enable 2FA for protection'
        ]
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="relative h-full md:h-auto w-full md:max-w-2xl md:rounded-2xl md:border border-[#2E353F] bg-[#0B0E11] shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Background decoration elements */}

                {/* Header */}
                <div className="sticky top-0 z-10 p-4 border-b border-[#2E353F] bg-[#0B0E11]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src="/adscoun.svg" alt="Adscoun" className="h-6 w-auto opacity-90" />
                            <h2 className="text-white text-lg font-semibold">{dictionary.about}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-lg bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/90 active:scale-95 transition"
                        >
                            {dictionary.close}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] md:max-h-[80vh]">
                    {/* Welcome Section */}
                    <div className="text-center space-y-3 p-4 rounded-xl bg-gradient-to-b from-purple-900/10 to-indigo-900/10 border border-purple-500/10">
                        <h1 className="text-2xl font-bold rgb-welcome-flicker">
                            {dictionary.welcome}
                        </h1>
                        <style jsx>{`
                            @keyframes rgbWelcomeEffect {
                                0% { color: rgb(255, 0, 0); }
                                30% { color: rgb(255, 165, 0); }
                                40% { color: rgb(255, 255, 0); }
                            70% { color: rgb(0, 255, 0); }
                               
                                80% { color: rgb(128, 0, 128); }
                                100% { color: rgb(255, 0, 0); }
                            }
                            .rgb-welcome-flicker {
                                animation: rgbWelcomeEffect 1s linear infinite;
                                text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
                            }
                        `}</style>
                        <p className="text-gray-300">{dictionary.description}</p>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-1"></div>
                    </div>


                    {/* Support Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent inline-block">{dictionary.support}</h3>
                        <div className="p-4 rounded-xl bg-gradient-to-b from-gray-800/40 to-gray-900/40 border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xl">
                                    💬
                                </div>
                                <div>
                                    <p>  <p className="text-gray-300">Need help? Contact our support team through Telegram </p>
                                        Channel <a href="https://t.me/earntubebot_bot_support" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                                        EarnTubeBot Suport Link  </a></p>

                                    <p> Admin <a href="https://t.me/nahid5660" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                                    MD NAHID HASAN</a></p>

                                    <p>Developer <a href="https://t.me/nahid5660" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                                    MD NAHID HASAN</a></p>

                                    <p className="font-bold mt-4 rgb-flicker" style={{ animation: "rgbFlicker 1s linear infinite" }}>Contact the Admin and developer to design the Bot/website according to your preferences  </p>
                                    <style jsx>{`
                                            @keyframes rgbFlicker {
                                                0% { color: rgb(255, 0, 0); }
                                                33% { color: rgb(0, 255, 0); }
                                                66% { color: rgb(0, 0, 255); }
                                                100% { color: rgb(255, 0, 0); }
                                            }
                                            .rgb-flicker {
                                                font-weight: bold;
                                            }
                                        `}</style>
                                </div>
                            </div>
                        </div>
                    </div>




                    {/* Features Grid */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent inline-block">{dictionary.features}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl bg-gradient-to-b from-gray-800/40 to-gray-900/40 border border-purple-500/30 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xl">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white">{feature.title}</h4>
                                            <p className="text-sm text-gray-400">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent inline-block">{dictionary.howItWorks}</h3>
                        <div className="space-y-4">
                            {howItWorks.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-b from-gray-800/40 to-gray-900/40 border border-purple-500/30 hover:border-purple-500/50 shadow-md hover:shadow-purple-500/20 transition-all duration-300"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-300">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rules & Guidelines */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-green-500">{dictionary.rules}</h3>

                        {/* General Rules */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                                    📋
                                </div>
                                <h4 className="font-medium text-white">{dictionary.general}</h4>
                            </div>
                            <div className="pl-2 space-y-2">
                                {rules.general.map((rule, index) => (
                                    <div key={index} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-purple-400 mt-1">•</span>
                                        <p>{rule}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Earnings */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                                    💰
                                </div>
                                <h4 className="font-medium text-white">{dictionary.earnings}</h4>
                            </div>
                            <div className="pl-2 space-y-2">
                                {rules.earnings.map((rule, index) => (
                                    <div key={index} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-purple-400 mt-1">•</span>
                                        <p>{rule}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Withdrawals */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                                    💳
                                </div>
                                <h4 className="font-medium text-white">{dictionary.withdrawals}</h4>
                            </div>
                            <div className="pl-2 space-y-2">
                                {rules.withdrawals.map((rule, index) => (
                                    <div key={index} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-purple-400 mt-1">•</span>
                                        <p>{rule}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Safety */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                                    🔒
                                </div>
                                <h4 className="font-medium text-white">{dictionary.safety}</h4>
                            </div>
                            <div className="pl-2 space-y-2">
                                {rules.safety.map((rule, index) => (
                                    <div key={index} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-purple-400 mt-1">•</span>
                                        <p>{rule}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Version */}
                    <div className="flex justify-center">
                        <div className="text-center py-2 px-6 rounded-full bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 inline-block mx-auto shadow-md">
                            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                {dictionary.version} 1.0.0
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
