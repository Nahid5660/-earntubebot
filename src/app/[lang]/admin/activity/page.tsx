'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HistoryOutlined, 
  ReloadOutlined,
  EyeOutlined,
  LinkOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';

interface Activity {
  _id: string;
  userId: {
    _id?: string;
    fullName: string;
    telegramId: string;
  };
  type: string;
  details: string;
  status: string;
  amount?: number;
  metadata?: any;
  createdAt: string;
}

interface ActivityStats {
  total: number;
  today: number;
  adWatches: number;
  linkVisits: number;
  referrals: number;
  commissions: number;
}

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    today: 0,
    adWatches: 0,
    linkVisits: 0,
    referrals: 0,
    commissions: 0
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/activity');
      if (!response.ok) throw new Error('Failed to fetch activities');
      
      const data = await response.json();
      setActivities(data.activities || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ad_watch':
        return <EyeOutlined className="text-blue-500" />;
      case 'link_visit':
        return <LinkOutlined className="text-green-500" />;
      case 'referral_signup':
        return <UserOutlined className="text-purple-500" />;
      case 'referral_commission':
        return <DollarOutlined className="text-yellow-500" />;
      case 'login':
        return <HistoryOutlined className="text-gray-500" />;
      default:
        return <HistoryOutlined className="text-gray-500" />;
    }
  };

  const formatActivityType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleRefresh = () => {
    fetchActivities();
    toast.success('Activities refreshed');
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="ml-[5%] p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
          <h1 className="text-2xl font-bold text-gray-100 flex items-center">
            <HistoryOutlined className="mr-3 text-blue-400" />
            <span className="text-blue-400">System Activities</span>
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-6 py-3 text-blue-400 rounded-xl transition-all duration-300 shadow-md"
              style={{ backgroundColor: 'rgba(163, 163, 163, 0.52)' }}
            >
              <span className="text-blue-400">Dashboard</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
            >
              <ReloadOutlined className={`${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <HistoryOutlined className="text-blue-400 text-2xl" />
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today</p>
                <p className="text-2xl font-bold text-green-400">{stats.today}</p>
              </div>
              <EyeOutlined className="text-green-400 text-2xl" />
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ad Watches</p>
                <p className="text-2xl font-bold text-blue-400">{stats.adWatches}</p>
              </div>
              <EyeOutlined className="text-blue-400 text-2xl" />
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Link Visits</p>
                <p className="text-2xl font-bold text-green-400">{stats.linkVisits}</p>
              </div>
              <LinkOutlined className="text-green-400 text-2xl" />
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Referrals</p>
                <p className="text-2xl font-bold text-purple-400">{stats.referrals}</p>
              </div>
              <UserOutlined className="text-purple-400 text-2xl" />
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Commissions</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.commissions}</p>
              </div>
              <DollarOutlined className="text-yellow-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Activity</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No activities found
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getActivityIcon(activity.type)}
                          <span className="text-gray-200">
                            {formatActivityType(activity.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-200">{activity.userId?.fullName || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {activity.amount ? (
                          <span className="text-green-400 font-medium">
                            ${activity.amount.toFixed(6)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {new Date(activity.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm max-w-xs truncate">
                        {activity.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
