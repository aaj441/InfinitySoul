/**
 * LAST.FM DATA INTEGRATION
 * =========================
 *
 * "21 years of scrobbles is 21 years of your soul laid bare."
 *
 * This module fetches and processes Last.fm listening history to extract
 * behavioral patterns that reveal risk profiles. Every play is a micro-decision.
 * Aggregate those decisions over two decades and you have a map of the psyche.
 *
 * What We Extract:
 * ----------------
 * - Temporal patterns: When do you listen? Night owl = different risk profile
 * - Novelty seeking: How quickly do you adopt new artists?
 * - Loyalty patterns: Do you stick with artists or constantly churn?
 * - Emotional range: Do you stay in one mood or traverse the spectrum?
 * - Social signals: Do you follow trends or forge your own path?
 * - Complexity preference: Simple pop vs. progressive complexity
 * - Energy regulation: How do you use music to modulate state?
 *
 * @author InfinitySoul Soul Fingerprint Engine
 * @version 1.0.0
 */

// =============================================================================
// LAST.FM API TYPES
// =============================================================================

export interface LastFmConfig {
  apiKey: string;
  username: string;
  sharedSecret?: string;
}

export interface LastFmTrack {
  name: string;
  artist: {
    '#text': string;
    mbid?: string;
  };
  album: {
    '#text': string;
    mbid?: string;
  };
  date?: {
    uts: string;      // Unix timestamp
    '#text': string;  // Human readable
  };
  mbid?: string;
  url: string;
  streamable: string;
  image?: Array<{
    '#text': string;
    size: string;
  }>;
  '@attr'?: {
    nowplaying?: string;
  };
}

export interface LastFmArtist {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  streamable: string;
  image?: Array<{
    '#text': string;
    size: string;
  }>;
  '@attr'?: {
    rank: string;
  };
}

export interface LastFmAlbum {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  artist: {
    name: string;
    mbid?: string;
    url: string;
  };
  image?: Array<{
    '#text': string;
    size: string;
  }>;
  '@attr'?: {
    rank: string;
  };
}

export interface LastFmTag {
  name: string;
  count: number;
  url: string;
}

export interface LastFmArtistInfo {
  name: string;
  mbid?: string;
  url: string;
  stats: {
    listeners: string;
    playcount: string;
  };
  tags: {
    tag: LastFmTag[];
  };
  similar: {
    artist: Array<{
      name: string;
      url: string;
    }>;
  };
  bio?: {
    summary: string;
    content: string;
  };
}

export interface LastFmUserInfo {
  name: string;
  realname?: string;
  image?: Array<{
    '#text': string;
    size: string;
  }>;
  url: string;
  country?: string;
  age?: string;
  gender?: string;
  subscriber: string;
  playcount: string;
  playlists: string;
  bootstrap: string;
  registered: {
    unixtime: string;
    '#text': string;
  };
}

// =============================================================================
// PROCESSED DATA TYPES
// =============================================================================

export interface ProcessedScrobble {
  trackName: string;
  artistName: string;
  albumName: string;
  timestamp: Date;
  hour: number;
  dayOfWeek: number;
  month: number;
  year: number;
  isWeekend: boolean;
  timeOfDay: 'night' | 'morning' | 'afternoon' | 'evening';
}

export interface ArtistProfile {
  name: string;
  totalPlays: number;
  firstPlay: Date;
  lastPlay: Date;
  tenureDays: number;
  playsPerDay: number;
  tags: string[];
  similarArtists: string[];
  listeningSessions: number;
  averageSessionDepth: number; // Plays per session
}

export interface ListeningEra {
  startDate: Date;
  endDate: Date;
  dominantArtists: string[];
  dominantTags: string[];
  averagePlaysPerDay: number;
  noveltyRate: number;        // New artists discovered in this era
  loyaltyRate: number;        // Plays to existing favorites
  moodSignature: string[];
}

export interface TemporalPattern {
  hourlyDistribution: number[];      // 24 hours
  dailyDistribution: number[];       // 7 days
  monthlyDistribution: number[];     // 12 months
  yearlyTotals: Record<number, number>;
  peakListeningHour: number;
  peakListeningDay: number;
  nightOwlScore: number;             // 0-1, higher = more night listening
  weekendWarriorScore: number;       // 0-1, higher = more weekend listening
}

export interface ListeningHistory {
  username: string;
  totalScrobbles: number;
  accountCreated: Date;
  historySpanDays: number;
  historySpanYears: number;

