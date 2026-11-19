const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function render() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1200 },
    deviceScaleFactor: 2 // 2x crisp retina resolution
  });

  const filePath = 'file:///' + path.resolve(__dirname, '../docs/ARCHITECTURE_AND_WORKFLOW.html').replace(/\\/g, '/');
  console.log('Navigating to:', filePath);
  await page.goto(filePath, { waitUntil: 'networkidle' });

  // Wait for mermaid SVG to render
  await page.waitForSelector('.mermaid svg', { timeout: 15000 });
  await page.waitForTimeout(1000); // allow fonts and layout to settle

  const allDiagrams = await page.$$('.mermaid svg');
  console.log('Found mermaid diagrams:', allDiagrams.length);

  if (allDiagrams.length > 0) {
    const outPath = path.resolve(__dirname, '../docs/architecture_diagram.png');
    await allDiagrams[0].screenshot({ path: outPath });
    console.log('Diagram 1 saved to:', outPath);
  }

  if (allDiagrams.length > 1) {
    const outPath2 = path.resolve(__dirname, '../docs/fsm_workflow_diagram.png');
    await allDiagrams[1].screenshot({ path: outPath2 });
    console.log('Diagram 2 saved to:', outPath2);
  }

  await browser.close();
  console.log('Done rendering diagrams!');
}

render().catch(err => {
  console.error('Error rendering diagram:', err);
  process.exit(1);
});
