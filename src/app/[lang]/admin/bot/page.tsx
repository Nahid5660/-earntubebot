'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';

export default function BotConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [botToken, setBotToken] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [siteTitle, setSiteTitle] = useState('');

  const load = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      const admin = data.admin || {};
      const bot = admin.bot || {};
      const site = admin.site || {};
      setBotToken(bot.token || '');
      setBotUsername(bot.username || '');
      setSiteTitle(site.name || '');
    } catch (e) {
      console.error(e);
      toast.error('Failed to load bot configuration');
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        admin: {
          bot: {
            token: botToken,
            username: botUsername
          },
          site: {
            name: siteTitle
          }
        }
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Bot configuration saved successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save bot configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <form onSubmit={onSubmit} className="ml-[5%] p-8">
        <div className="flex justify-between items-center mb-8 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 transition-all duration-300">
          <h1 className="text-2xl font-bold text-gray-100 flex items-center">
            <SettingOutlined className="mr-3 text-green-400" />
            <span className="text-green-400">Bot Configuration</span>
          </h1>
          <button
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
          >
            <SaveOutlined className={`${loading ? 'animate-spin' : ''}`} />
            Save Changes
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Bot Token</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter bot token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Bot Username</label>
              <input
                type="text"
                value={botUsername}
                onChange={(e) => setBotUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter bot username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Site Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter site title"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


