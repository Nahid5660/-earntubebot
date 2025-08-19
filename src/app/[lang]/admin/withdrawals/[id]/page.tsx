"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AdminLayout from '../../layout';
import { API_CALL } from '@/lib/client';

export default function WithdrawalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [withdrawal, setWithdrawal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        const { response, status } = await API_CALL({ url: `/withdrawals/${id}` });
        if (status === 200 && response) {
          setWithdrawal(response.result);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" /></div>
    )
  }
  if (error || !withdrawal) {
    return (

      <div className="text-center py-16">
        <div className="text-2xl font-bold text-white mb-2">Withdrawal Not Found</div>
        <div className="text-sm text-gray-300 mb-6">The withdrawal request you are looking for does not exist.</div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={() => router.push(`/admin/withdrawals`)}>
          <ArrowLeftOutlined /> Back to List
        </button>
      </div>

    );
  }

  return (

    <div className="w-full max-w-full my-10 bg-[#181818] border border-[#222] rounded">
      <div className="flex items-center gap-4 p-4 border-b border-[#222]">
        <span className="text-white font-bold text-lg">Withdrawal Details</span>
        <span className={`ml-auto inline-flex items-center px-2 py-1 rounded text-xs border ${
          withdrawal.status === 'approved' ? 'text-green-400 border-green-500' :
          withdrawal.status === 'rejected' ? 'text-red-400 border-red-500' : 'text-yellow-400 border-yellow-500'
        }`}>
          {withdrawal.status ? withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1) : 'Pending'}
        </span>
        <button className="ml-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={() => router.push(`/admin/withdrawals`)}>
          <ArrowLeftOutlined /> Back
        </button>
      </div>
      <div className="p-6">
        <div className="text-white font-bold text-base mb-3">User Info</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-white text-sm">Username</div>
            <div className="text-white text-sm">
              {withdrawal.userId?.username ?? 'N/A'}
              <div className="text-xs">{withdrawal.userId?.email ?? ''}</div>
            </div>
          </div>
          <div>
            <div className="text-white text-sm">Telegram ID</div>
            <div className="text-white text-sm font-mono">{withdrawal.telegramId || 'N/A'}</div>
          </div>
        </div>
        <div className="border-t border-[#222] my-2" />
        <div className="text-white font-bold text-base mb-3">Withdrawal Info</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-white text-sm">Amount</div>
            <div className="text-white text-sm">
              <span className="font-bold text-green-400">
                {withdrawal.metadata?.originalAmount} {withdrawal.metadata?.currency?.toUpperCase()}
              </span>
              <span className="ml-2">(Net: {withdrawal.metadata?.amountAfterFee} {withdrawal.metadata?.currency?.toUpperCase()})</span>
            </div>
          </div>
          <div>
            <div className="text-white text-sm">Payment Method</div>
            <div className="text-white text-sm">{withdrawal.method?.toUpperCase() || 'N/A'}</div>
          </div>
          <div>
            <div className="text-white text-sm">Recipient</div>
            <div className="text-white text-sm font-mono">{withdrawal.recipient || 'N/A'}</div>
          </div>
          <div>
            <div className="text-white text-sm">Date</div>
            <div className="text-white text-sm">{withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleString() : 'N/A'}</div>
          </div>
        </div>
        <div className="border-t border-[#222] my-2" />
        <div className="text-white font-bold text-base mb-3">Technical Info</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <div className="text-white text-sm">IP Address</div>
            <div className="text-white text-sm">{withdrawal.metadata?.ipAddress || 'N/A'}</div>
          </div>
          <div>
            <div className="text-white text-sm">Device Info</div>
            <div className="text-white text-xs">{withdrawal.metadata?.deviceInfo || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>

  );
}
