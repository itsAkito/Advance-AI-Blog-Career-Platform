import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment views via RPC
    await supabase.rpc('increment_post_views', { post_id: id });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();

    const body = await _request.json();
    const { title, content, excerpt, image_url, cover_image_url, published, status, topic } = body;

    const updateData: Record<string, any> = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (cover_image_url !== undefined || image_url !== undefined) updateData.cover_image_url = cover_image_url || image_url;
    if (published !== undefined) updateData.status = published ? 'published' : 'draft';
    if (status !== undefined) updateData.status = status;
    if (topic !== undefined) updateData.topic = topic;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Post updated successfully', post: data });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
