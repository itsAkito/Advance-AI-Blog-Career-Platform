import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContent, generateBlogTitle, generateBlogExcerpt } from '@/lib/gemini';

export async function POST(_request: NextRequest) {
  try {
    const { prompt, topic, tone = 'professional', userId } = await _request.json();
    const finalPrompt = prompt || topic;

    if (!finalPrompt || !userId) {
      return NextResponse.json(
        { error: 'Topic and userId are required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GOOGLE_GEMINI_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    try {
      // Generate content
      const content = await generateBlogContent(finalPrompt, tone);
      const titles = await generateBlogTitle(finalPrompt);
      const excerpt = await generateBlogExcerpt(content);

      // Return first title as main title, rest as options
      const title = Array.isArray(titles) ? titles[0] : titles;

      return NextResponse.json(
        {
          content,
          title,
          titleOptions: Array.isArray(titles) ? titles : [titles],
          excerpt,
        },
        { status: 200 }
      );
    } catch (aiError: any) {
      console.error('Gemini API error details:', aiError);
      
      // More helpful error messages
      if (aiError.message?.includes('API key')) {
        return NextResponse.json(
          { error: 'Gemini API key is invalid or expired. Please regenerate it at https://aistudio.google.com/apikey' },
          { status: 500 }
        );
      }
      
      if (aiError.message?.includes('not found')) {
        return NextResponse.json(
          { error: 'Gemini model not available for your API key. Ensure your account has access to gemini-2.0-flash or gemini-1.5-pro' },
          { status: 500 }
        );
      }

      throw aiError;
    }
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    );
  }
}
