import { NextRequest, NextResponse } from "next/server";
import { parseYouTubeURL } from "@/lib/format";

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  if (!API_KEY) return NextResponse.json({ error: "YouTube API is not configured." }, { status: 500 });

  try {
    const parsed = parseYouTubeURL(url);
    let channelId = parsed.value;

    if (parsed.type !== "id") {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(parsed.value)}&maxResults=1&key=${API_KEY}`,
      );
      const searchData = await searchRes.json();
      if (searchData.error) throw new Error(searchData.error.message);
      if (!searchData.items?.length) return NextResponse.json({ error: "Channel not found." }, { status: 404 });
      channelId = searchData.items[0].snippet.channelId;
    }

    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`,
    );
    const channelData = await channelRes.json();
    if (!channelData.items?.length) return NextResponse.json({ error: "Could not load channel data." }, { status: 404 });

    const { snippet: s, statistics: st } = channelData.items[0];
    const subscribers = parseInt(st.subscriberCount || "0");
    const videos = parseInt(st.videoCount || "0");
    const views = parseInt(st.viewCount || "0");
    const avgViewsPerVideo = videos > 0 ? Math.round(views / videos) : 0;
    const engagementPct = subscribers > 0 ? (avgViewsPerVideo / subscribers) * 100 : 0;
    const createdAt = s.publishedAt ? new Date(s.publishedAt) : null;
    const ageMonths = createdAt
      ? Math.max(1, Math.round((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
      : null;
    const estimatedMonthlyViews = ageMonths && views ? Math.round(views / ageMonths) : null;

    return NextResponse.json({
      channelId,
      name: s.title,
      handle: s.customUrl || null,
      thumbnail: s.thumbnails?.high?.url || s.thumbnails?.default?.url || null,
      subscribers,
      videos,
      views,
      avgViewsPerVideo,
      engagementPct,
      ageMonths,
      estimatedMonthlyViews,
      createdAt: createdAt?.toISOString().split("T")[0] || null,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
