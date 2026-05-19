import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  // Catch unhandled rejections in the page
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('unhandledrejection', event => {
      console.log('UNHANDLED REJECTION:', event.reason?.message || event.reason);
    });
    window.addEventListener('error', event => {
      console.log('UNHANDLED ERROR:', event.message);
    });
  });

  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