  // Raw data (sampled for efficiency)
  recentTracks: ProcessedScrobble[];
  allScrobblesSample: ProcessedScrobble[];

  // Aggregated profiles
  topArtists: ArtistProfile[];
  topTags: Array<{ tag: string; count: number }>;

  // Temporal analysis
  temporalPatterns: TemporalPattern;

  // Era analysis
  listeningEras: ListeningEra[];

  // Behavioral metrics
  metrics: {
    noveltySeeking: number;           // 0-1
    artistLoyalty: number;            // 0-1
    genreDiversity: number;           // 0-1
    listeningConsistency: number;     // 0-1
    emotionalRange: number;           // 0-1
    mainstreamAffinity: number;       // 0-1
    complexityPreference: number;     // 0-1
    energyVariance: number;           // 0-1
  };
}

// =============================================================================
// LAST.FM CLIENT
// =============================================================================

export class LastFmClient {
  private apiKey: string;
  private username: string;
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/';

  constructor(config: LastFmConfig) {
    this.apiKey = config.apiKey;
    this.username = config.username;
  }

  /**
   * Make an API request to Last.fm
   */
  private async request<T>(method: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('method', method);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('user', this.username);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user info
   */
  async getUserInfo(): Promise<LastFmUserInfo> {
    const response = await this.request<{ user: LastFmUserInfo }>('user.getinfo');
    return response.user;
  }

  /**
   * Get recent tracks with pagination
   */
  async getRecentTracks(
    page: number = 1,
    limit: number = 200,
    from?: number,
    to?: number
  ): Promise<{ tracks: LastFmTrack[]; totalPages: number; total: number }> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      extended: '1'
    };

    if (from) params.from = from.toString();
    if (to) params.to = to.toString();

    const response = await this.request<{
      recenttracks: {
        track: LastFmTrack[];
        '@attr': {
          page: string;
          perPage: string;
          totalPages: string;
          total: string;
        };
      };
    }>('user.getrecenttracks', params);

    return {
      tracks: response.recenttracks.track || [],
      totalPages: parseInt(response.recenttracks['@attr'].totalPages),
      total: parseInt(response.recenttracks['@attr'].total)
    };
  }

  /**
   * Get top artists
   */
  async getTopArtists(
    period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall',
    limit: number = 100
  ): Promise<LastFmArtist[]> {
    const response = await this.request<{
      topartists: {
        artist: LastFmArtist[];
      };
    }>('user.gettopartists', { period, limit: limit.toString() });

    return response.topartists.artist || [];
  }

  /**
   * Get top albums
   */
  async getTopAlbums(
    period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall',
    limit: number = 100
  ): Promise<LastFmAlbum[]> {
    const response = await this.request<{
      topalbums: {
        album: LastFmAlbum[];
      };
    }>('user.gettopalbums', { period, limit: limit.toString() });

    return response.topalbums.album || [];
  }

  /**
   * Get top tags for user
   */
  async getTopTags(limit: number = 50): Promise<LastFmTag[]> {
    const response = await this.request<{
      toptags: {
        tag: LastFmTag[];
      };
    }>('user.gettoptags', { limit: limit.toString() });

    return response.toptags.tag || [];
  }

  /**
   * Get artist info including tags
   */
  async getArtistInfo(artist: string): Promise<LastFmArtistInfo | null> {
    try {
      const response = await this.request<{
        artist: LastFmArtistInfo;
      }>('artist.getinfo', { artist, autocorrect: '1' });
      return response.artist;
    } catch {
      return null;
    }
  }

  /**
   * Get weekly chart list (all available weeks)
   */
  async getWeeklyChartList(): Promise<Array<{ from: string; to: string }>> {
    const response = await this.request<{
      weeklychartlist: {
        chart: Array<{ from: string; to: string }>;
      };
    }>('user.getweeklychartlist');

    return response.weeklychartlist.chart || [];
  }

  /**
   * Get weekly artist chart for a specific week
   */
  async getWeeklyArtistChart(from: string, to: string): Promise<LastFmArtist[]> {
    const response = await this.request<{
      weeklyartistchart: {
        artist: LastFmArtist[];
      };
    }>('user.getweeklyartistchart', { from, to });

    return response.weeklyartistchart.artist || [];
  }
}

// =============================================================================
// DATA PROCESSOR
// =============================================================================

