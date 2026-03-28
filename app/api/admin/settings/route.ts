import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

// Get admin settings
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const settingsMap: Record<string, string> = {};
    for (const s of settings || []) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Save admin settings
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { settings } = await request.json();
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object required' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from('admin_settings')
        .upsert(
          { key, value: String(value), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
    }

    return NextResponse.json({ message: 'Settings saved' });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
