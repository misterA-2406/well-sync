/**
 * WellSync — Production Demo Video Recording Script (v2 - Synchronized)
 * 
 * Records a 1080p screen capture of the WellSync app synchronized precisely
 * with the Microsoft Edge TTS voiceover audio.
 * 
 * Key Milestones (from segment_timings.json):
 *   00:00 - 00:31.3  ACT I: The Human Truth & Rapid Onboarding (31.3s)
 *   00:31.3 - 00:55.7  ACT II: Meet Tariq & Baseline Calibration (24.4s)
 *   00:55.7 - 01:39.0  ACT III: The Disruption & 50% Minimum Target Ladder (43.3s)
 *   01:39.0 - 02:09.4  ACT IV: The Comeback & Return Count Increment (30.4s)
 *   02:09.4 - 02:44.2  ACT V Part 1: Nature LifeSnaps Open Science Evidence (34.8s)
 *   02:44.2 - 02:59.5  ACT V Part 2: Arabic RTL Localization & Local-First Privacy (15.3s)
 *   02:59.5 - 03:26.0  ACT VI: Path to Pilot, About Screen & Clean Reset (26.5s)
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const FFMPEG = path.resolve('node_modules/ffmpeg-static/ffmpeg.exe');
const VIDEO_DIR = path.resolve('docs/videos/temp_record_v2');
const VOICEOVER = path.resolve('docs/videos/voiceover_full.mp3');
const FINAL_OUTPUT = path.resolve('docs/videos/wellsync_demo_final.mp4');
const TIMINGS_FILE = path.resolve('docs/videos/audio_segments/segment_timings.json');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Smooth cursor movement and click with visual feedback */
async function moveAndClick(page, selector, options = {}) {
  const { timeout = 5000, steps = 25 } = options;
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: 'visible', timeout });
    const box = await el.boundingBox();
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y, { steps });
      await sleep(180);
      await page.mouse.down();
      await sleep(120);
      await page.mouse.up();
      await sleep(300);
      return true;
    }
  } catch (err) {
    console.warn(`  ⚠ Click notice: ${selector} — ${err.message}`);
  }
  return false;
}

/** Smooth scroll */
async function scroll(page, distance, steps = 18) {
  const step = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, step);
    await sleep(30);
  }
  await sleep(400);
}

/** Smooth cursor glide without clicking */
async function glide(page, x, y, steps = 20) {
  await page.mouse.move(x, y, { steps });
  await sleep(400);
}

