'use client';

import { useState, useEffect, FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { message } from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  SaveOutlined,
} from '@ant-design/icons';

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Maintenance Settings State
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [allowedIps, setAllowedIps] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Ads Settings State
  const [adsDailyLimit, setAdsDailyLimit] = useState('');
  const [adsPerAdReward, setAdsPerAdReward] = useState('');
  const [adsReferralCommissionPercent, setAdsReferralCommissionPercent] = useState('');

  // Site Settings State
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [minWithdrawal, setMinWithdrawal] = useState('');

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [withdrawalNotifications, setWithdrawalNotifications] = useState(false);

  // EVM RPC URLs
  const [bscRpcUrl, setBscRpcUrl] = useState('');
  const [ethRpcUrl, setEthRpcUrl] = useState('');
  const [polygonRpcUrl, setPolygonRpcUrl] = useState('');

  // Load settings on page load
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();

      // Load maintenance settings
      const maintenanceResponse = await fetch('/api/admin/maintenance');
      if (maintenanceResponse.ok) {
        const maintenanceData = await maintenanceResponse.json();
        setMaintenanceEnabled(maintenanceData.isEnabled);
        setMaintenanceMessage(maintenanceData.message || '');
        setAllowedIps(maintenanceData.allowedIps?.join(', ') || '');
        setStartTime(maintenanceData.startTime ? new Date(maintenanceData.startTime).toISOString().slice(0, 16) : '');
        setEndTime(maintenanceData.endTime ? new Date(maintenanceData.endTime).toISOString().slice(0, 16) : '');
      }

      // New response shape: { admin, maintenance }
      const admin = data.admin || {};
      const siteConfig = admin.site || {};
      const notificationConfig = admin.notifications || {};
      const adsConfig = admin.ads || {};
      const evmConfig = admin.evm || {};

      setSiteName(siteConfig.name || '');
      setContactEmail(siteConfig.contactEmail || '');
      setMinWithdrawal((siteConfig.minWithdrawal ?? '').toString());

      setEmailNotifications(Boolean(notificationConfig.email));
      setWithdrawalNotifications(Boolean(notificationConfig.withdrawal));

      setAdsDailyLimit((adsConfig.dailyLimit ?? '').toString());
      setAdsPerAdReward((adsConfig.perAdReward ?? '').toString());
      setAdsReferralCommissionPercent((adsConfig.referralCommissionPercent ?? '').toString());

      setBscRpcUrl(evmConfig.bscRpcUrl || '');
      setEthRpcUrl(evmConfig.ethRpcUrl || '');
      setPolygonRpcUrl(evmConfig.polygonRpcUrl || '');
    } catch (error) {
      console.error('Error loading settings:', error);
      message.error('Failed to load settings');
    }
  };

  // Load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, []);



  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save maintenance settings
      await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isEnabled: maintenanceEnabled,
          message: maintenanceMessage,
          allowedIps: allowedIps.split(',').map(ip => ip.trim()).filter(ip => ip),
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null
        })
      });

      const settings = {
        admin: {
          site: {
            name: siteName,
            contactEmail,
            minWithdrawal: parseFloat(minWithdrawal)
          },
          ads: {
            dailyLimit: parseInt(adsDailyLimit || '0') || 0,
            perAdReward: parseFloat(adsPerAdReward || '0') || 0,
            referralCommissionPercent: parseFloat(adsReferralCommissionPercent || '0') || 0,
          },
          evm: {
            bscRpcUrl,
            ethRpcUrl,
            polygonRpcUrl
          },
          notifications: {
            email: emailNotifications,
            withdrawal: withdrawalNotifications
          }
        }
      };

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      message.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <form onSubmit={handleSaveSettings} className="ml-[5%] p-8">
        <div className="flex justify-between items-center mb-8 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 transition-all duration-300">
          <h1 className="text-2xl font-bold text-gray-100 flex items-center">
            <SettingOutlined className="mr-3 text-green-400" />
            <span className="text-green-400">Settings</span>
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-6 py-3 text-green-400 rounded-xl transition-all duration-300 shadow-md"
              style={{ backgroundColor: 'rgba(163, 163, 163, 0.52)' }}
            >
              <DashboardOutlined />
              <span className="text-green-400">Dashboard</span>
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-md
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
            >
              <SaveOutlined className={`${loading ? 'animate-spin' : ''}`} />
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Maintenance Settings - moved to top */}
          <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-100">Maintenance Mode</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-100">Maintenance Mode</h3>
                  <p className="text-sm text-gray-400">Enable maintenance mode to restrict access to the site</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceEnabled}
                    onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Maintenance Message</label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter maintenance message"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ads Settings */}
          <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-100">Ads Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Daily Ad Limit</label>
                <input
                  type="number"
                  value={adsDailyLimit}
                  onChange={(e) => setAdsDailyLimit(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g. 300"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Per Ad Reward</label>
                <input
                  type="number"
                  step="0.000001"
                  value={adsPerAdReward}
                  onChange={(e) => setAdsPerAdReward(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g. 0.001"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Referral Commission (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={adsReferralCommissionPercent}
                  onChange={(e) => setAdsReferralCommissionPercent(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g. 1"
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </div>

          {/* EVM RPC Settings */}
          <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-100">Blockchain RPC Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">BSC RPC URL</label>
                <input
                  type="url"
                  value={bscRpcUrl}
                  onChange={(e) => setBscRpcUrl(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://bsc-dataseed.binance.org"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ethereum RPC URL</label>
                <input
                  type="url"
                  value={ethRpcUrl}
                  onChange={(e) => setEthRpcUrl(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://mainnet.infura.io/v3/YOUR_KEY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Polygon (MATIC) RPC URL</label>
                <input
                  type="url"
                  value={polygonRpcUrl}
                  onChange={(e) => setPolygonRpcUrl(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://polygon-rpc.com"
                />
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
