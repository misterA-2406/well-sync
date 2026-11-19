import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothMoveAndClick(page, selector, textToFind = null) {
  try {
    let element;
    if (textToFind) {
      element = page.locator(`${selector}:has-text("${textToFind}")`).first();
    } else {
      element = page.locator(selector).first();
    }
    await element.waitFor({ state: 'visible', timeout: 5000 });
    const box = await element.boundingBox();
    if (box) {
      const targetX = box.x + box.width / 2;
      const targetY = box.y + box.height / 2;
      await page.mouse.move(targetX, targetY, { steps: 25 });
      await sleep(250);
      await page.mouse.down();
      await sleep(150);
      await page.mouse.up();
      await sleep(400);
      return true;
    }
  } catch (err) {
    console.warn(`Could not click ${selector} (${textToFind}):`, err.message);
  }
  return false;
}

async function smoothScroll(page, distance, steps = 20) {
  const stepDist = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDist);
    await sleep(40);
  }
  await sleep(600);
}

async function main() {
  console.log('--- Starting WellSync Automated Demo Video Recording ---');
  
  const videoDir = path.resolve('docs/videos/temp_record');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  // Clean old recordings in temp
  const oldFiles = fs.readdirSync(videoDir);
  for (const f of oldFiles) {
    fs.unlinkSync(path.join(videoDir, f));
  }

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // Inject visible interactive cursor ring
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.style.position = 'fixed';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(24, 60, 50, 0.4)';
      cursor.style.border = '2.5px solid #183C32';
      cursor.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '999999';
      cursor.style.transition = 'transform 0.12s ease, background-color 0.12s ease';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.display = 'block';
      cursor.style.left = '960px';
      cursor.style.top = '540px';
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
        cursor.style.backgroundColor = 'rgba(24, 60, 50, 0.4)';
      });
    });
  });

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await sleep(2000);

  // Check if onboarding modal is present
  const onboardingVisible = await page.locator('text=Fast 60-Second Setup').isVisible().catch(() => false);
  if (onboardingVisible) {
    console.log('Walking through Onboarding Modal...');
    await sleep(1500);
    // Click step goal
    await smoothMoveAndClick(page, 'button', 'Next: Context');
    await sleep(1800);
    // Select shift work
    await smoothMoveAndClick(page, 'button', 'Shift-Work');
    await sleep(1000);
    await smoothMoveAndClick(page, 'button', 'Next: Privacy');
    await sleep(1800);
    // Launch
    await smoothMoveAndClick(page, 'button', 'Launch WellSync');
    await sleep(2000);
  }

  console.log('Activating ⚡ Judge Demo (90s) mode...');
  // Click Judge Demo button in header
  const demoClicked = await smoothMoveAndClick(page, 'button', 'Judge Demo');
  if (!demoClicked) {
    await smoothMoveAndClick(page, 'button:has-text("Judge Demo")');
  }
  await sleep(3000);

  // Today screen overview
  console.log('Showcasing Today Screen & Tariq Healthcare Persona...');
  await page.mouse.move(960, 400, { steps: 15 });
  await sleep(1500);
  
  // Scroll down to examine Target Ladder Card & 50% Minimum step-down
  console.log('Examining 3-Rung Target Ladder...');
  await smoothScroll(page, 450, 25);
  await sleep(2500);

  // Scroll down further to see Activity Chart
  console.log('Examining 21-Day Activity Chart...');
  await smoothScroll(page, 400, 25);
  await sleep(3000);

  // Scroll back to top
  await smoothScroll(page, -850, 30);
  await sleep(1500);

  // Navigate to Recovery Flow
  console.log('Navigating to Recovery Flow Tab...');
  await smoothMoveAndClick(page, 'nav button', 'Recovery');
  await sleep(3000);

  // Scroll down gently in Recovery screen
  await smoothScroll(page, 350, 20);
  await sleep(2500);

  // Click on a micro-commitment button if present
  console.log('Interacting with Recovery micro-commitment...');
  const commitmentBtn = page.locator('button:has-text("Commit"), button:has-text("10-minute")').first();
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
  }
  await smoothScroll(page, -350, 20);
  await sleep(1500);

  // Navigate to Evidence Screen
  console.log('Navigating to Evidence Screen (LifeSnaps Open Science Benchmark)...');
  await smoothMoveAndClick(page, 'nav button', 'Evidence');
  await sleep(3000);

  // Scroll down through Policy Evaluation Table
  console.log('Inspecting 4-Policy Evaluation Matrix...');
  await smoothScroll(page, 450, 25);
  await sleep(3000);
  await smoothScroll(page, 500, 25);
  await sleep(3500);
  await smoothScroll(page, -950, 30);
  await sleep(1500);

  // Navigate to Settings Screen
  console.log('Navigating to Settings Screen (UAE Context Modes & Privacy)...');
  await smoothMoveAndClick(page, 'nav button', 'Settings');
  await sleep(3000);
  await smoothScroll(page, 450, 20);
  await sleep(2500);
  await smoothScroll(page, -450, 20);
  await sleep(1500);

  // Navigate to About Screen
  console.log('Navigating to About Screen (Authors, Licensing & Non-SaMD Disclaimer)...');
  await smoothMoveAndClick(page, 'nav button', 'About');
  await sleep(3000);
  await smoothScroll(page, 400, 20);
  await sleep(2500);
  await smoothScroll(page, -400, 20);
  await sleep(1500);

  // Switch to Arabic RTL
  console.log('Demonstrating Arabic RTL Localization...');
  await smoothMoveAndClick(page, 'header button', 'العربية');
  await sleep(3500);

  // Inspect Arabic Today screen
  await smoothMoveAndClick(page, 'nav button', 'اليوم');
  await sleep(2500);
  await smoothScroll(page, 400, 20);
  await sleep(2500);
  await smoothScroll(page, -400, 20);
  await sleep(1500);

  // Switch back to English
  console.log('Switching back to English & Restoring clean state...');
  await smoothMoveAndClick(page, 'header button', 'English');
  await sleep(2000);

  // Exit Judge Demo Mode
  const exitBtn = page.locator('button:has-text("Exit Demo Mode"), button:has-text("Exit Demo")').first();
  if (await exitBtn.isVisible().catch(() => false)) {
    const box = await exitBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
      await sleep(200);
      await page.mouse.down();
      await sleep(100);
      await page.mouse.up();
      await sleep(2000);
    }
  }

  // Final hold on clean Today screen
  await sleep(2500);

  console.log('Closing browser and finalizing video stream...');
  await context.close();
  await browser.close();

  // Find recorded webm file in temp
  const files = fs.readdirSync(videoDir).filter((f) => f.endsWith('.webm'));
  if (files.length > 0) {
    const srcPath = path.join(videoDir, files[0]);
    const destPath = path.resolve('docs/videos/wellsync_competition_demo.webm');
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Demo Video Successfully Created: ${destPath}`);
    const stats = fs.statSync(destPath);
    console.log(`Video File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  } else {
    console.error('❌ No video file recorded.');
  }
}

main().catch((err) => {
  console.error('Fatal error during recording:', err);
  process.exit(1);
});
