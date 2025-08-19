'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  RedoOutlined,
  DashboardOutlined,
  UserOutlined,
  WalletOutlined,
  CreditCardOutlined,
  SettingOutlined,
  BellOutlined,
  TeamOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { API_CALL } from '@/lib/client';
import { Statistic } from 'antd';
import 'antd/dist/reset.css';


interface Withdrawal {
  _id: string;
  userId?: {
    email?: string;
    username?: string;
    telegramUsername?: string;
  };
  telegramId?: string;
  activityType?: string;
  amount?: number;
  bdtAmount?: number;
  method: string;
  recipient?: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  metadata?: {
    ipAddress?: string;
    deviceInfo?: string;
    originalAmount?: number;
    currency?: string;
    fee?: number;
    amountAfterFee?: number;
    feeType?: string;
  };
  createdAt: string;
  __v?: number;
}

export default function WithdrawalsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    handleRefresh();
  }, []);


  const handleRefresh = () => {
    setLoading(true);
    API_CALL({ url: '/withdrawals' })
      .then((res) => {
        setWithdrawals(res.response?.result as any);
        console.log(res.response?.result);
      })
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      const { status } = await API_CALL({
        url: `/withdrawals/${id}`,
        method: 'PUT',
        body: { status: 'approved' }
      });

      if (status === 200) {
        handleRefresh();
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      const { status } = await API_CALL({
        url: `/withdrawals/${id}`,
        method: 'PUT',
        body: { status: 'rejected' }
      });

      if (status === 200) {
        handleRefresh();
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/admin/withdrawals/${id}`);
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const username = withdrawal.userId?.username || '';
    const email = withdrawal.userId?.email || '';
    const method = withdrawal.method || '';
    const matchesSearch = [username, email, method]
      .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || withdrawal.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: withdrawals.reduce((sum, w) => sum + (w.amount ?? w.bdtAmount ?? 0), 0),
    approved: withdrawals.filter(w => w.status === 'approved').length,
    pending: withdrawals.filter(w => w.status === 'pending').length
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Users'
    },
    {
      key: '/admin/withdrawals',
      icon: <WalletOutlined />,
      label: 'Withdrawals'
    },
    {
      key: '/admin/payment-methods',
      icon: <CreditCardOutlined />,
      label: 'Payment Methods'
    },
    {
      key: '/admin/notifications',
      icon: <BellOutlined />,
      label: 'Notifications'
    },
    {
      key: '/admin/roles',
      icon: <TeamOutlined />,
      label: 'Roles'
    },
    {
      key: '/admin/history',
      icon: <HistoryOutlined />,
      label: 'History'
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getMethodBadge = (method: string) => {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm">
        <CreditCardOutlined className="text-blue-400" /> {method}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleOutlined className="text-green-400" />;
      case 'rejected':
        return <CloseCircleOutlined className="text-red-400" />;
      default:
        return <ClockCircleOutlined className="text-yellow-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-size-200 animate-gradient p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-300">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <WalletOutlined className="text-white text-xl sm:text-2xl lg:text-3xl" />
              <span className="text-white">Withdrawals</span>
            </div>
           
          </h1>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl sm:rounded-2xl border border-blue-500 p-3 sm:p-4 lg:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 transition-all group">
            <div className="p-2 sm:p-3 lg:p-4 rounded-xl bg-blue-900/40 group-hover:bg-blue-900/60 transition-all flex-shrink-0">
              <WalletOutlined className="text-white text-xl sm:text-2xl lg:text-3xl transition-transform" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <Statistic title={<span className="uppercase tracking-wider text-[10px] sm:text-xs" style={{ color: 'lime' }}>Total Withdrawals</span>} value={stats.total} precision={2} prefix="$" valueStyle={{ color: '#fff', fontWeight: 800, fontSize: '20px' }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl sm:rounded-2xl border border-blue-500 p-3 sm:p-4 lg:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 transition-all group">
            <div className="p-2 sm:p-3 lg:p-4 rounded-xl bg-purple-900/40 group-hover:bg-purple-900/60 transition-all flex-shrink-0">
              <CheckCircleOutlined className="text-white text-xl sm:text-2xl lg:text-3xl transition-transform" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <Statistic title={<span className="uppercase tracking-wider text-[10px] sm:text-xs" style={{ color: 'lime' }}>Approved</span>} value={stats.approved} valueStyle={{ color: '#fff', fontWeight: 800, fontSize: '20px' }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl sm:rounded-2xl border border-blue-500 p-3 sm:p-4 lg:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 transition-all group sm:col-span-2 lg:col-span-1">
            <div className="p-2 sm:p-3 lg:p-4 rounded-xl bg-indigo-900/40 group-hover:bg-indigo-900/60 transition-all flex-shrink-0">
              <ClockCircleOutlined className="text-white text-xl sm:text-2xl lg:text-3xl transition-transform" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <Statistic title={<span className="uppercase tracking-wider text-[10px] sm:text-xs" style={{ color: 'lime' }}>Pending</span>} value={stats.pending} valueStyle={{ color: '#fff', fontWeight: 800, fontSize: '20px' }} />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-[#181A20] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#23272F] p-4 sm:p-6 lg:p-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Recent Withdrawals</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[200px] lg:min-w-[220px]">
                <input
                  type="text"
                  placeholder="Search withdrawals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#23272F] border border-[#30343E] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 placeholder:text-[#C0C0C0] text-sm sm:text-base"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#23272F] border border-[#30343E] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-[#FFD666] text-xs">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Telegram ID</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Net Amount</th>
                  <th className="px-3 py-2">Payment Method</th>
                  <th className="px-3 py-2">Recipient</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((row: any) => (
                  <tr key={row._id} className="border-t border-[#23272F]">
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium">{row.userId?.user ?? 'N/A'}</span>
                        <span className="text-[10px] text-[#aaa]">{row.userId?.email ?? 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] text-[#FFD666] font-mono">{row.telegramId || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] text-[#FFD666] font-mono">{row.userId?.username || row.userId?.telegramUsername || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2">
                      {row.metadata?.originalAmount && row.metadata?.currency ? (
                        <span className="text-[11px] font-medium text-green-400">
                          {row.metadata.originalAmount} {row.metadata.currency.toUpperCase()} <span className="text-[#888]">({((row.amount ?? row.bdtAmount) ?? 0).toFixed(2)})</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-green-400">{((row.amount ?? row.bdtAmount) ?? 0).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.metadata?.amountAfterFee && row.metadata?.currency ? (
                        <span className="text-[11px] font-medium text-blue-400">{row.metadata.amountAfterFee} {row.metadata.currency.toUpperCase()}</span>
                      ) : (
                        <span className="text-[10px] text-[#888]">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{getMethodBadge(row.method)}</td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] font-mono text-[#eee]">{row.recipient || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border ${
                        row.status === 'approved' ? 'text-green-400 border-green-500' :
                        row.status === 'rejected' ? 'text-red-400 border-red-500' : 'text-yellow-400 border-yellow-500'
                      }`}>
                        {getStatusIcon(row.status)} {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium">{new Date(row.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-[#aaa]">{new Date(row.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2 flex-wrap">
                        {row.status === 'pending' ? (
                          <>
                            <button
                              className="text-white text-[10px] bg-green-500 hover:bg-green-600 rounded px-2 py-1 min-w-[50px] h-6"
                              onClick={() => handleApprove(row._id)}
                              disabled={loading}
                            >Approve</button>
                            <button
                              className="text-white text-[10px] bg-red-500 hover:bg-red-600 rounded px-2 py-1 min-w-[50px] h-6"
                              onClick={() => handleReject(row._id)}
                              disabled={loading}
                            >Reject</button>
                            <button
                              className="text-white text-[10px] bg-blue-600 hover:bg-blue-700 rounded px-2 py-1 h-6"
                              onClick={() => handleViewDetails(row._id)}
                            >Details</button>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] text-[#aaa] mr-1">{row.status === 'approved' ? 'Approved' : 'Rejected'}</span>
                            <button
                              className="text-white text-[10px] bg-blue-600 hover:bg-blue-700 rounded px-2 py-1 h-6"
                              onClick={() => handleViewDetails(row._id)}
                            >Details</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) 
}
