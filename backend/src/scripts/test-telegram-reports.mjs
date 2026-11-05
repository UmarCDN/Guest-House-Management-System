import http from 'http';

async function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function testReports() {
  console.log('================================================================');
  console.log(' TESTING AI TELEGRAM REPORTING BOT PREVIEWS FROM LIVE MYSQL');
  console.log('================================================================\n');

  console.log('--- 1. BOT STATUS & INSTRUCTIONS ---');
  const statusRes = await request('/api/telegram/status');
  console.log('Status Code:', statusRes.status);
  console.log('Bot Configured:', statusRes.body.configured);
  console.log('Instructions:', statusRes.body.instructions);

  console.log('\n--- 2. DAILY REPORT PREVIEW (/api/telegram/preview/daily) ---');
  const dailyRes = await request('/api/telegram/preview/daily');
  console.log(dailyRes.body.report);

  console.log('\n--- 3. WEEKLY REPORT PREVIEW (/api/telegram/preview/weekly) ---');
  const weeklyRes = await request('/api/telegram/preview/weekly');
  console.log(weeklyRes.body.report);

  console.log('\n--- 4. MONTHLY REPORT PREVIEW (/api/telegram/preview/monthly) ---');
  const monthlyRes = await request('/api/telegram/preview/monthly');
  console.log(monthlyRes.body.report);

  console.log('\n--- 5. ROOM STATUS REPORT PREVIEW (/api/telegram/preview/rooms) ---');
  const roomsRes = await request('/api/telegram/preview/rooms');
  console.log(roomsRes.body.report);

  console.log('\n--- 6. LIFETIME REVENUE SUMMARY PREVIEW (/api/telegram/preview/summary) ---');
  const summaryRes = await request('/api/telegram/preview/summary');
  console.log(summaryRes.body.report);
}

testReports().catch(console.error);