export class LastFmDataProcessor {
  private client: LastFmClient;

  constructor(client: LastFmClient) {
    this.client = client;
  }

  /**
   * Process a raw track into structured data
   */
  private processTrack(track: LastFmTrack): ProcessedScrobble | null {
    if (!track.date?.uts) return null; // Skip "now playing"

    const timestamp = new Date(parseInt(track.date.uts) * 1000);
    const hour = timestamp.getHours();

    let timeOfDay: ProcessedScrobble['timeOfDay'];
    if (hour >= 0 && hour < 6) timeOfDay = 'night';
    else if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    return {
      trackName: track.name,
      artistName: track.artist['#text'],
      albumName: track.album['#text'],
      timestamp,
      hour,
      dayOfWeek: timestamp.getDay(),
      month: timestamp.getMonth(),
      year: timestamp.getFullYear(),
      isWeekend: timestamp.getDay() === 0 || timestamp.getDay() === 6,
      timeOfDay
    };
  }

  /**
   * Fetch full listening history (sampled for efficiency)
   */
  async fetchFullHistory(
    sampleRate: number = 0.1,
    progressCallback?: (current: number, total: number) => void
  ): Promise<ListeningHistory> {
    // Get user info
    const userInfo = await this.client.getUserInfo();
    const totalScrobbles = parseInt(userInfo.playcount);
    const accountCreated = new Date(parseInt(userInfo.registered.unixtime) * 1000);

    console.log(`Fetching history for ${userInfo.name}: ${totalScrobbles} scrobbles since ${accountCreated.toDateString()}`);

    // Fetch recent tracks sample
    const recentTracks: ProcessedScrobble[] = [];
    const allScrobblesSample: ProcessedScrobble[] = [];

    // Get first page to know total pages
    const firstPage = await this.client.getRecentTracks(1, 200);
    const totalPages = firstPage.totalPages;

    // Process first page
    for (const track of firstPage.tracks) {
      const processed = this.processTrack(track);
      if (processed) recentTracks.push(processed);
    }

    // Sample from history (every Nth page based on sample rate)
    const pageStep = Math.max(1, Math.floor(1 / sampleRate));
    const pagesToFetch = [];

    for (let page = 1; page <= totalPages; page += pageStep) {
      pagesToFetch.push(page);
    }

    // Also ensure we get some pages from each year
    const pagesPerYear = Math.ceil(totalPages / 21); // 21 years

    for (let i = 0; i < 21; i++) {
      const yearPage = Math.min(totalPages, Math.floor(i * pagesPerYear) + 1);
      if (!pagesToFetch.includes(yearPage)) {
        pagesToFetch.push(yearPage);
      }
    }

    pagesToFetch.sort((a, b) => a - b);

    // Fetch sampled pages
    let fetchedPages = 0;
    for (const page of pagesToFetch) {
      if (page === 1) continue; // Already fetched

      try {
        const pageData = await this.client.getRecentTracks(page, 200);
        for (const track of pageData.tracks) {
          const processed = this.processTrack(track);
          if (processed) allScrobblesSample.push(processed);
        }

        fetchedPages++;
        if (progressCallback) {
          progressCallback(fetchedPages, pagesToFetch.length);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
      }
    }

    // Combine samples
    allScrobblesSample.push(...recentTracks);
    allScrobblesSample.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Get top artists with enriched data
    const topArtistsRaw = await this.client.getTopArtists('overall', 200);
    const topArtists = await this.enrichArtistProfiles(topArtistsRaw, allScrobblesSample);

    // Get top tags
    const topTagsRaw = await this.client.getTopTags(100);
    const topTags = topTagsRaw.map(t => ({ tag: t.name, count: t.count }));

    // Calculate temporal patterns
    const temporalPatterns = this.calculateTemporalPatterns(allScrobblesSample);

    // Calculate eras
    const listeningEras = this.calculateListeningEras(allScrobblesSample);

    // Calculate behavioral metrics
    const metrics = this.calculateBehavioralMetrics(
      allScrobblesSample,
      topArtists,
      topTags,
      temporalPatterns
    );

    const historySpanDays = Math.floor(
      (new Date().getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      username: userInfo.name,
      totalScrobbles,
      accountCreated,
      historySpanDays,
      historySpanYears: historySpanDays / 365,
      recentTracks,
      allScrobblesSample,
      topArtists,
      topTags,
      temporalPatterns,
      listeningEras,
      metrics
    };
  }

  /**
   * Enrich artist profiles with play patterns
   */
  private async enrichArtistProfiles(
    artists: LastFmArtist[],
    scrobbles: ProcessedScrobble[]
  ): Promise<ArtistProfile[]> {
    const profiles: ArtistProfile[] = [];

    // Group scrobbles by artist
    const artistScrobbles = new Map<string, ProcessedScrobble[]>();
    for (const scrobble of scrobbles) {
      const key = scrobble.artistName.toLowerCase();
      const existing = artistScrobbles.get(key) || [];
      existing.push(scrobble);
      artistScrobbles.set(key, existing);
    }

    // Process top 50 artists with API enrichment
    for (const artist of artists.slice(0, 50)) {
      const scrobblesForArtist = artistScrobbles.get(artist.name.toLowerCase()) || [];

      let tags: string[] = [];
      let similarArtists: string[] = [];

      // Fetch artist info (rate limited)
      try {
        const artistInfo = await this.client.getArtistInfo(artist.name);
        if (artistInfo) {
          tags = artistInfo.tags.tag.map(t => t.name);
          similarArtists = artistInfo.similar.artist.map(a => a.name);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch {
        // Continue without enrichment
      }

      const sortedScrobbles = scrobblesForArtist.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      const firstPlay = sortedScrobbles[0]?.timestamp || new Date();
      const lastPlay = sortedScrobbles[sortedScrobbles.length - 1]?.timestamp || new Date();
      const tenureDays = Math.max(1, Math.floor(
        (lastPlay.getTime() - firstPlay.getTime()) / (1000 * 60 * 60 * 24)
      ));

      // Calculate listening sessions (gaps of >30 min = new session)
      let sessions = 1;
      for (let i = 1; i < sortedScrobbles.length; i++) {
        const gap = sortedScrobbles[i].timestamp.getTime() - sortedScrobbles[i - 1].timestamp.getTime();
        if (gap > 30 * 60 * 1000) sessions++;
      }

      profiles.push({
        name: artist.name,
        totalPlays: parseInt(artist.playcount),
        firstPlay,
        lastPlay,
        tenureDays,
        playsPerDay: parseInt(artist.playcount) / tenureDays,
        tags,
        similarArtists,
        listeningSessions: sessions,
        averageSessionDepth: scrobblesForArtist.length / Math.max(1, sessions)
      });
    }

    return profiles;
  }

  /**
   * Calculate temporal listening patterns
   */
  private calculateTemporalPatterns(scrobbles: ProcessedScrobble[]): TemporalPattern {
    const hourly = new Array(24).fill(0);
    const daily = new Array(7).fill(0);
    const monthly = new Array(12).fill(0);
    const yearly: Record<number, number> = {};

    for (const scrobble of scrobbles) {
      hourly[scrobble.hour]++;
      daily[scrobble.dayOfWeek]++;
      monthly[scrobble.month]++;
      yearly[scrobble.year] = (yearly[scrobble.year] || 0) + 1;
    }

    // Normalize to percentages
    const total = scrobbles.length || 1;
    const hourlyDist = hourly.map(h => h / total);
    const dailyDist = daily.map(d => d / total);
    const monthlyDist = monthly.map(m => m / total);

    // Peak calculations
    const peakHour = hourly.indexOf(Math.max(...hourly));
    const peakDay = daily.indexOf(Math.max(...daily));

    // Night owl score (midnight-6am listening)
    const nightListens = hourly.slice(0, 6).reduce((a, b) => a + b, 0);
    const nightOwlScore = nightListens / total;

    // Weekend warrior score
    const weekendListens = daily[0] + daily[6]; // Sunday and Saturday
    const weekendWarriorScore = weekendListens / total;

    return {
      hourlyDistribution: hourlyDist,
      dailyDistribution: dailyDist,
      monthlyDistribution: monthlyDist,
      yearlyTotals: yearly,
      peakListeningHour: peakHour,
      peakListeningDay: peakDay,
      nightOwlScore,
      weekendWarriorScore
    };
  }

  /**
   * Calculate listening eras (major phases in listening history)
   */
  private calculateListeningEras(scrobbles: ProcessedScrobble[]): ListeningEra[] {
    if (scrobbles.length < 100) return [];

    // Sort by date
    const sorted = [...scrobbles].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Divide into roughly equal eras (by scrobble count, not time)
    const erasCount = Math.min(7, Math.floor(sorted.length / 500)); // At least 500 scrobbles per era
    if (erasCount < 2) return [];

    const eras: ListeningEra[] = [];
    const scrobblesPerEra = Math.floor(sorted.length / erasCount);

    for (let i = 0; i < erasCount; i++) {
      const start = i * scrobblesPerEra;
      const end = i === erasCount - 1 ? sorted.length : (i + 1) * scrobblesPerEra;
      const eraScrobbles = sorted.slice(start, end);

      // Count artists and tags in this era
      const artistCounts = new Map<string, number>();
      const seenArtists = new Set<string>();

      for (const s of eraScrobbles) {
        artistCounts.set(s.artistName, (artistCounts.get(s.artistName) || 0) + 1);
        seenArtists.add(s.artistName);
      }

      // Sort by count
      const sortedArtists = Array.from(artistCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name]) => name);

      // Calculate days in era
      const eraDays = Math.max(1, Math.floor(
        (eraScrobbles[eraScrobbles.length - 1].timestamp.getTime() - eraScrobbles[0].timestamp.getTime())
        / (1000 * 60 * 60 * 24)
      ));

      // Calculate novelty (would need previous eras' artists to be accurate)
      const previousArtists = i > 0
        ? new Set(eras[i - 1].dominantArtists)
        : new Set<string>();
      const newArtists = [...seenArtists].filter(a => !previousArtists.has(a));
      const noveltyRate = newArtists.length / Math.max(1, seenArtists.size);

      eras.push({
        startDate: eraScrobbles[0].timestamp,
        endDate: eraScrobbles[eraScrobbles.length - 1].timestamp,
        dominantArtists: sortedArtists,
        dominantTags: [], // Would need tag data per scrobble
        averagePlaysPerDay: eraScrobbles.length / eraDays,
        noveltyRate,
        loyaltyRate: 1 - noveltyRate,
        moodSignature: [] // Would need enrichment
      });
    }

    return eras;
  }

  /**
   * Calculate behavioral metrics from listening data
   */
  private calculateBehavioralMetrics(
    scrobbles: ProcessedScrobble[],
    artists: ArtistProfile[],
    tags: Array<{ tag: string; count: number }>,
    temporal: TemporalPattern
  ): ListeningHistory['metrics'] {
    // Novelty seeking: how quickly new artists appear
    const uniqueArtists = new Set(scrobbles.map(s => s.artistName)).size;
    const noveltySeeking = Math.min(1, uniqueArtists / (scrobbles.length * 0.3));

    // Artist loyalty: concentration of plays in top artists
    const top10Plays = artists.slice(0, 10).reduce((sum, a) => sum + a.totalPlays, 0);
    const totalPlays = artists.reduce((sum, a) => sum + a.totalPlays, 0);
    const artistLoyalty = top10Plays / Math.max(1, totalPlays);

    // Genre diversity: number of unique tags
    const uniqueTags = new Set(tags.map(t => t.tag.toLowerCase())).size;
    const genreDiversity = Math.min(1, uniqueTags / 50);

    // Listening consistency: variance in temporal patterns
    const hourlyVariance = this.calculateVariance(temporal.hourlyDistribution);
    const listeningConsistency = 1 - Math.min(1, hourlyVariance * 10);

    // Emotional range: would need valence/energy data from Spotify
    // For now, estimate from tag diversity
    const emotionalRange = genreDiversity * 0.8;

    // Mainstream affinity: would need popularity data
    // For now, estimate inversely from novelty
    const mainstreamAffinity = 1 - noveltySeeking * 0.5;

    // Complexity preference: estimate from tag patterns
    const complexTags = tags.filter(t =>
      ['progressive', 'experimental', 'avant-garde', 'complex', 'jazz', 'classical', 'math rock']
        .some(ct => t.tag.toLowerCase().includes(ct))
    );
    const complexityPreference = Math.min(1, complexTags.length / 10);

    // Energy variance: estimate from temporal patterns
    const energyVariance = temporal.nightOwlScore * 0.3 + (1 - listeningConsistency) * 0.7;

    return {
      noveltySeeking,
      artistLoyalty,
      genreDiversity,
      listeningConsistency,
      emotionalRange,
      mainstreamAffinity,
      complexityPreference,
      energyVariance
    };
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(arr: number[]): number {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default LastFmClient;
