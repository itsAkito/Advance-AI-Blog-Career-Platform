import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendWelcomeEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert([{ email, name: name || null }], { onConflict: 'email' });

    if (error) {
      console.error('Newsletter subscription error:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailErr) {
      console.error('Welcome email failed (subscription still saved):', emailErr);
    }

    return NextResponse.json({ message: 'Subscribed successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
