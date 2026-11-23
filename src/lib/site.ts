import type { PlatformId } from './kingdom.ts';

export const SITE = {
  name: 'ZAUNITED',
  title: 'ZAUNITED: Kingdom of Zaun',
  motto: 'From nothing, we shall rise.',
  description:
    'Join the Kingdom of Zaun. Follow King Mesmer’s journey, watch the kingdom grow and help it rise before the Hollowing arrives.',
} as const;

export interface Platform {
  id: PlatformId;
  name: string;
  handle: string;
  /** What a "follow" is called on this platform (plural, and singular for a count of 1). */
  metric: string;
  metricSingular: string;
  profileUrl: string;
  /** Where the videos live on this platform. */
  videosUrl: string;
}

/** Official, verified ZAUNITED accounts. */
export const PLATFORMS: readonly Platform[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@zaunited1',
    metric: 'subscribers',
    metricSingular: 'subscriber',
    profileUrl: 'https://www.youtube.com/@zaunited1',
    videosUrl: 'https://www.youtube.com/@zaunited1/videos',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@zaunited_',
    metric: 'followers',
    metricSingular: 'follower',
    profileUrl: 'https://www.tiktok.com/@zaunited_',
    videosUrl: 'https://www.tiktok.com/@zaunited_',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@zaunited',
    metric: 'followers',
    metricSingular: 'follower',
    profileUrl: 'https://www.instagram.com/zaunited/',
    videosUrl: 'https://www.instagram.com/zaunited/reels/',
  },
];

export const platformById = (id: PlatformId): Platform => {
  const platform = PLATFORMS.find((p) => p.id === id);
  if (!platform) throw new Error(`Unknown platform: ${id}`);
  return platform;
};
