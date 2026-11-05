import { Router, Request, Response } from 'express';
import { telegramBotService } from '../services/telegramBot.service.js';

const router = Router();

// GET /api/telegram/status
router.get('/status', (_req: Request, res: Response) => {
  const isConfigured = telegramBotService.isConfigured();
  const botInfo = telegramBotService.getBotInfo();

  res.json({
    configured: isConfigured,
    online: Boolean(botInfo),
    bot: botInfo,
    instructions: {
      step1: 'Open Telegram and search for @BotFather',
      step2: 'Send /newbot and choose a bot name & username (e.g. SereneHavenReportBot)',
      step3: 'Copy the HTTP API token provided by BotFather',
      step4: 'Add TELEGRAM_BOT_TOKEN=<your_token> in backend/.env',
      step5: 'Restart the backend or click Connect'
    }
  });
});

// POST or GET /api/telegram/reconnect
const handleReconnect = async (_req: Request, res: Response) => {
  const result = await telegramBotService.reconnect();
  res.json({
    ...result,
    configured: telegramBotService.isConfigured(),
    online: result.success
  });
};
router.post('/reconnect', handleReconnect);
router.get('/reconnect', handleReconnect);

// GET /api/telegram/preview/:type (daily | weekly | monthly | rooms | summary)
router.get('/preview/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    let report = '';

    if (type === 'daily' || type === 'today') {
      report = await telegramBotService.generateDailyReport();
    } else if (type === 'weekly' || type === 'week') {
      report = await telegramBotService.generateWeeklyReport();
    } else if (type === 'monthly' || type === 'month') {
      report = await telegramBotService.generateMonthlyReport();
    } else if (type === 'rooms') {
      report = await telegramBotService.generateRoomStatusReport();
    } else {
      report = await telegramBotService.generateOverallSummaryReport();
    }

    res.json({ type, report });
  } catch (err: any) {
    console.error('Error generating report preview:', err);
    res.status(500).json({ message: 'Error generating report', error: err.message });
  }
});

// POST /api/telegram/send (send report to a specific chat ID)
router.post('/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId, type = 'daily' } = req.body;
    const targetChat = chatId || process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!targetChat) {
      res.status(400).json({ message: 'chatId is required (or set TELEGRAM_ADMIN_CHAT_ID in backend/.env)' });
      return;
    }

    let report = '';
    if (type === 'daily' || type === 'today') {
      report = await telegramBotService.generateDailyReport();
    } else if (type === 'weekly' || type === 'week') {
      report = await telegramBotService.generateWeeklyReport();
    } else if (type === 'monthly' || type === 'month') {
      report = await telegramBotService.generateMonthlyReport();
    } else if (type === 'rooms') {
      report = await telegramBotService.generateRoomStatusReport();
    } else {
      report = await telegramBotService.generateOverallSummaryReport();
    }

    const sent = await telegramBotService.sendMessage(targetChat, report);
    if (!sent) {
      res.status(500).json({ message: 'Failed to send message via Telegram API. Check bot token and chat ID.' });
      return;
    }

    res.json({ message: `Telegram ${type} report sent successfully!`, chatId: targetChat });
  } catch (err: any) {
    console.error('Error sending Telegram report:', err);
    res.status(500).json({ message: 'Server error sending Telegram report', error: err.message });
  }
});

export default router;
