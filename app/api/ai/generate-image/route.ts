import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContent } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const clipdropKey = process.env.CLIPDROP_API_KEY;

    // Try Clipdrop text-to-image first
    if (clipdropKey) {
      try {
        const form = new FormData();
        form.append('prompt', prompt);

        const clipRes = await fetch('https://clipdrop-api.co/text-to-image/v1', {
          method: 'POST',
          headers: {
            'x-api-key': clipdropKey,
          },
          body: form,
        });

        if (clipRes.ok) {
          const imageBuffer = await clipRes.arrayBuffer();
          const base64 = Buffer.from(imageBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64}`;

          // Upload to ImageKit for persistent URL
          const imagekitKey = process.env.IMAGEKIT_PRIVATE_KEY;
          if (imagekitKey) {
            const ImageKit = (await import('imagekit')).default;
            const ik = new ImageKit({
              publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
              privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
              urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
            });

            const uploadResult = await ik.upload({
              file: Buffer.from(imageBuffer),
              fileName: `ai-cover-${Date.now()}.png`,
              folder: '/ai-generated',
            });

            return NextResponse.json({ imageUrl: uploadResult.url }, { status: 200 });
          }

          return NextResponse.json({ imageUrl: dataUrl }, { status: 200 });
        }
      } catch (clipError) {
        console.error('Clipdrop error, falling back to Unsplash:', clipError);
      }
    }

    // Fallback: Gemini keywords + Unsplash
    const keywordsResponse = await generateBlogContent(
      `Extract 2-3 simple English keywords (separated by commas, no extra text) that best describe this topic for finding a relevant photograph: "${prompt}"`,
      'professional'
    );

    const keywords = keywordsResponse
      .replace(/[^a-zA-Z, ]/g, '')
      .split(',')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0)
      .slice(0, 3)
      .join(',');

    const searchQuery = encodeURIComponent(keywords || prompt);
    const imageUrl = `https://source.unsplash.com/1200x630/?${searchQuery}`;

    const verifyResponse = await fetch(imageUrl, { method: 'HEAD', redirect: 'follow' });
    const finalUrl = verifyResponse.url;

    return NextResponse.json({ imageUrl: finalUrl }, { status: 200 });
  } catch (error) {
    console.error('Image generation error:', error);
    const fallbackUrl = `https://source.unsplash.com/1200x630/?blog,technology`;
    return NextResponse.json({ imageUrl: fallbackUrl }, { status: 200 });
  }
}