/** Wait until a specific elapsed time milestone from session start */
async function waitUntil(startTime, targetSeconds, label = '') {
  const targetMs = targetSeconds * 1000;
  const elapsed = Date.now() - startTime;
  if (elapsed < targetMs) {
    const waitMs = targetMs - elapsed;
    console.log(`  ⏱ Syncing to [${label || targetSeconds + 's'}]: holding ${(waitMs / 1000).toFixed(1)}s`);
    await sleep(waitMs);
  } else {
    console.log(`  ⏱ Milestone [${label || targetSeconds + 's'}]: reached in ${(elapsed / 1000).toFixed(1)}s`);
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('🎬 WellSync Demo Video — Synchronized Recording (v2)');
  console.log('======================================================\n');

  if (!fs.existsSync(VOICEOVER)) {
    console.error('❌ Voiceover audio file not found at:', VOICEOVER);
    process.exit(1);
  }

  // Ensure temp dir
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });
  for (const f of fs.readdirSync(VIDEO_DIR)) fs.unlinkSync(path.join(VIDEO_DIR, f));

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // Inject professional cursor indicator
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      Object.assign(cursor.style, {
        position: 'fixed',
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        backgroundColor: 'rgba(24, 60, 50, 0.35)',
        border: '2.5px solid #183C32',
        boxShadow: '0 0 10px rgba(0,0,0,0.18)',
        pointerEvents: 'none',
        zIndex: '999999',
        transition: 'transform 0.12s ease, background-color 0.12s ease',
        transform: 'translate(-50%, -50%)',
        left: '960px',
        top: '540px',
      });
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });
      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        cursor.style.backgroundColor = 'rgba(201, 122, 72, 0.85)';
      });
      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'rgba(24, 60, 50, 0.35)';
      });
    });
  });

  console.log('Loading application at http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await sleep(1500);

  // START SYNC CLOCK
  const startTime = Date.now();
  console.log('⏱ Recording clock started at t = 0.0s\n');

  // -------------------------------------------------------------
  // ACT I: THE HOOK & RAPID ONBOARDING (Target: 0.0s -> 31.3s)
  // -------------------------------------------------------------
  console.log('🎬 ACT I: The Human Truth & Onboarding (0:00 - 0:31.3)');

  // Let onboarding modal sit on screen while voiceover begins
  // "Imagine you've walked eight thousand steps a day for two straight weeks..."
  await glide(page, 960, 480, 20);
  await sleep(3500);

  // Hover over the 8,000 steps goal card in Step 1
  await glide(page, 720, 500, 20);
  await sleep(3000);

  // "Your fitness app resets your streak to zero..."
  await glide(page, 960, 620, 15);
  await sleep(3500);

  // "WellSync was built to end that cycle." -> Click Next to Step 2
  await moveAndClick(page, 'button:has-text("Next: Lifestyle Context")');
  await sleep(2000);

  // Step 2: Show UAE Context options
  await glide(page, 800, 440, 20);
  await sleep(2000);

  // Select Shift-Work
  await moveAndClick(page, 'button:has-text("Shift-Work")');
  await sleep(2000);

  // Click Next to Privacy
  await moveAndClick(page, 'button:has-text("Next: Privacy Choice")');
  await sleep(2000);

  // Show privacy screen & Launch
  await glide(page, 960, 540, 15);
  await sleep(1500);
  await moveAndClick(page, 'button:has-text("Launch WellSync")');
  await sleep(2000);

  // Sync to end of Act I (31.3s)
  await waitUntil(startTime, 31.3, 'ACT I End');

  // -------------------------------------------------------------
  // ACT II: MEET TARIQ & BASELINE (Target: 31.3s -> 55.7s, duration 24.4s)
  // -------------------------------------------------------------
  console.log('\n🎬 ACT II: Meet Tariq & Baseline Calibration (0:31.3 - 0:55.7)');

  // "This is Tariq, a nurse at an Abu Dhabi hospital..."
  // Click Judge Demo 90s button
  await moveAndClick(page, 'button:has-text("Judge Demo")');
  await sleep(3000);

  // Highlight the amber banner and persona stats
  await glide(page, 960, 200, 20);
  await sleep(2500);

  // "Over two weeks, he's built a healthy rhythm: 8,500 steps a day..."
  // Hover over the 8,500 baseline card
  await glide(page, 550, 320, 20);
  await sleep(3000);

  // "Our deterministic engine... learns his genuine baseline..."
  // Scroll down to Target Ladder Card
  await scroll(page, 380, 20);
  await sleep(1500);
  await glide(page, 960, 420, 20);
  await sleep(3500);

  // "So far, so good. But real life is about to intervene."
  // Gently glide cursor towards activity timeline
  await glide(page, 960, 600, 15);

  // Sync to end of Act II (55.7s)
  await waitUntil(startTime, 55.7, 'ACT II End');

  // -------------------------------------------------------------
  // ACT III: THE DISRUPTION (Target: 55.7s -> 99.0s, duration 43.3s)
  // -------------------------------------------------------------
  console.log('\n🎬 ACT III: The Disruption & 50% Minimum Ladder (0:55.7 - 1:39.0)');

  // "Day fifteen. A three-day night shift rotation begins..."
  // Scroll down to Activity Chart
  await scroll(page, 420, 22);
  await sleep(2000);

  // Inspect the cliff on the chart where steps drop to 3,200
  await glide(page, 1150, 440, 25);
  await sleep(3500);
  await glide(page, 850, 440, 25);
  await sleep(3000);

  // "In any conventional app, this is the end. Fourteen days of progress, gone."
  // Hold cursor in place on the disruption days
  await sleep(4000);

  // "But watch what WellSync does."
  // Scroll back up to the state badge & target ladder
  await scroll(page, -350, 22);
  await sleep(2000);

  // "There are no red alarms. No guilt notifications. No reset to zero."
  // Highlight the calm amber LAPSED state badge
  await glide(page, 960, 260, 20);
  await sleep(4500);

  // "Instead, the engine immediately steps Tariq's daily target down to the Minimum rung..."
  // Hover directly over the Minimum Rung (4,250 steps / 50%)
  await glide(page, 960, 480, 20);
  await sleep(5000);

  // "We don't punish disruption. We adapt to it."
  // Scroll back to top smoothly
  await scroll(page, -500, 25);
  await sleep(2000);
  await glide(page, 960, 300, 15);

  // Sync to end of Act III (99.0s)
  await waitUntil(startTime, 99.0, 'ACT III End');

  // -------------------------------------------------------------
  // ACT IV: THE COMEBACK & RECOVERY (Target: 99.0s -> 129.4s, duration 30.4s)
  // -------------------------------------------------------------
  console.log('\n🎬 ACT IV: The Comeback & Recovery Accounting (1:39.0 - 2:09.4)');

  // "On the Recovery screen, Tariq picks a single micro-commitment..."
  // Click Recovery tab
  await moveAndClick(page, 'nav button:has-text("Recovery")');
  await sleep(3000);

  // Scroll down to see recovery pathway & micro-commitments
  await scroll(page, 320, 18);
  await sleep(2000);

  // Click a micro-commitment button
  const commitmentBtn = page.locator('button:has-text("Commit"), button:has-text("10-minute"), button:has-text("Accept")').first();
  if (await commitmentBtn.isVisible().catch(() => false)) {
    const box = await commitmentBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
      await sleep(200);
      await page.mouse.down();
      await sleep(100);
      await page.mouse.up();
      await sleep(1500);
    }
  } else {
    await glide(page, 960, 500, 20);
    await sleep(2000);
  }

  // "Over three days, he hits his adapted minimum. And on day twenty-one, recovery is complete..."
  await scroll(page, -320, 18);
  await sleep(2000);

  // "His target is fully restored. All seventeen active days remain intact..."
  // Highlight the ON_TRACK badge and metrics
  await glide(page, 750, 320, 20);
  await sleep(3500);

  // "And his Return Count increments to one. That number is not a streak. It's proof of resilience."
  // Hover over Return Count badge
  await glide(page, 1150, 320, 20);
  await sleep(4000);

  // Sync to end of Act IV (129.4s)
  await waitUntil(startTime, 129.4, 'ACT IV End');

  // -------------------------------------------------------------
  // ACT V PART 1: LIFESNAPS EVIDENCE (Target: 129.4s -> 164.2s, duration 34.8s)
  // -------------------------------------------------------------
  console.log('\n🎬 ACT V Part 1: LifeSnaps Open Science Evidence (2:09.4 - 2:44.2)');

  // "Every claim we make is verifiable..."
  // Click Evidence tab
  await moveAndClick(page, 'nav button:has-text("Evidence")');
  await sleep(3000);

  // "We replayed our engine against seventy-one real participants and 7,443 days from Nature LifeSnaps..."
  // Scroll down to the Policy Matrix Table
  await scroll(page, 420, 22);
  await sleep(3500);

  // "The results: conventional streak resets collapsed an average of 17.9 times per user..."
  // Hover over Policy 2 row
  await glide(page, 850, 480, 20);
  await sleep(4000);

  // "Fixed ten-thousand-step goals labeled eighty-nine percent of days as failures..."
  // Hover over Policy 1 row
  await glide(page, 850, 420, 20);
  await sleep(4000);

  // "WellSync? Zero resets. Average recovery: 3.1 days."
  // Hover over Policy 4 row (WellSync)
  await glide(page, 850, 580, 20);
  await sleep(5000);

  // Scroll back to top smoothly
  await scroll(page, -800, 25);
  await sleep(2000);

  // Sync to end of Act V Part 1 (164.2s)
  await waitUntil(startTime, 164.2, 'ACT V Part 1 End');

  // -------------------------------------------------------------
  // ACT V PART 2: ARABIC RTL & PRIVACY (Target: 164.2s -> 179.5s, duration 15.3s)
  // -------------------------------------------------------------
  console.log('\n🎬 ACT V Part 2: Arabic RTL & Privacy (2:44.2 - 2:59.5)');

  // "And WellSync is built natively for Abu Dhabi: full Arabic localization..."
  // Click العربية button
  await moveAndClick(page, 'button:has-text("العربية")');
  await sleep(3500);

  // "Ramadan and Summer Heat modes..."
  // Glide cursor across Arabic navigation tabs
  await glide(page, 1100, 80, 20);
  await sleep(1500);
  await glide(page, 750, 80, 20);
  await sleep(2000);

  // "...and local-first privacy, zero network calls, zero cloud dependencies."
  // Click English to switch back
  await moveAndClick(page, 'button:has-text("English")');
  await sleep(2500);

  // Sync to end of Act V Part 2 (179.5s)
  await waitUntil(startTime, 179.5, 'ACT V Part 2 End');

  // -------------------------------------------------------------
  // ACT VI: PATH TO PILOT & CLOSE (Target: 179.5s -> 206.0s, duration 26.5s)
  // -------------------------------------------------------------
  console.log('\n🎬 ACT VI: Path to Pilot & Closing (2:59.5 - 3:26.0)');

  // "Our path forward: a six-month pilot with three hundred SEHA healthcare workers..."
  // Navigate to About tab
  await moveAndClick(page, 'nav button:has-text("About")');
  await sleep(3000);

  // Scroll through About: Authors (Ayesha Sultana & B. Alence), Student disclaimer
  await scroll(page, 450, 22);
  await sleep(3500);

  // "WellSync is a student prototype built with conviction..."
  // Hover over authors and licensing
  await glide(page, 960, 480, 20);
  await sleep(3000);

  // "...that progress is not perfection, and recovery, is always easier than restarting."
  // Click Today to return to clean dashboard
  await moveAndClick(page, 'nav button:has-text("Today")');
  await sleep(2000);

  // "Thank you."
  // Click Exit Demo Mode
  const exitBtn = page.locator('button:has-text("Exit Demo Mode"), button:has-text("Exit Demo")').first();
  if (await exitBtn.isVisible().catch(() => false)) {
    const box = await exitBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
      await sleep(150);
      await page.mouse.down();
      await sleep(100);
      await page.mouse.up();
      await sleep(1500);
    }
  }

  // Hold on clean dashboard until 206s
  await glide(page, 960, 540, 15);
  await waitUntil(startTime, 206.0, 'Session Complete');

  // -------------------------------------------------------------
  // FINALIZE RECORDING
  // -------------------------------------------------------------
  console.log('\n📹 Finalizing screen recording stream...');
  await context.close();
  await browser.close();

  const webmFiles = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (webmFiles.length === 0) {
    console.error('❌ No webm file captured in', VIDEO_DIR);
    process.exit(1);
  }

  const rawVideo = path.join(VIDEO_DIR, webmFiles[0]);
  const rawVideoDest = path.resolve('docs/videos/wellsync_screen_recording.webm');
  fs.copyFileSync(rawVideo, rawVideoDest);
  const rawStats = fs.statSync(rawVideoDest);
  console.log(`✅ Raw screen recording: ${rawVideoDest} (${(rawStats.size / 1024 / 1024).toFixed(1)} MB)`);

  // -------------------------------------------------------------
  // MERGE VIDEO + AUDIO USING FFMPEG
  // -------------------------------------------------------------
  console.log('\n🔀 Merging video + voiceover audio with ffmpeg...');
  console.log(`   Video: ${rawVideoDest}`);
  console.log(`   Audio: ${VOICEOVER}`);
  console.log(`   Output: ${FINAL_OUTPUT}`);

  try {
    execSync(
      `"${FFMPEG}" -y ` +
      `-i "${rawVideoDest}" ` +
      `-i "${VOICEOVER}" ` +
      `-c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p ` +
      `-c:a aac -b:a 192k ` +
      `-movflags +faststart ` +
      `"${FINAL_OUTPUT}"`,
      { stdio: 'inherit', timeout: 180000 }
    );

    const finalStats = fs.statSync(FINAL_OUTPUT);
    console.log(`\n======================================================`);
    console.log(`🎉 PERFECT DEMO VIDEO CREATED SUCCESSFULLY!`);
    console.log(`======================================================`);
    console.log(`📁 File: ${FINAL_OUTPUT}`);
    console.log(`📊 Size: ${(finalStats.size / 1024 / 1024).toFixed(1)} MB`);
    console.log(`⏱ Duration: ~3 min 26s (synchronized to screenplay voiceover)`);
    console.log(`🔊 Voiceover: Microsoft Edge Neural TTS (en-US-GuyNeural)`);
    console.log(`🖥 Resolution: 1080p (1920x1080) H.264 / AAC MP4`);
  } catch (err) {
    console.error('❌ FFmpeg merge error:', err.message);
  }
}

main().catch((err) => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
