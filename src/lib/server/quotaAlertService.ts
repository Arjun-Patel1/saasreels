export interface QuotaAlert {
  id: string;
  provider: string;
  model: string;
  statusCode: number;
  errorMessage: string;
  timestamp: string;
  targetBrand?: string;
}

export interface QuotaStatus {
  status: 'healthy' | 'warning' | 'quota_exhausted';
  lastChecked: string;
  lastExhaustedAt?: string;
  totalAlerts: number;
  recentAlerts: QuotaAlert[];
  webhookConfigured: boolean;
}

let inMemoryAlerts: QuotaAlert[] = [];
let lastExhaustedAt: string | undefined;

export const quotaAlertService = {
  recordQuotaAlert: async (data: {
    provider: string;
    model: string;
    statusCode: number;
    errorMessage: string;
    targetBrand?: string;
  }) => {
    const alert: QuotaAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      provider: data.provider,
      model: data.model,
      statusCode: data.statusCode,
      errorMessage: data.errorMessage,
      targetBrand: data.targetBrand,
      timestamp: new Date().toISOString(),
    };

    lastExhaustedAt = alert.timestamp;
    inMemoryAlerts = [alert, ...inMemoryAlerts].slice(0, 50);

    console.warn(`🚨 [QUOTA ALERT] ${data.provider.toUpperCase()} (${data.model}) rate limit / quota exhausted at ${alert.timestamp}`);

    // Send Webhook alert if ALERT_WEBHOOK_URL is configured (e.g. Discord, Slack, Telegram, Zapier, Make)
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const payload = {
          content: `🚨 **[SaaSReels Alert] ${data.provider.toUpperCase()} Free Quota / Rate Limit Depleted!**\n` +
            `• **Model**: \`${data.model}\`\n` +
            `• **Status**: HTTP ${data.statusCode}\n` +
            `• **Time**: ${new Date().toLocaleString()}\n` +
            `• **Action Taken**: System automatically switched to Built-in Zero-Cost Local Engine.\n` +
            `• **Message**: ${data.errorMessage.slice(0, 300)}`,
          username: 'SaaSReels Quota Bot',
        };

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (webhookErr) {
        console.error('Failed to dispatch quota alert webhook:', webhookErr);
      }
    }

    return alert;
  },

  getQuotaStatus: (): QuotaStatus => {
    const isRecentlyExhausted =
      lastExhaustedAt &&
      Date.now() - new Date(lastExhaustedAt).getTime() < 1000 * 60 * 30; // 30 mins window

    return {
      status: isRecentlyExhausted ? 'quota_exhausted' : inMemoryAlerts.length > 0 ? 'warning' : 'healthy',
      lastChecked: new Date().toISOString(),
      lastExhaustedAt,
      totalAlerts: inMemoryAlerts.length,
      recentAlerts: inMemoryAlerts.slice(0, 10),
      webhookConfigured: Boolean(process.env.ALERT_WEBHOOK_URL),
    };
  },
};
