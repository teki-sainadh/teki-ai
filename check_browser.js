import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('cached_user_info', JSON.stringify({
      uid: 'fake-uid-123',
      email: 'fake@example.com',
      displayName: 'Fake User'
    }));
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY HTML LENGTH:', bodyHTML.length);
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('INNER TEXT:', bodyText.substring(0, 100));
  
  await browser.close();
})();


