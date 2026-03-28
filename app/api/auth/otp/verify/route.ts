import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('verified', false)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 401 });
    }

    // Mark OTP as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('email', email)
      .eq('code', code);

    // Upsert user profile so they exist in the database
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';
    const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';
    const profileId = `otp_${email.replace(/[^a-z0-9]/gi, '_')}`;

    const { data: profile } = await supabase
      .from('profiles')
      .upsert(
        [{
          id: profileId,
          email,
          name: email.split('@')[0],
          role,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: 'id' }
      )
      .select()
      .single();

    // Set an OTP session cookie so middleware allows access to protected routes
    const response = NextResponse.json({
      message: 'OTP verified successfully',
      user: profile || { id: profileId, email, role, name: email.split('@')[0] },
    });

    response.cookies.set('otp_session', JSON.stringify({ email, role, id: profileId }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
