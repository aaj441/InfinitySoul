/**
 * Last.fm Integration Service
 * ============================
 *
 * Connects to Last.fm API to pull listening history.
 * 20+ years of scrobbles = 20+ years of behavioral data.
 *
 * API Docs: https://www.last.fm/api
 */

import axios from 'axios';
import { createModuleLogger } from '../../../utils/logger';
import { ExternalServiceError, ValidationError } from '../../errors';
import { config } from '../../../config/environment';
import { MusicFeatures, ListeningContext } from './WellnessGenome';

const logger = createModuleLogger('LastFm');

// =============================================================================
// TYPES
// =============================================================================

export interface LastFmConfig {
  apiKey: string;
  sharedSecret?: string;
  username?: string;
}

export interface LastFmTrack {
  name: string;
  artist: {
    '#text': string;
    mbid?: string;
  };
  album?: {
    '#text': string;
    mbid?: string;
  };
  mbid?: string;
  url: string;
  date?: {
    uts: string;  // Unix timestamp
    '#text': string;
  };
  '@attr'?: {
    nowplaying?: string;
  };
}

export interface LastFmRecentTracksResponse {
  recenttracks: {
    track: LastFmTrack[];
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}

export interface LastFmTopArtistsResponse {
  topartists: {
    artist: {
      name: string;
      playcount: string;
      mbid?: string;
      url: string;
    }[];
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}

export interface LastFmTopTracksResponse {
  toptracks: {
    track: {
      name: string;
      playcount: string;
      artist: { name: string; mbid?: string };
      mbid?: string;
      url: string;
    }[];
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}

export interface ScrobbleHistory {
  track: string;
  artist: string;
  album?: string;
  timestamp: Date;
  mbid?: string;
}

export interface ListeningStats {
  totalScrobbles: number;
  uniqueArtists: number;
  uniqueTracks: number;
  registeredDate?: Date;
  averageScrobblesPerDay: number;
  topArtists: { name: string; playcount: number }[];
  topTracks: { name: string; artist: string; playcount: number }[];
  listeningByHour: number[];  // 24 hours
  listeningByDayOfWeek: number[];  // 7 days
}

// =============================================================================
// LAST.FM CLIENT
// =============================================================================

export class LastFmClient {
  private apiKey: string;
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/';

