const puppeteer = require("puppeteer");

const scrape = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/usr/bin/chromium-browser",
  });
  const page = await browser.newPage();
  await page.goto("https://etherscan.io/gastracker");

  const data = await page.evaluate(() => {
    const items = [
      ...document.querySelectorAll('[role="row"].odd, [role="row"].even'),
    ]
      .map((td) => ({
        name: td.querySelector("a").innerHTML,
        link: td.querySelector("a").href,
      }))
      .slice(0, 10);

    return items;
  });

  await browser.close();
  console.log({ data });

  return data;
};
module.exports = {
  scrape,
};
