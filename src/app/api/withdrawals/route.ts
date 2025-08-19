import { NextResponse } from 'next/server';

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import WithdrawalHistory from '@/models/WithdrawalHistory';
import WithdrawalMethod from '@/models/WithdrawalMethod';

// Constants for conversion
const USD_TO_BDT_RATE = 100; // 1 USD = 100 BDT



// Helper function to parse fee string from WithdrawalMethod
function parseFeeString(feeString: string): { percentage: number; fixed: number } {
    const fee = feeString.trim();
    
    // Handle percentage fees (e.g., "10%", "5.5%")
    if (fee.includes('%')) {
        const percentage = parseFloat(fee.replace('%', ''));
        return { percentage: isNaN(percentage) ? 0 : percentage, fixed: 0 };
    }
    
    // Handle fixed fees (e.g., "1 USDT", "0.5 BTC")
    const fixed = parseFloat(fee.replace(/[^\d.]/g, ''));
    return { percentage: 0, fixed: isNaN(fixed) ? 0 : fixed };
}

// Helper function to calculate fee
async function calculateFee(amount: number, method: string): Promise<{ fee: number; amountAfterFee: number; feeBreakdown: any }> {
    // Fetch fee information from WithdrawalMethod model
    const withdrawalMethod = await WithdrawalMethod.findOne({ id: method.toLowerCase() });
    
    if (!withdrawalMethod) {
        // Fallback to default fee structure
        const defaultFee = { percentage: 10, fixed: 0 };
        const percentageFee = (amount * defaultFee.percentage) / 100;
        const totalFee = percentageFee + defaultFee.fixed;
        const amountAfterFee = amount - totalFee;
        
        return { 
            fee: totalFee, 
            amountAfterFee,
            feeBreakdown: {
                baseFee: percentageFee + defaultFee.fixed,
                networkMultiplier: 1.0,
                networkDescription: 'Default fee',
                percentageFee: defaultFee.percentage,
                fixedFee: defaultFee.fixed,
                methodNotFound: true
            }
        };
    }
    
    // Parse fee from the model
    const feeStructure = parseFeeString(withdrawalMethod.fee);
    const percentageFee = (amount * feeStructure.percentage) / 100;
    const baseFee = percentageFee + feeStructure.fixed;
    
    const totalFee = baseFee;
    const amountAfterFee = amount - totalFee;
    
    return { 
        fee: totalFee, 
        amountAfterFee,
        feeBreakdown: {
            baseFee: percentageFee + feeStructure.fixed,
            networkMultiplier: 1.0,
            networkDescription: 'Mobile Banking fee',
            percentageFee: feeStructure.percentage,
            fixedFee: feeStructure.fixed,
            methodName: withdrawalMethod.name,
            originalFeeString: withdrawalMethod.fee
        }
    };
}

// Helper function to convert USDT to BDT
function convertUSDTtoBDT(usdtAmount: number): number {
    return usdtAmount * USD_TO_BDT_RATE;
}

// Helper function to convert BDT to USDT
function convertBDTtoUSDT(bdtAmount: number): number {
    return bdtAmount / USD_TO_BDT_RATE;
}

// Helper function to validate Bangladeshi phone number
function validateBangladeshiPhoneNumber(number: string): boolean {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Handle both local (01) and international (+880) formats
    let localFormat = cleanNumber;
    if (cleanNumber.startsWith('880')) {
        localFormat = cleanNumber.slice(3); // Remove 880 prefix
    }

    // Check if it starts with 0
    if (localFormat.startsWith('0')) {
        localFormat = localFormat.slice(1); // Remove leading 0
    }
    
    // Now the number should be just 10 digits starting with 1
    if (localFormat.length !== 10 || !localFormat.startsWith('1')) {
        return false;
    }

    // Check if it starts with valid Bangladesh operator codes
    const validPrefixes = ['13', '14', '15', '16', '17', '18', '19'];
    const prefix = localFormat.substring(0, 2);
    
    return validPrefixes.includes(prefix);
}


