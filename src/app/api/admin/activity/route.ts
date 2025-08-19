import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/db';
import History from '@/models/History';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const activityType = searchParams.get('activityType');
    const dateRange = searchParams.get('dateRange') || '7d';

    // Build query
    const query: any = {};

    if (activityType) {
      query.activityType = activityType;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case '1d':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      query.createdAt = { $gte: startDate };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch history records with user details
    const historyRecords = await History.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user details for each history record
    const activities = await Promise.all(
      historyRecords.map(async (record) => {
        const user = await User.findOne({ telegramId: record.telegramId })
          .select('fullName telegramId')
          .lean();

        return {
          _id: record._id,
          userId: user || { fullName: 'Unknown User', telegramId: record.telegramId },
          type: record.activityType,
          details: record.description,
          status: 'completed', // History records are always completed
          amount: record.amount,
          metadata: record.metadata,
          createdAt: record.createdAt
        };
      })
    );

    // Get total count for pagination
    const total = await History.countDocuments(query);

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await History.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          today: [
            { $match: { createdAt: { $gte: today } } },
            { $count: 'count' }
          ],
          adWatches: [
            { $match: { activityType: 'ad_watch' } },
            { $count: 'count' }
          ],
          linkVisits: [
            { $match: { activityType: 'link_visit' } },
            { $count: 'count' }
          ],
          referrals: [
            { $match: { activityType: 'referral_signup' } },
            { $count: 'count' }
          ],
          commissions: [
            { $match: { activityType: 'referral_commission' } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const statsData = {
      total: stats[0].total[0]?.count || 0,
      today: stats[0].today[0]?.count || 0,
      adWatches: stats[0].adWatches[0]?.count || 0,
      linkVisits: stats[0].linkVisits[0]?.count || 0,
      referrals: stats[0].referrals[0]?.count || 0,
      commissions: stats[0].commissions[0]?.count || 0
    };

    return NextResponse.json({
      success: true,
      activities,
      stats: statsData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
 