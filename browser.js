const puppeteer = require("puppeteer");

const scrape = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://etherscan.io/gastracker");

  console.log("should've gone to url");

  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  console.log("domcontentloaded");

  const data = await page.evaluate(() => {
    console.log("Evaluating page");

    const items = [
      ...document.querySelectorAll('[role="row"].odd, [role="row"].even'),
    ]
      .map((td) => ({
        name: td.querySelector("a").innerHTML,
        link: td.querySelector("a").href,
      }))
      .slice(0, 10);

    console.log({ items });

    return items;
  });

  await browser.close();
  console.log({ data });

  return data;
};
module.exports = {
  scrape,
};
