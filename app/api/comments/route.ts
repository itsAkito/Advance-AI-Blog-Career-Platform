import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

// GET comments for a specific post
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    const communityPostId = searchParams.get('communityPostId');

    if (!postId && !communityPostId) {
      return NextResponse.json({ error: 'postId or communityPostId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    let query = supabase
      .from('comments')
      .select('*, profiles(id, name, avatar_url)')
      .order('created_at', { ascending: true });

    if (postId) {
      query = query.eq('post_id', postId);
    } else {
      query = query.eq('community_post_id', communityPostId!);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST a new comment (authenticated or guest)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, communityPostId, content, guestName, guestEmail } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (!postId && !communityPostId) {
      return NextResponse.json({ error: 'postId or communityPostId is required' }, { status: 400 });
    }

    // Sanitize content
    const sanitizedContent = content.trim().substring(0, 5000);

    const supabase = await createClient();
    const { userId } = await auth();

    // If not authenticated, require guest name and email
    if (!userId && (!guestName || !guestEmail)) {
      return NextResponse.json({ error: 'Name and email are required for guest comments' }, { status: 400 });
    }

    const commentData: Record<string, unknown> = {
      content: sanitizedContent,
      user_id: userId || null,
      guest_name: userId ? null : guestName?.trim().substring(0, 100),
      guest_email: userId ? null : guestEmail?.trim().substring(0, 200),
    };

    if (postId) commentData.post_id = postId;
    if (communityPostId) commentData.community_post_id = communityPostId;

    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select('*, profiles(id, name, avatar_url)')
      .single();

    if (error) {
      console.error('Comment insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update comment count on the post
    if (postId) {
      try {
        await supabase.rpc('increment_comment_count', { p_post_id: postId });
      } catch {
        // Fallback: manual increment if RPC doesn't exist
        await supabase
          .from('posts')
          .update({ comments_count: (data as { id: string })?.id ? 1 : 0 })
          .eq('id', postId);
      }
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
