import requests


API_KEY = "24d562aebb62b534de8dde84"

# Telegram Bot Credentials (Get from @BotFather on Telegram)
TELEGRAM_BOT_TOKEN = "8264283701:AAHTWBLD5sJgyNXZd--1YMLc-58oSvuXP2g"
TELEGRAM_CHAT_ID = "8664830246"

BASE_CURRENCY = "GBP"
TARGET_CURRENCY = "TWD"

def send_telegram_message(message: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        print("Notification sent successfully.")
    except Exception as e:
        print(f"Error sending message: {e}")

def get_exchange_rate(base: str, target: str) -> float:
    url = f"https://v6.exchangerate-api.com/v6/{API_KEY}/pair/{base}/{target}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
    return data["conversion_rate"]

def main():
    rate = get_exchange_rate(BASE_CURRENCY, TARGET_CURRENCY)
    message = f" Daily Rate Update (9:00 AM)\n1 {BASE_CURRENCY} = {rate:.2f} {TARGET_CURRENCY}\n1 {TARGET_CURRENCY} = {1/rate:.4f} {BASE_CURRENCY}"
    send_telegram_message(message)

if __name__ == "__main__":
    main()
    
