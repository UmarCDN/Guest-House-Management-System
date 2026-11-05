import { pool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      first_name?: string;
    };
    date: number;
    text?: string;
  };
}

// Telegram custom reply keyboard with one-tap report buttons
const REPORT_KEYBOARD = {
  keyboard: [
    [{ text: '📊 Aaj Ki Report' }, { text: '📅 Is Hafte Ki Report' }],
    [{ text: '📈 Is Mahine Ki Report' }, { text: '🏨 Room Status' }],
    [{ text: '💰 Total Revenue Summary' }, { text: '❓ Help & Commands' }]
  ],
  resize_keyboard: true,
  persistent: true
};

export class TelegramBotService {
  private token: string | null = null;
  private isPolling: boolean = false;
  private offset: number = 0;
  private botInfo: { id: number; username: string; first_name: string } | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
  }

  private getApiBase(): string {
    return (process.env.TELEGRAM_API_BASE || 'https://api.telegram.org').replace(/\/+$/, '');
  }

  public isConfigured(): boolean {
    return Boolean(this.token && this.token.length > 10);
  }

  public getBotInfo() {
    return this.botInfo;
  }

  // Start long-polling daemon with auto-retry
  public async start(): Promise<void> {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.token = process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
    if (!this.token) {
      console.log('[Telegram Bot] Notice: TELEGRAM_BOT_TOKEN not set in backend/.env. Bot is on standby.');
      console.log('[Telegram Bot] Tip: Create a bot with @BotFather and add TELEGRAM_BOT_TOKEN to .env to activate.');
      return;
    }

    const apiBase = this.getApiBase();
    try {
      const res = await fetch(`${apiBase}/bot${this.token}/getMe`, {
        signal: AbortSignal.timeout(10000)
      });
      const data: any = await res.json();
      if (!data.ok) {
        console.error('[Telegram Bot] Failed to authenticate with Telegram:', data.description);
        return;
      }

      this.botInfo = data.result;
      console.log(`[Telegram Bot] Successfully connected as @${this.botInfo?.username} (${this.botInfo?.first_name})`);
      console.log('[Telegram Bot] AI Reporting Engine is active and listening for messages...');

      this.isPolling = true;
      this.pollUpdates();
    } catch (err: any) {
      console.error(`[Telegram Bot] Connection error (${err.message}).`);
      console.log('[Telegram Bot] Note: If direct access to api.telegram.org is restricted in your region, turn on a VPN (e.g. Cloudflare WARP 1.1.1.1) or configure TELEGRAM_API_BASE.');
      console.log('[Telegram Bot] Server will auto-retry connecting in 25 seconds...');
      this.retryTimeout = setTimeout(() => {
        this.start();
      }, 25000);
    }
  }

  public async reconnect(): Promise<{ success: boolean; bot: any; error?: string }> {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.token = process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
    if (!this.token) {
      return { success: false, bot: null, error: 'TELEGRAM_BOT_TOKEN not configured in backend/.env' };
    }
    const apiBase = this.getApiBase();
    try {
      const res = await fetch(`${apiBase}/bot${this.token}/getMe`, {
        signal: AbortSignal.timeout(10000)
      });
      const data: any = await res.json();
      if (!data.ok) {
        return { success: false, bot: null, error: data.description || 'Authentication failed' };
      }
      this.botInfo = data.result;
      if (!this.isPolling) {
        this.isPolling = true;
        this.pollUpdates();
      }
      return { success: true, bot: this.botInfo };
    } catch (err: any) {
      return { success: false, bot: null, error: err.message };
    }
  }

  public stop(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.isPolling = false;
    console.log('[Telegram Bot] Polling stopped.');
  }

  private async pollUpdates(): Promise<void> {
    const apiBase = this.getApiBase();
    while (this.isPolling && this.token) {
      try {
        const url = `${apiBase}/bot${this.token}/getUpdates?offset=${this.offset}&timeout=25`;
        const res = await fetch(url, { signal: AbortSignal.timeout(35000) });
        const data: any = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result as TelegramUpdate[]) {
            this.offset = update.update_id + 1;
            if (update.message && update.message.text) {
              await this.handleIncomingMessage(update.message);
            }
          }
        }
      } catch (err: any) {
        // Sleep on error before retrying to prevent hot loop
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  // Send Markdown formatted message to Telegram chat
  public async sendMessage(chatId: number | string, text: string, useKeyboard = true): Promise<boolean> {
    if (!this.token) return false;
    const apiBase = this.getApiBase();
    try {
      const payload: any = {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      };
      if (useKeyboard) {
        payload.reply_markup = REPORT_KEYBOARD;
      }

      const res = await fetch(`${apiBase}/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      });
      const json: any = await res.json();
      return json.ok;
    } catch (err: any) {
      console.error('[Telegram Bot] Error sending message:', err.message);
      return false;
    }
  }

  // Process incoming message with AI Natural Language Understanding
  public async handleIncomingMessage(msg: NonNullable<TelegramUpdate['message']>): Promise<void> {
    const text = msg.text?.trim().toLowerCase() || '';
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Guest';

    // Optional admin restriction
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (adminChatId && String(chatId) !== String(adminChatId)) {
      await this.sendMessage(chatId, `⛔ *Access Denied*\n\nThis reporting bot is restricted to Serene Haven administrators. Your Chat ID is: \`${chatId}\``);
      return;
    }

    // 1. Help / Start
    if (text === '/start' || text.includes('start') || text === '/help' || text.includes('help') || text.includes('madad')) {
      const welcome = 
`🏨 *Assalam-o-Alaikum ${userName}!*
Welcome to *Serene Haven AI Reporting Bot*.

Main aap ke hotel ka automated AI business assistant hoon. Aap mujh se kisi bhi waqt live revenue, bookings, aur room status reports mangwa sakte hain.

*Quick Commands / Button Options:*
• 📊 *Aaj Ki Report* — \`/today\`
• 📅 *Is Hafte Ki Report* — \`/week\`
• 📈 *Is Mahine Ki Report* — \`/month\`
• 🏨 *Room Status & Occupancy* — \`/rooms\`
• 💰 *Lifetime Revenue Summary* — \`/summary\`

_Aap natural Roman Urdu ya English mein bhi sawal pooch sakte hain (e.g. "aaj ka revenue kitna hai?", "kitne rooms khali hain?")._`;
      await this.sendMessage(chatId, welcome);
      return;
    }

    // 2. Daily Report
    if (
      text.includes('/today') ||
      text.includes('/daily') ||
      text.includes('aaj') ||
      text.includes('today') ||
      text.includes('daily')
    ) {
      const report = await this.generateDailyReport();
      await this.sendMessage(chatId, report);
      return;
    }

    // 3. Weekly Report
    if (
      text.includes('/week') ||
      text.includes('hafta') ||
      text.includes('hafte') ||
      text.includes('week')
    ) {
      const report = await this.generateWeeklyReport();
      await this.sendMessage(chatId, report);
      return;
    }

    // 4. Monthly Report
    if (
      text.includes('/month') ||
      text.includes('mahina') ||
      text.includes('mahine') ||
      text.includes('month')
    ) {
      const report = await this.generateMonthlyReport();
      await this.sendMessage(chatId, report);
      return;
    }

    // 5. Room Rack / Occupancy Status
    if (
      text.includes('/rooms') ||
      text.includes('kamray') ||
      text.includes('kamra') ||
      text.includes('room') ||
      text.includes('occupan') ||
      text.includes('khali')
    ) {
      const report = await this.generateRoomStatusReport();
      await this.sendMessage(chatId, report);
      return;
    }

    // 6. Revenue / Summary
    if (
      text.includes('/summary') ||
      text.includes('/revenue') ||
      text.includes('hisab') ||
      text.includes('revenue') ||
      text.includes('summary') ||
      text.includes('kpi')
    ) {
      const report = await this.generateOverallSummaryReport();
      await this.sendMessage(chatId, report);
      return;
    }

    // Default conversational AI fallback
    const fallback = 
`🤖 *Serene Haven AI Assistant*

Maine aap ka message dekha: _"${msg.text}"_

Aap neeche diye gaye buttons click kar ke ya command likh kar live report mangwa sakte hain:
• \`/today\` — Aaj ka revenue aur occupancy
• \`/week\` — Is hafte ki report
• \`/month\` — Is mahine ki report
• \`/rooms\` — Kaunse kamray book hain aur kaunse khali`;
    await this.sendMessage(chatId, fallback);
  }

  // ==========================================
  // Report Builders directly querying MySQL
  // ==========================================

  public async generateDailyReport(targetDate?: string): Promise<string> {
    const dateStr = targetDate || new Date().toISOString().split('T')[0];

    // Today's Bookings revenue
    const [bookingsSummary]: any = await pool.query(`
      SELECT 
        COUNT(id) as total_bookings,
        COALESCE(SUM(total_price), 0) as gross_revenue,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(CASE WHEN payment_status != 'paid' THEN total_price ELSE 0 END), 0) as pending_revenue
      FROM bookings
      WHERE status != 'cancelled' 
        AND (DATE(created_at) = ? OR check_in_date = ?)
    `, [dateStr, dateStr]);

    // Check-ins today
    const [checkIns]: any = await pool.query(`
      SELECT b.booking_reference, b.guest_name, r.room_number, r.name as room_name, b.total_price
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.check_in_date = ? AND b.status != 'cancelled'
    `, [dateStr]);

    // Check-outs today
    const [checkOuts]: any = await pool.query(`
      SELECT b.booking_reference, b.guest_name, r.room_number, b.status
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.check_out_date = ?
    `, [dateStr]);

    // Current room occupancy status
    const [roomsTotal]: any = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const [roomsOccupied]: any = await pool.query(`
      SELECT COUNT(DISTINCT room_id) as count 
      FROM bookings 
      WHERE status IN ('confirmed', 'checked_in') 
        AND check_in_date <= ? AND check_out_date > ?
    `, [dateStr, dateStr]);

    const totalRooms = roomsTotal[0]?.count || 6;
    const occupiedRooms = roomsOccupied[0]?.count || 0;
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    const gross = Number(bookingsSummary[0]?.gross_revenue || 0);
    const paid = Number(bookingsSummary[0]?.paid_revenue || 0);
    const pending = Number(bookingsSummary[0]?.pending_revenue || 0);
    const bookingsCount = Number(bookingsSummary[0]?.total_bookings || 0);

    let report = `🏨 *SERENE HAVEN GUEST HOUSE*
📊 *Daily Business Report: ${dateStr}*
━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Gross Revenue Today:* $${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
✅ *Paid / Collected:* $${paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
⏳ *Pending Receivables:* $${pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
━━━━━━━━━━━━━━━━━━━━━━━━
🛌 *Occupancy Rate:* *${occupancyRate}%*
🟢 Available Rooms: *${availableRooms}*
🔴 Occupied Rooms: *${occupiedRooms}* / ${totalRooms}
📝 Active Bookings: *${bookingsCount}*
━━━━━━━━━━━━━━━━━━━━━━━━
🔑 *Check-ins Today (${checkIns.length}):*`;

    if (checkIns.length === 0) {
      report += `\n_No check-ins scheduled for today._`;
    } else {
      for (const ci of checkIns) {
        report += `\n• *#${ci.room_number}* ${ci.room_name} — ${ci.guest_name} ($${Number(ci.total_price)})`;
      }
    }

    report += `\n\n🚪 *Check-outs Today (${checkOuts.length}):*`;
    if (checkOuts.length === 0) {
      report += `\n_No check-outs scheduled for today._`;
    } else {
      for (const co of checkOuts) {
        report += `\n• *#${co.room_number}* — ${co.guest_name} (${co.status})`;
      }
    }

    report += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n💡 _Tip: Click below buttons for Weekly or Monthly reports._`;
    return report;
  }

  public async generateWeeklyReport(): Promise<string> {
    const [summary]: any = await pool.query(`
      SELECT 
        COUNT(id) as total_bookings,
        COALESCE(SUM(total_price), 0) as gross_revenue,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(DATEDIFF(check_out_date, check_in_date)), 0) as nights_sold,
        COALESCE(AVG(total_price), 0) as average_folio
      FROM bookings
      WHERE status != 'cancelled' 
        AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    const [cancelled]: any = await pool.query(`
      SELECT COUNT(id) as count, COALESCE(SUM(total_price), 0) as lost
      FROM bookings
      WHERE status = 'cancelled'
        AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    // Top room in last 7 days
    const [topRooms]: any = await pool.query(`
      SELECT r.room_number, r.name, COUNT(b.id) as bookings, SUM(b.total_price) as revenue
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.status != 'cancelled' AND b.check_in_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY r.id
      ORDER BY revenue DESC
      LIMIT 3
    `);

    // Payment methods
    const [paymentMethods]: any = await pool.query(`
      SELECT payment_method, COUNT(*) as count, SUM(total_price) as total
      FROM bookings
      WHERE status != 'cancelled' AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY payment_method
    `);

    const gross = Number(summary[0]?.gross_revenue || 0);
    const paid = Number(summary[0]?.paid_revenue || 0);
    const nights = Number(summary[0]?.nights_sold || 0);
    const totalBookings = Number(summary[0]?.total_bookings || 0);
    const avgFolio = Number(summary[0]?.average_folio || 0);
    const cancelledCount = Number(cancelled[0]?.count || 0);

    let report = `🏨 *SERENE HAVEN GUEST HOUSE*
📅 *Weekly Performance Report (Last 7 Days)*
━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Total Revenue:* $${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
💵 *Settled Volume:* $${paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
📊 *Total Stays Booked:* ${totalBookings} reservations
🌙 *Nights Sold:* ${nights} room-nights
📈 *Average Folio:* $${avgFolio.toFixed(2)}
❌ *Cancellations:* ${cancelledCount}
━━━━━━━━━━━━━━━━━━━━━━━━
🏆 *Top Performing Rooms:*`;

    if (topRooms.length === 0) {
      report += `\n_No stays recorded in the past 7 days._`;
    } else {
      for (const tr of topRooms) {
        report += `\n• *#${tr.room_number}* ${tr.name}: $${Number(tr.revenue)} (${tr.bookings} bookings)`;
      }
    }

    report += `\n━━━━━━━━━━━━━━━━━━━━━━━━
💳 *Revenue by Channel:*`;
    for (const pm of paymentMethods) {
      report += `\n• ${pm.payment_method}: $${Number(pm.total)} (${pm.count}x)`;
    }

    report += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n💡 _Type /month for full monthly business analytics._`;
    return report;
  }

  public async generateMonthlyReport(): Promise<string> {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const [summary]: any = await pool.query(`
      SELECT 
        COUNT(id) as total_bookings,
        COALESCE(SUM(total_price), 0) as gross_revenue,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(CASE WHEN payment_status != 'paid' THEN total_price ELSE 0 END), 0) as pending_revenue,
        COALESCE(SUM(DATEDIFF(check_out_date, check_in_date)), 0) as total_nights,
        COALESCE(AVG(total_price), 0) as average_folio
      FROM bookings
      WHERE status != 'cancelled'
        AND YEAR(check_in_date) = YEAR(CURDATE())
        AND MONTH(check_in_date) = MONTH(CURDATE())
    `);

    const [roomStats]: any = await pool.query(`
      SELECT r.room_number, r.name, COUNT(b.id) as bookings_count, COALESCE(SUM(b.total_price), 0) as revenue
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id 
        AND b.status != 'cancelled'
        AND YEAR(b.check_in_date) = YEAR(CURDATE())
        AND MONTH(b.check_in_date) = MONTH(CURDATE())
      GROUP BY r.id
      ORDER BY revenue DESC
    `);

    const gross = Number(summary[0]?.gross_revenue || 0);
    const paid = Number(summary[0]?.paid_revenue || 0);
    const pending = Number(summary[0]?.pending_revenue || 0);
    const bookingsCount = Number(summary[0]?.total_bookings || 0);
    const nights = Number(summary[0]?.total_nights || 0);
    const avgFolio = Number(summary[0]?.average_folio || 0);

    let report = `🏨 *SERENE HAVEN GUEST HOUSE*
📈 *Executive Monthly Report: ${currentMonth}*
━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Gross Bookings Value:* $${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
✅ *Paid / Realized:* $${paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
⏳ *Outstanding Balance:* $${pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
━━━━━━━━━━━━━━━━━━━━━━━━
📑 *Total Reservations:* ${bookingsCount}
🌙 *Total Nights Sold:* ${nights}
🏷️ *Average Daily Rate (ADR):* $${(nights > 0 ? gross / nights : 0).toFixed(2)}
👤 *Average Guest Folio:* $${avgFolio.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━
🏨 *Room Revenue Breakdown:*`;

    for (const rs of roomStats) {
      report += `\n• *#${rs.room_number}* ${rs.name}: $${Number(rs.revenue)} (${rs.bookings_count} stays)`;
    }

    report += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n💡 _Generated live from MySQL Database._`;
    return report;
  }

  public async generateRoomStatusReport(): Promise<string> {
    const [rooms]: any = await pool.query(`
      SELECT r.id, r.room_number, r.name, r.price_per_night, r.status
      FROM rooms r
      ORDER BY r.room_number ASC
    `);

    const [activeStays]: any = await pool.query(`
      SELECT b.room_id, b.guest_name, b.guest_phone, b.check_in_date, b.check_out_date, b.status
      FROM bookings b
      WHERE b.status IN ('confirmed', 'checked_in')
        AND b.check_in_date <= CURDATE() AND b.check_out_date > CURDATE()
    `);

    const stayMap = new Map<number, any>();
    for (const s of activeStays) {
      stayMap.set(s.room_id, s);
    }

    let availableCount = 0;
    let occupiedCount = 0;
    let maintCount = 0;

    let details = '';

    for (const r of rooms) {
      const stay = stayMap.get(r.id);
      const isOccupied = Boolean(stay) || r.status === 'occupied';
      const isMaint = r.status === 'maintenance';

      if (isMaint) {
        maintCount++;
        details += `\n🟡 *Room #${r.room_number}* (${r.name}): Maintenance`;
      } else if (isOccupied) {
        occupiedCount++;
        const guestName = stay?.guest_name || 'Checked-in Guest';
        const checkOut = stay?.check_out_date ? String(stay.check_out_date).split('T')[0] : 'In stay';
        details += `\n🔴 *Room #${r.room_number}* (${r.name}): Booked by *${guestName}* (Until ${checkOut})`;
      } else {
        availableCount++;
        details += `\n🟢 *Room #${r.room_number}* (${r.name}): Available ($${Number(r.price_per_night)}/nt)`;
      }
    }

    const total = rooms.length || 1;
    const occRate = Math.round((occupiedCount / total) * 100);

    return `🏨 *SERENE HAVEN VISUAL ROOM RACK*
📅 *Live Status as of ${new Date().toLocaleTimeString()}*
━━━━━━━━━━━━━━━━━━━━━━━━
📊 *Occupancy:* *${occRate}%* (${occupiedCount}/${total} Rooms)
🟢 *Available:* ${availableCount} | 🔴 *Occupied:* ${occupiedCount} | 🟡 *Maintenance:* ${maintCount}
━━━━━━━━━━━━━━━━━━━━━━━━
*Live Rooms Console:*${details}
━━━━━━━━━━━━━━━━━━━━━━━━
💡 _Select /today to view today's revenue and check-in register._`;
  }

  public async generateOverallSummaryReport(): Promise<string> {
    const [summary]: any = await pool.query(`
      SELECT 
        COUNT(id) as total_bookings,
        COALESCE(SUM(total_price), 0) as lifetime_revenue,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(DATEDIFF(check_out_date, check_in_date)), 0) as total_nights,
        COALESCE(AVG(total_price), 0) as average_folio
      FROM bookings
      WHERE status != 'cancelled'
    `);

    const [cancelled]: any = await pool.query(`
      SELECT COUNT(id) as count, COALESCE(SUM(total_price), 0) as lost
      FROM bookings WHERE status = 'cancelled'
    `);

    const [guests]: any = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "customer"');

    const rev = Number(summary[0]?.lifetime_revenue || 0);
    const paid = Number(summary[0]?.paid_revenue || 0);
    const bookings = Number(summary[0]?.total_bookings || 0);
    const nights = Number(summary[0]?.total_nights || 0);
    const avgFolio = Number(summary[0]?.average_folio || 0);
    const custCount = Number(guests[0]?.count || 0);
    const cancelledCount = Number(cancelled[0]?.count || 0);

    return `🏨 *SERENE HAVEN LUXURY GUEST HOUSE*
💎 *Lifetime Business Intelligence Summary*
━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Cumulative Gross Revenue:* $${rev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
💵 *Realized Cash Flow:* $${paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
📊 *Total Reservations Handled:* ${bookings}
🌙 *Total Nights Hosted:* ${nights}
👥 *Registered Customers:* ${custCount}
🏷️ *Average Folio Value:* $${avgFolio.toFixed(2)}
❌ *Historical Cancellations:* ${cancelledCount}
━━━━━━━━━━━━━━━━━━━━━━━━
💡 _Powered by Serene Haven Real-Time Database Engine._`;
  }
}

// Singleton instance
export const telegramBotService = new TelegramBotService();
