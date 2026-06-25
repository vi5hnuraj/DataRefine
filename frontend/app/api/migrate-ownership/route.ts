import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/lib/models/User';
import { Dataset } from '@/lib/models/Dataset';

export async function GET() {
  try {
    await dbConnect();
    
    // Find akhil@gmail.com
    let akhil = await User.findOne({ email: 'akhil@gmail.com' });
    
    if (!akhil) {
      // If user doesn't exist yet, we can't migrate
      return NextResponse.json({ success: false, message: 'akhil@gmail.com user not found. Please sign up first!' }, { status: 400 });
    }

    // Update all existing datasets to belong to akhil@gmail.com
    const result = await Dataset.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: akhil._id } }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Migrated ${result.modifiedCount} datasets to akhil@gmail.com` 
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