export async function GET() {
    try {

        await dbConnect();

        const session: any = await getServerSession(authOptions);
        
    

        if (session.user?.role === 'admin') {
            const withdrawals = await WithdrawalHistory.find({}).limit(500).sort({ createdAt: -1 });
           // Map with user and BDT conversion
           const withdrawalsWithDetails  = await Promise.all(
              withdrawals.map(async (w)=>{
                       // Find the user based on ID in withdrawal (assume w.userId exists)
                       const user = await User.findOne({ telegramId : w.telegramId });
                       const bdtAmount = ['bkash', 'nagad'].includes(w.method.toLowerCase())
                       ? w.amount
                       :   convertUSDTtoBDT(w.amount);

                       return {
                         ...w._doc ,
                         bdtAmount,
                         userId : {
                           username : `@${user?.username}`,
                           user  : user?.fullName,
                           email : user.email
                         }
                         
                       }
              })
           )

           return NextResponse.json({ result: withdrawalsWithDetails });
        }

       


        if (session && session.user?.role === 'user') {
            const withdrawals = await WithdrawalHistory.find({ telegramId : session.user.telegramId }).sort({ createdAt: -1 });
            const withdrawalsWithConversion = withdrawals.map(w => ({
                ...w._doc,
                bdtAmount: w.method.toLowerCase() === 'bkash' || w.method.toLowerCase() === 'nagad'
                    ? w.amount
                    : convertUSDTtoBDT(w.amount)
            }));

            return NextResponse.json({ result: withdrawalsWithConversion });
        }



    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await dbConnect();

        const data = await req.json();
        const { method, amount, recipient, network, type } = data;

        // Validate required fields
        if (!method || !amount || !recipient) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Only allow Mobile Banking methods
        if (type === 'crypto') {
            return NextResponse.json(
                { error: 'Crypto withdrawals are currently in maintenance mode. Please use Mobile Banking methods.' },
                { status: 400 }
            );
        }

        // Validate network value (should not be provided for mobile banking)
        if (network) {
            return NextResponse.json(
                { error: 'Network parameter is not required for Mobile Banking methods' },
                { status: 400 }
            );
        }

        // Validate withdrawal method exists, is active, and is Mobile Banking
        const withdrawalMethod = await WithdrawalMethod.findOne({ id: 'wm_mobile banking_1755632583285' });
        if (!withdrawalMethod) {
            return NextResponse.json(
                { error: 'Invalid withdrawal method' },
                { status: 400 }
            );
        }

        if (withdrawalMethod.status !== 'active') {
            const errorMessage = withdrawalMethod.message || 'This payment method is currently unavailable';
            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            );
        }

        if (withdrawalMethod.category !== 'Mobile Banking') {
            return NextResponse.json(
                { error: 'Only Mobile Banking methods are currently supported. Crypto withdrawals are in maintenance mode.' },
                { status: 400 }
            );
        }

        // Parse amount as float and validate
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        // Validate recipient - only Mobile Banking methods allowed
        if (!validateBangladeshiPhoneNumber(recipient)) {
            return NextResponse.json(
                { error: 'Invalid phone number format' },
                { status: 400 }
            );
        }
        const amountInUSDT = convertBDTtoUSDT(numAmount);

        // Calculate fees
        const { fee, amountAfterFee, feeBreakdown } = await calculateFee(
            convertBDTtoUSDT(numAmount),
            method
        );

        // Validate amount based on withdrawal method limits
        const amountToValidate = numAmount;
        const currency = 'BDT';
        
        if (amountToValidate < withdrawalMethod.minAmount) {
            return NextResponse.json(
                { error: `Minimum withdrawal amount is ${withdrawalMethod.minAmount} ${currency}` },
                { status: 400 }
            );
        }
        
        if (amountToValidate > withdrawalMethod.maxAmount) {
            return NextResponse.json(
                { error: `Maximum withdrawal amount is ${withdrawalMethod.maxAmount} ${currency}` },
                { status: 400 }
            );
        }

        const user = await User.findOne({ telegramId : session.user.telegramId })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
     

        // Check if user has sufficient balance (including fee)
        if (user.balance < (amountInUSDT + fee)) {
            return NextResponse.json(
                { error: 'Insufficient balance to cover amount and fees' },
                { status: 400 }
            );
        }

        // Create withdrawal history record
        const withdrawal = await WithdrawalHistory.create({
            telegramId: user.telegramId,
            userId: user._id,
            activityType: 'withdrawal_request',
            amount: amountInUSDT,
            method,
            recipient,
            status: 'pending',
            description: `Withdrawal request of ${numAmount} BDT via ${withdrawalMethod.name}`,
            metadata: {
                ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
                deviceInfo: req.headers.get('user-agent'),
                originalAmount: numAmount,
                currency: 'BDT',
                fee,
                amountAfterFee,
                feeType: 'percentage',
                paymentType: 'mobile_banking',
                feeBreakdown
            }
        });

        // Update user balance (in USDT, including fee)
        await User.findOneAndUpdate({ telegramId : session.user.telegramId  }, {
            $inc: { balance: -(amountInUSDT + fee) }
        }, { new: true });

        return NextResponse.json({
            message: 'Withdrawal request submitted successfully',
            withdrawal: {
                ...withdrawal.toObject(),
                fee,
                amountAfterFee,
                bdtAmount: numAmount,
                bdtFee: fee * USD_TO_BDT_RATE,
                paymentType: 'mobile_banking',
                feeBreakdown,
                methodInfo: {
                    name: withdrawalMethod.name,
                    category: withdrawalMethod.category,
                    currency: withdrawalMethod.currency,
                    estimatedTime: withdrawalMethod.estimatedTime
                }
            }
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const { withdrawalId, status, reason } = data;

        if (!withdrawalId || !status || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        const withdrawal = await WithdrawalHistory.findById(withdrawalId);
        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
        }

        if (withdrawal.status !== 'pending') {
            return NextResponse.json({ error: 'Can only update pending withdrawals' }, { status: 400 });
        }

        // Update withdrawal status
        withdrawal.status = status;
        await withdrawal.save();

        // Create withdrawal history record
        await WithdrawalHistory.create({
            telegramId: withdrawal.telegramId,
            activityType: status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
            amount: withdrawal.amount,
            method: withdrawal.method,
            recipient: withdrawal.recipient,
            status,
            description: status === 'approved' 
                ? `Withdrawal request approved for ${withdrawal.amount} USDT via ${withdrawal.method}`
                : `Withdrawal request rejected for ${withdrawal.amount} USDT via ${withdrawal.method}`,
            metadata: {
                adminId: session.user._id,
                reason,
                ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
                deviceInfo: req.headers.get('user-agent')
            }
        });

        // If rejected, refund the amount
        if (status === 'rejected') {
            await User.findByIdAndUpdate(withdrawal.userId, {
                $inc: { balance: withdrawal.amount }
            });
        }
   

 



        return NextResponse.json({
            message: `Withdrawal ${status} successfully`,
            withdrawal: withdrawal.toObject()
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'Missing withdrawal ID' }, { status: 400 });
        }

        const withdrawal = await WithdrawalHistory.findById(id).populate('userId', 'telegramId');
        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
        }

        if (withdrawal.status !== 'pending') {
            return NextResponse.json({ error: 'Can only cancel pending withdrawals' }, { status: 400 });
        }

        // Create withdrawal history record for cancellation
        await WithdrawalHistory.create({
            telegramId: withdrawal.telegramId,
            activityType: 'withdrawal_rejected',
            amount: withdrawal.amount,
            method: withdrawal.method,
            recipient: withdrawal.recipient,
            status: 'rejected',
            description: `Withdrawal request cancelled by user for ${withdrawal.amount} USDT via ${withdrawal.method}`,
            metadata: {
                reason: 'User cancelled withdrawal',
                ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
                deviceInfo: req.headers.get('user-agent')
            }
        });

        // Refund the USDT amount to user's balance
        await User.findByIdAndUpdate(withdrawal.userId, {
            $inc: { balance: withdrawal.amount }
        });

        await WithdrawalHistory.findByIdAndDelete(id);

        return NextResponse.json({
            message: 'Withdrawal cancelled successfully',
            refundedAmount: withdrawal.amount,
            refundedAmountBDT: convertUSDTtoBDT(withdrawal.amount)
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to cancel withdrawal' }, { status: 500 });
    }
} 