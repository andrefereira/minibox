const sharp = require("sharp");
const path = require("path");

const dir = path.join(__dirname, "public", "icons");

const jobs = [
  ["icon-any.svg", "icon-192.png", 192],
  ["icon-any.svg", "icon-512.png", 512],
  ["icon-maskable.svg", "icon-512-maskable.png", 512],
  ["icon-maskable.svg", "apple-touch-icon.png", 180],
];

(async () => {
  for (const [src, out, size] of jobs) {
    await sharp(path.join(dir, src))
      .resize(size, size)
      .png()
      .toFile(path.join(dir, out));
    console.log("Generated", out, `${size}x${size}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
