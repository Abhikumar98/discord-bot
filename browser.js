const puppeteer = require("puppeteer");

const scrape = async () => {
  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      "--window-size=1200,800",
    ],
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto("https://etherscan.io/gastracker", {
    waitUntil: "networkidle0",
  });

  console.log("should've gone to url");

  // await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  console.log("domcontentloaded");

  // await page.waitUntil(500);
  // await page.waitForSelector('[role="row"]');
  // const searchResults = await page.$$eval(`role=["row"]`, (results) => {
  //   console.log({ results });
  // });

  const data = await page.evaluate(() => {
    console.log("Evaluating page");

    console.log(document.getElementsByTagName("body").innerHTML);

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

  // await browser.close();
  console.log({ data });

  return data;
};
module.exports = {
  scrape,
};
