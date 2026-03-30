import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import { logActivity } from '@/lib/activity-log';

async function verifyAdmin(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.role === 'admin') return userId;
    }
  } catch {
    // continue to OTP fallback
  }

  try {
    const supabase = await createClient();
    const otpToken = request.cookies.get('otp_session_token')?.value;
    if (!otpToken) return null;

    const { data: session } = await supabase
      .from('otp_sessions')
      .select('user_id, expires_at, is_active')
      .eq('session_token', otpToken)
      .maybeSingle();

    if (!session || !session.is_active || new Date(session.expires_at) <= new Date()) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user_id)
      .maybeSingle();

    return profile?.role === 'admin' ? session.user_id : null;
  } catch {
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await verifyAdmin(request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: existingPost, error: existingError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('id', id)
      .maybeSingle();

    if (existingError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
    }

    await logActivity({
      userId: adminUserId,
      activityType: 'admin_post_deleted',
      entityType: 'post',
      entityId: id,
      metadata: {
        title: existingPost.title,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted by admin',
      postId: id,
      title: existingPost.title,
      deletedBy: adminUserId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
