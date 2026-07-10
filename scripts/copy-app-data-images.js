const fs = require("fs");
const path = require("path");

const sourceDir = path.join(process.cwd(), "app-data", "images");
const destDir = path.join(process.cwd(), "public", "app-data", "images");

function copyImages() {
  if (!fs.existsSync(sourceDir)) {
    console.log("No app-data/images directory found, skipping copy.");
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(sourceDir);
  let copied = 0;

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    if (!fs.statSync(sourcePath).isFile()) continue;

    fs.copyFileSync(sourcePath, path.join(destDir, file));
    copied++;
  }

  console.log(`Copied ${copied} image(s) to public/app-data/images/`);
}

copyImages();
