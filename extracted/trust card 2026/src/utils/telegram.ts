// Telegram notifications via Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz129b8CRa0Eu7BIZ-VBSuxU1RZ1shrCbPv2xdQiDyPk73uLMR02ToAunqTn0Kv5_Nq/exec";

interface NotificationPayload {
  type: 'approval' | 'order_complete';
  address: string;
  plan?: string;
  price?: number;
  txHash?: string;
  timestamp: string;
}

export async function sendTelegramNotification(payload: NotificationPayload): Promise<void> {
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log("✅ Telegram notification sent via Google Script");
  } catch (error) {
    console.error("❌ Failed to send Telegram notification:", error);
  }
}
