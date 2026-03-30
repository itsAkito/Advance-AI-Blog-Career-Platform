import { NextResponse } from 'next/server';

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  sourceName: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
};

type NewsDataRow = {
  article_id?: string;
  title?: string;
  description?: string;
  content?: string;
  link?: string;
  source_id?: string;
  source_name?: string;
  category?: string[];
  pubDate?: string;
  image_url?: string;
};

const normalizeNewsData = (rows: NewsDataRow[], fallbackCategory: string): NewsItem[] => {
  return rows
    .map((row, idx) => ({
      id: row.article_id || row.link || `${fallbackCategory}-${idx}`,
      title: row.title || 'Untitled',
      summary: (row.description || '').slice(0, 280),
      content: (row.content || row.description || '').slice(0, 6000),
      url: row.link || '',
      source: (row.source_id || row.source_name || 'newsdata').toLowerCase().replace(/\s/g, '-'),
      sourceName: row.source_name || row.source_id || 'NewsData',
      category: row.category?.[0] || fallbackCategory,
      publishedAt: row.pubDate ? new Date(row.pubDate).toISOString() : new Date().toISOString(),
      imageUrl: row.image_url || undefined,
    }))
    .filter((item) => item.title && item.url);
};

async function fetchNewsData(params: Record<string, string>): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const search = new URLSearchParams({
    apikey: apiKey,
    language: 'en',
    size: '10',
    ...params,
  });

  const url = `https://newsdata.io/api/1/latest?${search.toString()}`;
  try {
    const response = await fetch(url, { next: { revalidate: 600 } });
    if (!response.ok) return [];
    const payload = await response.json();
    const rows = (payload?.results || []) as NewsDataRow[];
    const fallbackCategory = params.category || 'General';
    return normalizeNewsData(rows, fallbackCategory);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [worldNews, researchNews, geopolitics] = await Promise.all([
      fetchNewsData({ category: 'technology,science,world' }),
      fetchNewsData({ q: 'research OR innovation OR ai OR science', category: 'science,technology' }),
      fetchNewsData({ q: 'geopolitics OR diplomacy OR conflict OR sanctions', category: 'politics,world' }),
    ]);

    const sortByDate = (items: NewsItem[]) =>
      [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const normalizedWorld = sortByDate(worldNews).slice(0, 14);
    const normalizedResearch = sortByDate(researchNews).slice(0, 14);
    const normalizedGeo = sortByDate(geopolitics).slice(0, 8);
    const items = [...normalizedResearch, ...normalizedWorld].slice(0, 25);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      items,
      worldNews: normalizedWorld,
      researchNews: normalizedResearch,
      geopolitics: normalizedGeo,
      total: items.length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
