'use client';

import { useEffect, useState, FormEvent } from 'react';
import { message } from 'antd';

export default function BlockchainRpcPage() {
  const [loading, setLoading] = useState(false);
  const [bscRpcUrl, setBscRpcUrl] = useState('');
  const [ethRpcUrl, setEthRpcUrl] = useState('');
  const [polygonRpcUrl, setPolygonRpcUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        const evm = data?.admin?.evm || {};
        setBscRpcUrl(evm.bscRpcUrl || '');
        setEthRpcUrl(evm.ethRpcUrl || '');
        setPolygonRpcUrl(evm.polygonRpcUrl || '');
      } catch (e) {
        message.error('Failed to load RPC settings');
      }
    };
    load();
  }, []);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        admin: {
          evm: {
            bscRpcUrl,
            ethRpcUrl,
            polygonRpcUrl,
          },
        },
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      message.success('RPC settings saved');
    } catch (e) {
      message.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 max-w-3xl">
        <h1 className="text-xl font-semibold mb-6 text-gray-100">Blockchain RPC Configuration</h1>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">BSC RPC URL</label>
            <input
              type="url"
              value={bscRpcUrl}
              onChange={(e) => setBscRpcUrl(e.target.value)}
              placeholder="https://bsc-dataseed.binance.org"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Ethereum RPC URL</label>
            <input
              type="url"
              value={ethRpcUrl}
              onChange={(e) => setEthRpcUrl(e.target.value)}
              placeholder="https://mainnet.infura.io/v3/YOUR_KEY"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Polygon (MATIC) RPC URL</label>
            <input
              type="url"
              value={polygonRpcUrl}
              onChange={(e) => setPolygonRpcUrl(e.target.value)}
              placeholder="https://polygon-rpc.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-semibold text-[#1E2329] bg-[#F0B90B] hover:bg-[#F0B90B]/90 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Save RPC Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


