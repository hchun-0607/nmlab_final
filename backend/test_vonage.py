import os
from vonage import Vonage, Auth
from vonage_sms import SmsMessage
from dotenv import load_dotenv


def main():
    load_dotenv()  # Load environment variables from .env file
    api_key = os.getenv('VONAGE_API_KEY')
    api_secret = os.getenv('VONAGE_API_SECRET')
    from_number = os.getenv('VONAGE_FROM_NUMBER')
    to_number = os.getenv('VONAGE_TO_NUMBER')
    if not all([api_key, api_secret, from_number, to_number]):
        print("請確保 .env 檔案中有設定 VONAGE_API_KEY、VONAGE_API_SECRET、VONAGE_FROM_NUMBER 和 VONAGE_TO_NUMBER")
        return
    auth = Auth(api_key, api_secret)
    client = Vonage(auth)
    msg = SmsMessage(
        from_="VonageAPI",
        to=to_number,
        text='Hello from Vonage! This is a test message.',
    )
    response = client.sms.send(msg)
    first = response.messages[0]
    if first.status == "0":
        print("✅ 簡訊發送成功，Message ID:", first.message_id)
    else:
        print("❌ 發送失敗：", first.error_text)
        
if __name__ == "__main__":
    main()
    print("Starting Vonage SMS test...")
    main()