const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function generateSVG() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Your HTML content
  const htmlContent = fs.readFileSync("profile.html", "utf8");

  await page.setContent(htmlContent, {
    waitUntil: "networkidle0",
  });

  // Get the page dimensions
  const dimensions = await page.evaluate(() => {
    const grid = document.querySelector(".grid");
    return {
      width: grid.offsetWidth,
      height: grid.offsetHeight,
    };
  });

  // Create SVG with embedded HTML
  const svg = `
    <svg 
      width="${dimensions.width}" 
      height="${dimensions.height}" 
      viewBox="0 0 ${dimensions.width} ${dimensions.height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${htmlContent}
        </div>
      </foreignObject>
    </svg>
  `;

  fs.writeFileSync("profile.svg", svg);
  await browser.close();
}

generateSVG().catch(console.error);
