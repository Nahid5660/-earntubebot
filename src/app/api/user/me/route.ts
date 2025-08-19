import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import History from '@/models/History';
import AdminSettings from '@/models/AdminSettings';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
    try {
        // Get user session
        const session: any = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Connect to database
        await dbConnect();
        
        // Find user by telegramId or email and exclude sensitive fields
        const { telegramId, email } = session.user || {};
        const orConditions: any[] = [];
        if (telegramId) orConditions.push({ telegramId });
        if (email) orConditions.push({ email });

        const user = await User.findOne(orConditions.length ? { $or: orConditions } : { _id: null }).select('-password');

        // Guard: if user not found, return before accessing user._id
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Fetch admin ads settings
        let adsSettings = {
            dailyLimit: 300,
            perAdReward: 0.001,
            referralCommissionPercent: 1
        };
        
        try {
            const adminSettings = await AdminSettings.findOne();
            if (adminSettings?.ads) {
                adsSettings = {
                    dailyLimit: adminSettings.ads.dailyLimit || 300,
                    perAdReward: adminSettings.ads.perAdReward || 0.001,
                    referralCommissionPercent: adminSettings.ads.referralCommissionPercent || 1
                };
            }
        } catch (error) {
            console.error('Error fetching admin ads settings:', error);
            // Continue with default values if admin settings can't be loaded
        }
        
        // Find all users who were referred by the current user
        const referredUsers = await User.find({ referredBy: user._id })
            .select('_id fullName telegramId createdAt totalEarnings')
            .lean();

        // Get recent activity history
        const recentHistory = await History.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get today's earnings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEarnings = await History.aggregate([
            { 
                $match: { 
                    userId: user._id,
                    amount: { $exists: true, $ne: null },
                    createdAt: { $gte: today }
                }
            },
            { 
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate commission for each referred user using configured percentage
        const commissionPercent = adsSettings.referralCommissionPercent / 100;
        const referredUsersWithCommission = referredUsers.map(referredUser => ({
            ...referredUser,
            joinedAt: referredUser.createdAt,
            totalEarnings: referredUser.totalEarnings || 0,
            commission: (referredUser.totalEarnings || 0) * commissionPercent
        }));

        

        // Calculate time remaining if lastWatchTime exists
        const timeRemaining = user.lastWatchTime
            ? Math.max(0, 15 - Math.floor((Date.now() - new Date(user.lastWatchTime).getTime()) / 1000))
            : 0;

        // Calculate level based on ads watched (1 level per 100 ads)
        const level = Math.max(1, Math.floor(user.adsWatched / 100) + 1);

        // Determine rank based on level
        let rank = 'Beginner';
        if (level >= 10) rank = 'Master';
        else if (level >= 7) rank = 'Expert';
        else if (level >= 5) rank = 'Advanced';
        else if (level >= 3) rank = 'Intermediate';

        // Calculate ads required for current level
        const adsRequiredForLevel = (level - 1) * 100;

        // Calculate how many ads left to reach the next level
        const adsToNextLevel = (level * 100) - user.adsWatched;

        // Determine referral tier based on actual referral count
        let referralTier = 'Bronze';
        const referralCount = referredUsers.length;
        if (referralCount >= 50) referralTier = 'Diamond';
        else if (referralCount >= 25) referralTier = 'Platinum';
        else if (referralCount >= 10) referralTier = 'Gold';
        else if (referralCount >= 5) referralTier = 'Silver';

        // Calculate total earnings from referrals
        const totalReferralEarnings = referredUsersWithCommission.reduce((total, user) => total + user.commission, 0);

        // Calculate daily progress
        const dailyProgress = {
            adsWatched: user.adsWatched,
            dailyLimit: adsSettings.dailyLimit,
            remainingAds: Math.max(0, adsSettings.dailyLimit - user.adsWatched),
            progress: Math.min((user.adsWatched / adsSettings.dailyLimit) * 100, 100)
        };

       const userData =  {
            ...user.toObject(),
            rank,
            level,
            adsToNextLevel,
            adsRequiredForLevel,
            referralTier,
            referralCount,
            referralEarnings: totalReferralEarnings,
            referredUsers: referredUsersWithCommission,
            recentActivity: recentHistory,
            todayEarnings: todayEarnings[0]?.total || 0,
            adsSettings,
            dailyProgress
        };

        return NextResponse.json({
            success: true,
            result: { user: userData }
        });
    } catch (error :any) {
        console.error(error.message);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
