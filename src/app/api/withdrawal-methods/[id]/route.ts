import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import WithdrawalMethod from '@/models/WithdrawalMethod';
import dbConnect from '@/lib/dbConnect';

export async function PUT( request: Request ) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    
    const withdrawalMethod = await WithdrawalMethod.findByIdAndUpdate(
      body.id,
      {
        name: body.name,
        image: body.image,
        status: body.status,
        message: body.message,
        fee: body.fee,
        estimatedTime: body.estimatedTime,
        category: body.category,
        minAmount: body.minAmount,
        maxAmount: body.maxAmount,
        currency: body.currency
      },
      { new: true }
    );
    
    if (!withdrawalMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(withdrawalMethod);
  } catch (error) {
    console.error('Error updating withdrawal method:', error);
    return NextResponse.json(
      { error: 'Failed to update withdrawal method' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  params  : any 
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const withdrawalMethod = await WithdrawalMethod.findByIdAndDelete(params.id);
    
    if (!withdrawalMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting withdrawal method:', error);
    return NextResponse.json(
      { error: 'Failed to delete withdrawal method' },
      { status: 400 }
    );
  }
}

