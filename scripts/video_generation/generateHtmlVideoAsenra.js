const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const { PassThrough } = require('stream');

async function run() {
  console.log('Launching headless browser to render Asenra brand video...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  // Data from Supabase
  const brandName = "Asenra";
  const tagline = "Enterprise AI Consulting";
  const mission = "Transform operations through enterprise AI & intelligent automation.";

  const html = `
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;600;900&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; background-color: #050505; color: #FFFFFF; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; position: relative;">
        
        <!-- Animated Background Tech Grid -->
        <div id="grid" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-size: 100px 100px; background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px); opacity: 0; transform: scale(1.5);"></div>

        <div style="z-index: 10; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 100px;">
          <!-- Brand Logo/Name -->
          <h1 id="brand" style="font-size: 140px; font-weight: 900; letter-spacing: -2px; margin-bottom: 20px; opacity: 0; transform: translateY(50px); background: linear-gradient(90deg, #FFFFFF, #888888); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            ${brandName}
          </h1>
          
          <div id="line" style="width: 0px; height: 4px; background-color: #3b82f6; margin-bottom: 50px;"></div>

          <!-- Headline -->
          <h2 id="tagline" style="font-size: 60px; font-weight: 600; margin-bottom: 30px; opacity: 0; transform: translateY(30px);">
            ${tagline}
          </h2>

          <!-- Subtext -->
          <p id="mission" style="font-size: 40px; font-weight: 300; color: #A0A0A0; line-height: 1.4; opacity: 0;">
            ${mission}
          </p>
        </div>
      </body>
    </html>
  `;
  
  await page.setContent(html);

  const userProfile = process.env.USERPROFILE || '';
  const outputPath = path.join(userProfile, 'Downloads', 'Asenra_Brand_Video.mp4');

  const fps = 30;
  const duration = 4; // 4 seconds
  const frames = fps * duration;

  console.log('Capturing frames and encoding to MP4...');

  const passThrough = new PassThrough();

  const command = ffmpeg()
    .input(passThrough)
    .inputFormat('image2pipe')
    .inputOptions(['-framerate ' + fps])
    .outputOptions([
      '-c:v libx264',
      '-pix_fmt yuv420p',
      '-preset ultrafast'
    ])
    .output(outputPath);

  command.on('error', (err) => {
    console.error('FFmpeg Error: ', err.message);
  });

  const encodePromise = new Promise((resolve) => {
    command.on('end', () => {
      console.log('✅ Video saved successfully at:', outputPath);
      resolve();
    });
  });

  command.run();

  for (let i = 0; i < frames; i++) {
    await page.evaluate((frameIndex) => {
      const grid = document.getElementById('grid');
      const brand = document.getElementById('brand');
      const line = document.getElementById('line');
      const tagline = document.getElementById('tagline');
      const mission = document.getElementById('mission');
      
      // Grid animation
      grid.style.opacity = Math.min(1, frameIndex / 30);
      grid.style.transform = 'scale(' + (1.5 - (frameIndex * 0.002)) + ')';
      
      // Brand Intro (Frames 0-30)
      if (frameIndex > 10) {
        brand.style.opacity = Math.min(1, (frameIndex - 10) / 20);
        brand.style.transform = 'translateY(' + Math.max(0, 50 - ((frameIndex - 10) * 2.5)) + 'px)';
      }

      // Line expand (Frames 30-50)
      if (frameIndex > 30) {
        line.style.width = Math.min(200, (frameIndex - 30) * 10) + 'px';
      }

      // Tagline (Frames 45-70)
      if (frameIndex > 45) {
        tagline.style.opacity = Math.min(1, (frameIndex - 45) / 25);
        tagline.style.transform = 'translateY(' + Math.max(0, 30 - ((frameIndex - 45) * 1.2)) + 'px)';
      }

      // Mission (Frames 70-100)
      if (frameIndex > 70) {
        mission.style.opacity = Math.min(1, (frameIndex - 70) / 30);
      }
    }, i);

    const screenshot = await page.screenshot({ type: 'jpeg', quality: 90 });
    passThrough.write(screenshot);
    
    if (i % 30 === 0) console.log('Captured frame ' + i + '/' + frames);
  }

  passThrough.end();
  
  await encodePromise;
  await browser.close();
}

run().catch(console.error);