  constructor(configOverride?: LastFmConfig) {
    this.apiKey = configOverride?.apiKey || config.LASTFM_API_KEY || '';

    if (!this.apiKey) {
      logger.warn('Last.fm API key not configured');
    }
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get recent tracks for a user
   */
  async getRecentTracks(
    username: string,
    options?: {
      limit?: number;
      page?: number;
      from?: number;  // Unix timestamp
      to?: number;    // Unix timestamp
    }
  ): Promise<ScrobbleHistory[]> {
    this.ensureConfigured();

    const params: Record<string, string | number> = {
      method: 'user.getrecenttracks',
      user: username,
      api_key: this.apiKey,
      format: 'json',
      limit: options?.limit || 50,
      page: options?.page || 1,
    };

    if (options?.from) params.from = options.from;
    if (options?.to) params.to = options.to;

    try {
      const response = await axios.get<LastFmRecentTracksResponse>(this.baseUrl, {
        params,
        timeout: 30000,
      });

      const tracks = response.data.recenttracks.track;

      return tracks
        .filter(t => !t['@attr']?.nowplaying)  // Exclude currently playing
        .map(t => ({
          track: t.name,
          artist: t.artist['#text'],
          album: t.album?.['#text'],
          timestamp: t.date ? new Date(parseInt(t.date.uts) * 1000) : new Date(),
          mbid: t.mbid,
        }));
    } catch (error: any) {
      logger.error('Failed to fetch recent tracks', { error: error.message, username });
      throw new ExternalServiceError('Last.fm', error.message);
    }
  }

  /**
   * Get all scrobbles for a time period (paginated)
   */
  async getAllScrobbles(
    username: string,
    options?: {
      from?: Date;
      to?: Date;
      onProgress?: (loaded: number, total: number) => void;
    }
  ): Promise<ScrobbleHistory[]> {
    this.ensureConfigured();

    const allScrobbles: ScrobbleHistory[] = [];
    let page = 1;
    let totalPages = 1;
    const from = options?.from ? Math.floor(options.from.getTime() / 1000) : undefined;
    const to = options?.to ? Math.floor(options.to.getTime() / 1000) : undefined;

    do {
      const params: Record<string, string | number> = {
        method: 'user.getrecenttracks',
        user: username,
        api_key: this.apiKey,
        format: 'json',
        limit: 200,  // Max per page
        page,
      };

      if (from) params.from = from;
      if (to) params.to = to;

      try {
        const response = await axios.get<LastFmRecentTracksResponse>(this.baseUrl, {
          params,
          timeout: 30000,
        });

        const data = response.data.recenttracks;
        totalPages = parseInt(data['@attr'].totalPages);

        const tracks = data.track
          .filter(t => !t['@attr']?.nowplaying)
          .map(t => ({
            track: t.name,
            artist: t.artist['#text'],
            album: t.album?.['#text'],
            timestamp: t.date ? new Date(parseInt(t.date.uts) * 1000) : new Date(),
            mbid: t.mbid,
          }));

        allScrobbles.push(...tracks);

        if (options?.onProgress) {
          options.onProgress(page, totalPages);
        }

        logger.info(`Loaded page ${page}/${totalPages}`, { scrobbles: allScrobbles.length });

        page++;

        // Rate limiting: 5 requests per second max
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error: any) {
        logger.error('Failed to fetch scrobbles page', { error: error.message, page });
        throw new ExternalServiceError('Last.fm', `Failed on page ${page}: ${error.message}`);
      }
    } while (page <= totalPages && page <= 500);  // Safety limit

    return allScrobbles;
  }

  /**
   * Get user's top artists
   */
  async getTopArtists(
    username: string,
    period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall',
    limit: number = 50
  ): Promise<{ name: string; playcount: number }[]> {
    this.ensureConfigured();

    try {
      const response = await axios.get<LastFmTopArtistsResponse>(this.baseUrl, {
        params: {
          method: 'user.gettopartists',
          user: username,
          api_key: this.apiKey,
          format: 'json',
          period,
          limit,
        },
        timeout: 30000,
      });

      return response.data.topartists.artist.map(a => ({
        name: a.name,
        playcount: parseInt(a.playcount),
      }));
    } catch (error: any) {
      logger.error('Failed to fetch top artists', { error: error.message, username });
      throw new ExternalServiceError('Last.fm', error.message);
    }
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(
    username: string,
    period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall',
    limit: number = 50
  ): Promise<{ name: string; artist: string; playcount: number }[]> {
    this.ensureConfigured();

    try {
      const response = await axios.get<LastFmTopTracksResponse>(this.baseUrl, {
        params: {
          method: 'user.gettoptracks',
          user: username,
          api_key: this.apiKey,
          format: 'json',
          period,
          limit,
        },
        timeout: 30000,
      });

      return response.data.toptracks.track.map(t => ({
        name: t.name,
        artist: t.artist.name,
        playcount: parseInt(t.playcount),
      }));
    } catch (error: any) {
      logger.error('Failed to fetch top tracks', { error: error.message, username });
      throw new ExternalServiceError('Last.fm', error.message);
    }
  }

  /**
   * Get comprehensive listening statistics
   */
  async getListeningStats(username: string): Promise<ListeningStats> {
    this.ensureConfigured();

    // Fetch user info for total scrobbles
    const userInfo = await this.getUserInfo(username);

    // Fetch top artists and tracks
    const [topArtists, topTracks] = await Promise.all([
      this.getTopArtists(username, 'overall', 20),
      this.getTopTracks(username, 'overall', 20),
    ]);

    // Calculate averages
    const daysSinceRegistration = userInfo.registeredDate
      ? Math.ceil((Date.now() - userInfo.registeredDate.getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    return {
      totalScrobbles: userInfo.playcount,
      uniqueArtists: 0,  // Would need additional API calls
      uniqueTracks: 0,   // Would need additional API calls
      registeredDate: userInfo.registeredDate,
      averageScrobblesPerDay: Math.round(userInfo.playcount / daysSinceRegistration),
      topArtists,
      topTracks,
      listeningByHour: new Array(24).fill(0),  // Would need scrobble analysis
      listeningByDayOfWeek: new Array(7).fill(0),  // Would need scrobble analysis
    };
  }

  /**
   * Get user profile info
   */
  async getUserInfo(username: string): Promise<{
    username: string;
    playcount: number;
    registeredDate?: Date;
    country?: string;
    imageUrl?: string;
  }> {
    this.ensureConfigured();

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          method: 'user.getinfo',
          user: username,
          api_key: this.apiKey,
          format: 'json',
        },
        timeout: 30000,
      });

      const user = response.data.user;
      return {
        username: user.name,
        playcount: parseInt(user.playcount),
        registeredDate: user.registered?.unixtime
          ? new Date(parseInt(user.registered.unixtime) * 1000)
          : undefined,
        country: user.country,
        imageUrl: user.image?.find((i: any) => i.size === 'large')?.['#text'],
      };
    } catch (error: any) {
      logger.error('Failed to fetch user info', { error: error.message, username });
      throw new ExternalServiceError('Last.fm', error.message);
    }
  }

