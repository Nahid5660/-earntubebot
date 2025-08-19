import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/db';
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ telegramId: session.user.telegramId });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const getUtcDateString = (date: Date) => date.toISOString().split('T')[0];
    const todayUtc = getUtcDateString(new Date());
    const lastResetUtc = user.lastResetDate ? getUtcDateString(new Date(user.lastResetDate)) : null;

    if (lastResetUtc === todayUtc) {
      return NextResponse.json({ success: false, message: 'Already reset today' }, { status: 400 });
    }

    user.adsWatched = 0;
    user.lastResetDate = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Daily reset successful',
      result: {
        adsWatched: user.adsWatched,
        lastResetDate: user.lastResetDate,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}