import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not configured in environment variables');
}

const client = new GoogleGenerativeAI(apiKey);

// Try to use the latest available model, with fallbacks
export const geminiModel = (() => {
  try {
    // First try gemini-2.0-flash (latest)
    return client.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
  } catch (e) {
    try {
      // Fallback to gemini-1.5-pro
      return client.getGenerativeModel({
        model: 'gemini-1.5-pro',
      });
    } catch (e2) {
      // Final fallback to gemini-pro
      return client.getGenerativeModel({
        model: 'gemini-pro',
      });
    }
  }
})();

export async function generateBlogContent(prompt: string, tone: string = 'professional') {
  try {
    const systemPrompt = `You are an expert AI blog writer. Write engaging, well-structured blog posts. 
    The tone should be ${tone}. Start with a compelling introduction, use clear headings, and end with a strong conclusion.
    Format the response in markdown.`;

    const response = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nTopic: ${prompt}`,
            },
          ],
        },
      ],
    });

    const content = response.response.text();
    return content;
  } catch (error) {
    console.error('Error generating blog content:', error);
    throw error;
  }
}

export async function generateBlogTitle(topic: string) {
  try {
    const response = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate 5 compelling blog post titles for the topic: "${topic}". Return only the titles, one per line.`,
            },
          ],
        },
      ],
    });

    const titles = response.response.text().split('\n').filter(t => t.trim());
    return titles;
  } catch (error) {
    console.error('Error generating blog titles:', error);
    throw error;
  }
}

export async function generateBlogExcerpt(content: string) {
  try {
    const response = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a compelling excerpt (2-3 sentences) for this blog post content:\n\n${content.substring(0, 500)}`,
            },
          ],
        },
      ],
    });

    const excerpt = response.response.text();
    return excerpt;
  } catch (error) {
    console.error('Error generating blog excerpt:', error);
    throw error;
  }
}
