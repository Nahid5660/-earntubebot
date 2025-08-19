'use client'

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { XMarkIcon, ArrowLeftIcon, CheckCircleIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import { watchAdRequest, fetchUserStats } from '@/modules/private/user/actions';
import { RootState } from '@/modules/store';

interface TaskModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const DAILY_AD_LIMIT = 300; // UI hint; backend enforces actual limit
const PER_AD_REWARD_USDT = 0.001; // UI hint; backend enforces actual reward

export default function TaskModal({ isOpen, onClose }: TaskModalProps) {
  const dispatch = useDispatch();
  const user: any = useSelector((state: RootState) => state.public.auth.user);

  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [claimingKey, setClaimingKey] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

  const adsWatchedToday = Number(user?.adsWatched) || 0;
  const remainingAds = Math.max(0, DAILY_AD_LIMIT - adsWatchedToday);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => Math.max(0, prev - 1)), 1000);
    }
    return () => timer && clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('features_unlocked');
      setIsUnlocked(saved === 'true');
    } catch {}
  }, [isOpen]);

  const handleWatchAd = async () => {
    try {
      if (adsWatchedToday >= DAILY_AD_LIMIT) {
        toast.error(`Daily ad limit of ${DAILY_AD_LIMIT} reached`);
        return;
      }

      setIsLoading(true);
      if (typeof (window as any).show_9717965 === 'undefined') {
        throw new Error('Ad system not initialized');
      }
      await (window as any).show_9717965();
      dispatch(watchAdRequest() as any);
      dispatch(fetchUserStats() as any);
      setCountdown(15);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to watch ad');
    } finally {
      setIsLoading(false);
    }
  };

  const tasks = useMemo(() => ([
    {
      key: 'join_telegram',
      title: 'Join our Telegram',
      href: 'https://t.me/clickmasterads',
      reward: 0.005,
      type: 'telegram_join'
    },
    {
      key: 'visit_website',
      title: 'Visit our Website',
      href: 'https://clickmasterads.com',
      reward: 0.003,
      type: 'website_visit'
    },
    {
      key: 'download_apk',
      title: 'Download Android APK',
      href: 'https://clickmasterads.com/app.apk',
      reward: 0.01,
      type: 'apk_download'
    }
  ]), []);

  const claimTask = async (taskKey: string, taskType: string, reward: number) => {
    try {
      setClaimingKey(taskKey);
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskKey, taskType, reward })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to claim task');
      toast.success('Reward credited');
      // Refresh stats/user
      dispatch(fetchUserStats() as any);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to claim task');
    } finally {
      setClaimingKey(null);
    }
  };

  const statusLabel = useMemo(() => {
    if (adsWatchedToday >= DAILY_AD_LIMIT) return 'Limit Reached';
    if (countdown > 0) return 'Cooling Down';
    return 'Ready';
  }, [adsWatchedToday, countdown]);

  const statusIcon = useMemo(() => {
    if (adsWatchedToday >= DAILY_AD_LIMIT) return <CheckCircleIcon className="h-6 w-6 text-[#02C076]" />;
    if (countdown > 0) return <ClockIcon className="h-6 w-6 text-[#F0B90B]" />;
    return <CheckCircleIcon className="h-6 w-6 text-[#02C076]" />;
  }, [adsWatchedToday, countdown]);

  const close = () => onClose && onClose();

  const openPayment = () => setIsPaymentOpen(true);
  const closePayment = () => setIsPaymentOpen(false);
  const markAsPaid = () => {
    try {
      localStorage.setItem('features_unlocked', 'true');
    } catch {}
    setIsUnlocked(true);
    setIsPaymentOpen(false);
    toast.success('Features unlocked');
  };

  const binancePayId = '1234567890';
  const paymentAmount = 10; // USDT
  const qrData = encodeURIComponent(`BINANCE_PAY_ID=${binancePayId};AMOUNT=${paymentAmount};CURRENCY=USDT`);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrData}`;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0">
          <div className="min-h-screen w-screen flex items-center justify-center sm:p-4 p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-screen h-screen sm:h-auto sm:w-full sm:max-w-lg transform overflow-hidden bg-[#0B0E11] sm:border sm:border-[#2E353F] sm:rounded-lg transition-all">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-[#2E353F] bg-[#0B0E11] p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={close}
                        className="rounded-lg p-1.5 text-[#1E2329] bg-[#F0B90B] hover:bg-[#F0B90B]/80 focus:outline-none sm:hidden transition-all"
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                      </button>
                      <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                        Tasks
                      </Dialog.Title>
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-lg p-1.5 text-[#1E2329] bg-[#F0B90B] hover:bg-[#F0B90B]/80 focus:outline-none hidden sm:block transition-all"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="h-[calc(100vh-70px)] sm:h-auto overflow-y-auto p-4 sm:p-6 bg-[#0B0E11] space-y-6">
                  {!isUnlocked && (
                    <div className="bg-[#1E2329] rounded-lg p-4 border border-[#2E353F]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">Premium features locked</div>
                          <div className="text-sm text-[#848E9C]">Support the developer to unlock QR payment and advanced tasks.</div>
                        </div>
                        <button
                          onClick={openPayment}
                          className="rounded-lg px-4 py-2 font-medium bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/80"
                        >
                          Unlock
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Status Card */}
                  <div className={`bg-[#1E2329] rounded-lg p-4 border border-[#2E353F] ${!isUnlocked ? 'pointer-events-none blur-sm' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${countdown > 0 ? 'bg-[#F0B90B]/10' : 'bg-[#02C076]/10'}`}>
                          {statusIcon}
                        </div>
                        <div>
                          <div className="text-[#EAECEF] font-medium">{statusLabel}</div>
                          <div className="text-sm text-[#848E9C]">
                            {countdown > 0 ? `Next ad in ${countdown}s` : `You can watch an ad now`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#EAECEF] font-medium">
                          {adsWatchedToday}/{DAILY_AD_LIMIT} Ads
                        </div>
                        <div className="text-sm text-[#02C076]">
                          Reward {PER_AD_REWARD_USDT} USDT/ad
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className={`space-y-4 bg-[#1E2329] rounded-lg p-4 border border-[#2E353F] ${!isUnlocked ? 'pointer-events-none blur-sm' : ''}`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-[#848E9C] mb-1">Balance</div>
                        <div className="text-white font-medium">{Number(user?.balance || 0).toFixed(3)} USDT</div>
                      </div>
                      <div>
                        <div className="text-sm text-[#848E9C] mb-1">Remaining Today</div>
                        <div className="text-white font-medium">{remainingAds} Ads</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#2E353F] space-y-3">
                      <div className="flex justify-between">
                        <div className="text-sm text-[#848E9C]">Per Ad Reward</div>
                        <div className="text-white font-medium">{PER_AD_REWARD_USDT} USDT</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-sm text-[#848E9C]">Cooldown</div>
                        <div className="text-white">15 seconds</div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleWatchAd}
                        disabled={isLoading || countdown > 0 || adsWatchedToday >= DAILY_AD_LIMIT}
                        className={`w-full rounded-lg px-4 py-3 font-medium transition-all ${
                          isLoading || countdown > 0 || adsWatchedToday >= DAILY_AD_LIMIT
                            ? 'bg-[#F0B90B]/40 text-[#1E2329] cursor-not-allowed'
                            : 'bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/80'
                        }`}
                      >
                        {adsWatchedToday >= DAILY_AD_LIMIT
                          ? 'Daily Limit Reached'
                          : countdown > 0
                          ? `Wait ${countdown}s`
                          : isLoading
                          ? 'Loading...'
                          : 'Watch Ad'}
                      </button>
                    </div>
                  </div>

                  {/* Other Tasks */}
                  <div className={`space-y-3 bg-[#1E2329] rounded-lg p-4 border border-[#2E353F] ${!isUnlocked ? 'pointer-events-none blur-sm' : ''}`}>
                    <div className="text-[#EAECEF] font-medium mb-2">Other Tasks</div>
                    {tasks.map(task => (
                      <div key={task.key} className="flex items-center justify-between gap-3 bg-[#0B0E11] border border-[#2E353F] rounded-lg p-3">
                        <div>
                          <div className="text-white font-medium">{task.title}</div>
                          <div className="text-xs text-[#848E9C]">Reward {task.reward} USDT</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={task.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg px-3 py-2 text-sm bg-[#2E353F] text-white hover:bg-[#3a4350]"
                          >
                            Open
                          </a>
                          <button
                            onClick={() => claimTask(task.key, task.type, task.reward)}
                            disabled={claimingKey === task.key}
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              claimingKey === task.key ? 'bg-[#F0B90B]/40 text-[#1E2329] cursor-not-allowed' : 'bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/80'
                            }`}
                          >
                            {claimingKey === task.key ? 'Claiming...' : 'Claim'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info */}
                  <div className={`bg-[#1E2329] rounded-lg p-4 border border-[#2E353F] ${!isUnlocked ? 'pointer-events-none blur-sm' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <InformationCircleIcon className="h-5 w-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-[#EAECEF] font-medium">How it works</div>
                        <div className="text-sm text-[#848E9C] mt-1">
                          Watch ads to earn rewards. Please wait 15 seconds between ads. The admin may change limits and rewards at any time.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Payment Modal for Unlock */}
                <Transition appear show={isPaymentOpen} as={Fragment}>
                  <Dialog as="div" className="relative z-[70]" onClose={closePayment}>
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="fixed inset-0 bg-black/80" />
                    </Transition.Child>
                    <div className="fixed inset-0">
                      <div className="min-h-screen w-screen flex items-center justify-center p-4">
                        <Transition.Child
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                          enterTo="opacity-100 translate-y-0 sm:scale-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                          <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-[#0B0E11] border border-[#2E353F] rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <Dialog.Title className="text-xl font-semibold text-white">Unlock Features</Dialog.Title>
                              <button onClick={closePayment} className="rounded-lg p-1.5 text-[#1E2329] bg-[#F0B90B] hover:bg-[#F0B90B]/80">
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div className="text-sm text-[#EAECEF]">Scan the QR with Binance to pay and unlock premium features.</div>
                              <div className="flex items-center justify-center">
                                <img src={qrSrc} alt="Binance Pay QR" className="w-60 h-60 bg-white rounded-md p-2" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-[#848E9C] mb-1">Binance Pay ID</div>
                                  <div className="text-white font-mono">{binancePayId}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-[#848E9C] mb-1">Amount</div>
                                  <div className="text-white font-medium">{paymentAmount} USDT</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(binancePayId);
                                    toast.success('Binance Pay ID copied');
                                  }}
                                  className="flex-1 rounded-lg px-4 py-2 bg-[#2E353F] text-white hover:bg-[#3a4350]"
                                >
                                  Copy Pay ID
                                </button>
                                <button
                                  onClick={markAsPaid}
                                  className="flex-1 rounded-lg px-4 py-2 bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/80 font-medium"
                                >
                                  I have paid, Unlock
                                </button>
                              </div>
                              <div className="text-xs text-[#848E9C]">After payment, click "I have paid" to unlock immediately. If it doesn't unlock, contact support with your TX proof.</div>
                            </div>
                          </Dialog.Panel>
                        </Transition.Child>
                      </div>
                    </div>
                  </Dialog>
                </Transition>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

 