const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const { PassThrough } = require('stream');

async function run() {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  const html = `
    <html>
      <body style="margin: 0; background-color: #0A0A0A; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden;">
        <h1 id="title" style="font-size: 100px; margin-bottom: 20px; font-weight: 900; text-align: center; line-height: 1.1;">Generated Programmatically</h1>
        <p style="font-size: 40px; color: #888;">No GPU required. 100% Code.</p>
        <div id="visual" style="width: 400px; height: 400px; background: linear-gradient(45deg, #FF3366, #FF9933); margin-top: 100px; border-radius: 50px; box-shadow: 0 0 100px rgba(255, 51, 102, 0.5);"></div>
      </body>
    </html>
  `;
  
  await page.setContent(html);

  const userProfile = process.env.USERPROFILE || '';
  const outputPath = path.join(userProfile, 'Downloads', 'html_generated_video.mp4');

  const fps = 30;
  const duration = 3; 
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
      const visual = document.getElementById('visual');
      const title = document.getElementById('title');
      
      const rotation = frameIndex * 3;
      const scale = 1 + Math.sin(frameIndex * 0.1) * 0.2;
      visual.style.transform = 'rotate(' + rotation + 'deg) scale(' + scale + ')';
      
      title.style.opacity = Math.min(1, frameIndex / 30);
      title.style.transform = 'translateY(' + (30 - Math.min(30, frameIndex)) + 'px)';
    }, i);

    const screenshot = await page.screenshot({ type: 'jpeg', quality: 90 });
    passThrough.write(screenshot);
    
    if (i % 15 === 0) console.log('Captured frame ' + i + '/' + frames);
  }

  passThrough.end();
  
  await encodePromise;
  await browser.close();
}

run().catch(console.error);