  /**
   * Analyze scrobbles to extract patterns
   */
  analyzeListeningPatterns(scrobbles: ScrobbleHistory[]): {
    byHour: number[];
    byDayOfWeek: number[];
    byMonth: number[];
    sessions: ListeningSession[];
    averageSessionLength: number;
  } {
    const byHour = new Array(24).fill(0);
    const byDayOfWeek = new Array(7).fill(0);
    const byMonth = new Array(12).fill(0);

    for (const scrobble of scrobbles) {
      const date = scrobble.timestamp;
      byHour[date.getHours()]++;
      byDayOfWeek[date.getDay()]++;
      byMonth[date.getMonth()]++;
    }

    // Identify listening sessions (gap > 30 min = new session)
    const sessions = this.identifySessions(scrobbles);

    const totalSessionMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionLength = sessions.length > 0
      ? Math.round(totalSessionMinutes / sessions.length)
      : 0;

    return {
      byHour,
      byDayOfWeek,
      byMonth,
      sessions,
      averageSessionLength,
    };
  }

  /**
   * Identify listening sessions from scrobble history
   */
  private identifySessions(scrobbles: ScrobbleHistory[]): ListeningSession[] {
    if (scrobbles.length === 0) return [];

    // Sort by timestamp
    const sorted = [...scrobbles].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const sessions: ListeningSession[] = [];
    let currentSession: ScrobbleHistory[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].timestamp.getTime() - sorted[i - 1].timestamp.getTime();
      const gapMinutes = gap / (1000 * 60);

      if (gapMinutes > 30) {
        // New session
        sessions.push(this.createSession(currentSession));
        currentSession = [sorted[i]];
      } else {
        currentSession.push(sorted[i]);
      }
    }

    // Don't forget the last session
    if (currentSession.length > 0) {
      sessions.push(this.createSession(currentSession));
    }

    return sessions;
  }

  private createSession(scrobbles: ScrobbleHistory[]): ListeningSession {
    const first = scrobbles[0];
    const last = scrobbles[scrobbles.length - 1];
    const duration = (last.timestamp.getTime() - first.timestamp.getTime()) / (1000 * 60);
    const hour = first.timestamp.getHours();

    let timeOfDay: ListeningContext['timeOfDay'];
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 1) timeOfDay = 'night';
    else timeOfDay = 'late_night';

    return {
      sessionId: `session-${first.timestamp.getTime()}`,
      tracks: scrobbles.map(s => `${s.artist} - ${s.track}`),
      context: {
        timestamp: first.timestamp,
        timeOfDay,
        dayOfWeek: first.timestamp.getDay(),
        isWeekend: first.timestamp.getDay() === 0 || first.timestamp.getDay() === 6,
        consecutiveListens: scrobbles.length,
        sessionDuration: duration,
      },
      duration: Math.max(duration, scrobbles.length * 3.5),  // At least 3.5 min per track
      completionRate: 1,  // Assume completed if scrobbled
      followupBehaviors: [],
    };
  }

  private ensureConfigured(): void {
    if (!this.apiKey) {
      throw new ValidationError('Last.fm API key not configured');
    }
  }
}

// Types for internal use
interface ListeningSession {
  sessionId: string;
  tracks: string[];
  context: ListeningContext;
  duration: number;
  completionRate: number;
  followupBehaviors: any[];
}

// Export singleton
export const lastFmClient = new LastFmClient();
export default lastFmClient;
