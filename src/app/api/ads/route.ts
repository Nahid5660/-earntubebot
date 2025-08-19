import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import History from '@/models/History';
import { handleApiError } from '@/lib/error';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import AdminSettings from '@/models/AdminSettings';

export async function POST(request: Request) {
  try {
    const session : any = await getServerSession(authOptions);
      
    if (!session) {
      const errorResponse = { error: 'Unauthorized', status: 401 };
      handleApiError(errorResponse);
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    await connectDB();

    // Find user and validate
    const user = await User.findOne({ telegramId : session.user.telegramId })
    if (!user) {
      const errorResponse = { error: 'User not found', status: 404 };
      handleApiError(errorResponse);
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Load admin settings (ads config)
    let adminSettings;
    try {
      adminSettings = await AdminSettings.findOne();
    } catch (error) {
      console.error('Error loading admin settings:', error);
      // Continue with default values if admin settings can't be loaded
    }
    
    const adsConfig = adminSettings?.ads || { 
      dailyLimit: 300, 
      perAdReward: 0.001, 
      referralCommissionPercent: 1 
    };

    // Enforce daily ad limit
    const DAILY_AD_LIMIT = adsConfig.dailyLimit ?? 300;
    if (user.adsWatched >= DAILY_AD_LIMIT) {
      const errorResponse = { 
        error: `Daily ad limit of ${DAILY_AD_LIMIT} reached. You have watched ${user.adsWatched} ads today.`, 
        status: 429 
      };
      handleApiError(errorResponse);
      return NextResponse.json(errorResponse, { status: 429 });
    }

    // Check if enough time has passed since last ad (15 seconds)
    const now = new Date();
    if (user.lastWatchTime && now.getTime() - user.lastWatchTime.getTime() < 15000) {
      const errorResponse = { error: 'Please wait 15 seconds before watching another ad', status: 429 };
      handleApiError(errorResponse);
      return NextResponse.json(errorResponse, { status: 429 });
    }

    const reward = adsConfig.perAdReward ?? 0.001;
    
    // Update user stats
    user.balance += reward;
    user.totalEarnings += reward;
    user.adsWatched += 1;
    user.lastWatchTime = now;

    // Create history record for ad watch
    await History.create({
      userId: user.telegramId,
      activityType: 'ad_watch',
      amount: reward,
      description: 'Watched an advertisement',
      metadata: {
        adNumber: user.adsWatched,
        deviceInfo: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        adsConfig: {
          dailyLimit: adsConfig.dailyLimit,
          perAdReward: adsConfig.perAdReward,
          referralCommissionPercent: adsConfig.referralCommissionPercent
        }
      }
    });

    // Handle referral commission if user was referred
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const commissionPercent = (adsConfig.referralCommissionPercent ?? 1) / 100;
        const commission = reward * commissionPercent;
        referrer.balance += commission;
        referrer.totalEarnings += commission;
        await referrer.save();

        // Create history record for referral commission
        await History.create({
          userId: referrer._id,
          activityType: 'referral_commission',
          amount: commission,
          description: 'Referral commission from ad watch',
          metadata: {
            referralId: user._id.toString(),
            referralName: user.fullName,
            originalAmount: reward,
            commissionPercent: adsConfig.referralCommissionPercent
          }
        });
      }
    }

    await user.save();

    const result = { 
      newBalance: user.balance, 
      reward, 
      adsWatched: user.adsWatched,
      dailyLimit: DAILY_AD_LIMIT,
      remainingAds: DAILY_AD_LIMIT - user.adsWatched
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Ad watch recorded successfully', 
      result 
    });

  } catch (error) {
    console.error('Error processing ad watch:', error);
    const errorResponse = { error: 'Internal server error while processing ad watch', status: 500 };
    handleApiError(errorResponse);
    return NextResponse.json(
      { error: errorResponse.error, message: 'Internal Server Error', status: errorResponse.status }, 
      { status: errorResponse.status }
    );
  }
}