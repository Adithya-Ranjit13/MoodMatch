import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function searchYoutubeMusic(query: string): Promise<{
  youtubeId: string;
  title: string;
} | null> {
  try {
    const res = await youtube.search.list({
      part: ["snippet"],
      q: query,
      maxResults: 1,
      type: ["video"],
      videoCategoryId: "10",
    });

    const item = res.data.items?.[0];
    if (!item || !item.id?.videoId) return null;

    return {
      youtubeId: item.id.videoId,
      title: item.snippet?.title ?? query,
    };
  } catch (error) {
    console.error("YouTube music search error:", error);
    return null;
  }
}

export async function searchYoutubeVideo(query: string): Promise<{
  youtubeId: string;
  title: string;
} | null> {
  try {
    const res = await youtube.search.list({
      part: ["snippet"],
      q: query,
      maxResults: 1,
      type: ["video"],
    });

    const item = res.data.items?.[0];
    if (!item || !item.id?.videoId) return null;

    return {
      youtubeId: item.id.videoId,
      title: item.snippet?.title ?? query,
    };
  } catch (error) {
    console.error("YouTube video search error:", error);
    return null;
  }
}