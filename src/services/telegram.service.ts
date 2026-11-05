import api from './api';

export interface TelegramBotStatus {
  configured: boolean;
  online: boolean;
  bot?: {
    id: number;
    username: string;
    first_name: string;
  };
  instructions: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
  };
}

export const telegramService = {
  getStatus: async (): Promise<TelegramBotStatus> => {
    try {
      const res = await api.get('/telegram/status');
      return res.data;
    } catch {
      return {
        configured: false,
        online: false,
        instructions: {
          step1: 'Open Telegram and search for @BotFather',
          step2: 'Send /newbot and choose a bot name & username (e.g. SereneHavenReportBot)',
          step3: 'Copy the HTTP API token provided by BotFather',
          step4: 'Add TELEGRAM_BOT_TOKEN=<your_token> in backend/.env',
          step5: 'Restart the backend to activate'
        }
      };
    }
  },

  getPreview: async (type: 'daily' | 'weekly' | 'monthly' | 'rooms' | 'summary'): Promise<string> => {
    try {
      const res = await api.get(`/telegram/preview/${type}`);
      return res.data.report || '';
    } catch {
      return 'Failed to load preview from server.';
    }
  },

  sendReport: async (type: 'daily' | 'weekly' | 'monthly' | 'rooms' | 'summary', chatId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/telegram/send', { type, chatId });
      return { success: true, message: res.data.message || 'Report sent successfully!' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Error sending report' };
    }
  }
};
