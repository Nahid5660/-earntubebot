import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import connectDB from '@/lib/db';
import { authOptions } from '@/lib/authOptions';
import User from '@/models/User';
import History from '@/models/History';

export async function POST(request: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskKey, taskType, reward } = body || {};

    if (!taskKey || typeof taskKey !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing taskKey' }, { status: 400 });
    }
    if (!taskType || typeof taskType !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing taskType' }, { status: 400 });
    }
    if (typeof reward !== 'number' || reward <= 0) {
      return NextResponse.json({ error: 'Invalid reward amount' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ telegramId: session.user.telegramId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent duplicate rewards for the same task
    const existing = await History.findOne({
      telegramId: session.user.telegramId,
      activityType: 'link_visit',
      'metadata.taskKey': taskKey
    });
    if (existing) {
      return NextResponse.json({ error: 'Task already completed' }, { status: 409 });
    }

    user.balance += reward;
    user.totalEarnings += reward;
    await user.save();

    await History.create({
      telegramId: session.user.telegramId,
      activityType: 'link_visit', // reuse existing enum; store actual task in metadata
      amount: reward,
      description: `Completed task: ${taskType}`,
      metadata: { taskKey, taskType }
    });

    return NextResponse.json({
      success: true,
      message: 'Task completed and reward credited',
      result: { newBalance: user.balance, reward }
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


