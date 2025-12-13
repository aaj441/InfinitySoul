#!/usr/bin/env npx ts-node
/**
 * Last.fm Integration Test Script
 * ================================
 *
 * Run this to see your 20 years of music data.
 *
 * Usage:
 *   LASTFM_API_KEY=your_key LASTFM_USERNAME=your_username npx ts-node scripts/test-lastfm.ts
 *
 * Or set them in .env and run:
 *   npx ts-node scripts/test-lastfm.ts
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_KEY = process.env.LASTFM_API_KEY;
const USERNAME = process.env.LASTFM_USERNAME;
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

if (!API_KEY) {
  console.error('\n❌ LASTFM_API_KEY not set');
  console.error('   Get one free at: https://www.last.fm/api/account/create\n');
  process.exit(1);
}

if (!USERNAME) {
  console.error('\n❌ LASTFM_USERNAME not set');
  console.error('   Set your Last.fm username in .env or as environment variable\n');
  process.exit(1);
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  🎵 INFINITYSOUL - LAST.FM DATA EXPLORER');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Get User Info
  console.log('📊 Fetching user profile...\n');

  const userInfo = await axios.get(BASE_URL, {
    params: {
      method: 'user.getinfo',
      user: USERNAME,
      api_key: API_KEY,
      format: 'json',
    },
  });

  const user = userInfo.data.user;
  const registeredDate = new Date(parseInt(user.registered.unixtime) * 1000);
  const yearsActive = Math.floor((Date.now() - registeredDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const scrobblesPerDay = Math.round(parseInt(user.playcount) / ((Date.now() - registeredDate.getTime()) / (24 * 60 * 60 * 1000)));

  console.log(`  👤 Username:        ${user.name}`);
  console.log(`  🌍 Country:         ${user.country || 'Not set'}`);
  console.log(`  📅 Member since:    ${registeredDate.toLocaleDateString()} (${yearsActive} years)`);
  console.log(`  🎧 Total scrobbles: ${parseInt(user.playcount).toLocaleString()}`);
  console.log(`  📈 Avg per day:     ${scrobblesPerDay} tracks`);
  console.log('');

  // 2. Get Top Artists (All Time)
  console.log('🎤 Top 10 Artists (All Time):\n');

  const topArtists = await axios.get(BASE_URL, {
    params: {
      method: 'user.gettopartists',
      user: USERNAME,
      api_key: API_KEY,
      format: 'json',
      period: 'overall',
      limit: 10,
    },
  });

  topArtists.data.topartists.artist.forEach((artist: any, i: number) => {
    const plays = parseInt(artist.playcount).toLocaleString();
    console.log(`  ${(i + 1).toString().padStart(2)}. ${artist.name.padEnd(30)} ${plays.padStart(8)} plays`);
  });
  console.log('');

  // 3. Get Top Tracks (All Time)
  console.log('🎵 Top 10 Tracks (All Time):\n');

  const topTracks = await axios.get(BASE_URL, {
    params: {
      method: 'user.gettoptracks',
      user: USERNAME,
      api_key: API_KEY,
      format: 'json',
      period: 'overall',
      limit: 10,
    },
  });

  topTracks.data.toptracks.track.forEach((track: any, i: number) => {
    const plays = parseInt(track.playcount).toLocaleString();
    const title = `${track.artist.name} - ${track.name}`.slice(0, 45);
    console.log(`  ${(i + 1).toString().padStart(2)}. ${title.padEnd(47)} ${plays.padStart(6)} plays`);
  });
  console.log('');

  // 4. Get Recent Tracks
  console.log('⏱️  Last 10 Tracks:\n');

  const recentTracks = await axios.get(BASE_URL, {
    params: {
      method: 'user.getrecenttracks',
      user: USERNAME,
      api_key: API_KEY,
      format: 'json',
      limit: 10,
    },
  });

  recentTracks.data.recenttracks.track.forEach((track: any, i: number) => {
    const isNowPlaying = track['@attr']?.nowplaying === 'true';
    const time = isNowPlaying ? '▶️ NOW' : new Date(parseInt(track.date?.uts || 0) * 1000).toLocaleTimeString();
    const title = `${track.artist['#text']} - ${track.name}`.slice(0, 50);
    console.log(`  ${time.padEnd(10)} ${title}`);
  });
  console.log('');

  // 5. Listening Patterns (Last 7 Days)
  console.log('📈 This Week vs Last Week:\n');

  const now = Math.floor(Date.now() / 1000);
  const oneWeekAgo = now - (7 * 24 * 60 * 60);
  const twoWeeksAgo = now - (14 * 24 * 60 * 60);

  const thisWeek = await axios.get(BASE_URL, {
    params: {
      method: 'user.getrecenttracks',
      user: USERNAME,
      api_key: API_KEY,
      format: 'json',
      from: oneWeekAgo,
      to: now,
      limit: 1,
    },
  });

  const lastWeek = await axios.get(BASE_URL, {
    params: {
      method: 'user.getrecenttracks',
      user: USERNAME,
      api_key: API_KEY,
      format: 'json',
      from: twoWeeksAgo,
      to: oneWeekAgo,
      limit: 1,
    },
  });

  const thisWeekCount = parseInt(thisWeek.data.recenttracks['@attr'].total);
  const lastWeekCount = parseInt(lastWeek.data.recenttracks['@attr'].total);
  const change = thisWeekCount - lastWeekCount;
  const changePercent = lastWeekCount > 0 ? Math.round((change / lastWeekCount) * 100) : 0;
  const arrow = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';

  console.log(`  This week:  ${thisWeekCount.toLocaleString()} tracks`);
  console.log(`  Last week:  ${lastWeekCount.toLocaleString()} tracks`);
  console.log(`  Change:     ${arrow} ${change > 0 ? '+' : ''}${change} (${changePercent > 0 ? '+' : ''}${changePercent}%)`);
  console.log('');

  // 6. Data Value Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  💎 YOUR DATA VALUE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const totalDataPoints = parseInt(user.playcount);
  const uniqueArtists = parseInt(topArtists.data.topartists['@attr'].total);

  console.log(`  📊 Total behavioral data points: ${totalDataPoints.toLocaleString()}`);
  console.log(`  🎤 Unique artists explored:      ${uniqueArtists.toLocaleString()}`);
  console.log(`  📅 Years of continuous data:     ${yearsActive}`);
  console.log(`  🧬 Estimated correlations:       ${Math.round(totalDataPoints * 0.1).toLocaleString()}+`);
  console.log('');
  console.log('  This data is YOUR behavioral genome.');
  console.log('  No competitor can replicate it.');
  console.log('  It took you ' + yearsActive + ' years to build.');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ✅ Last.fm integration working!');
  console.log('  🚀 Ready to map music → behavior correlations');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('\n❌ Error:', error.response?.data?.message || error.message);
  process.exit(1);
});
