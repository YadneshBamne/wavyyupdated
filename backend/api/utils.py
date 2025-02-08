# backend/utils/twilio_service.py
from twilio.rest import Client
import os

# Load environment variables for security
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_otp(phone_number, otp):
    """
    Sends an OTP to the specified phone number using Twilio.

    Args:
        phone_number (str): Recipient's phone number in E.164 format (e.g., +1234567890).
        otp (str): The OTP to be sent.

    Returns:
        dict: A response dictionary containing the status of the message.
    """
    try:
        message = client.messages.create(
            body=f"Your OTP is {otp} to verify on Wavyy. Please do not share this with anyone.",
            from_=TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        return {"status": "success", "sid": message.sid}
    except Exception as e:
        return {"status": "error", "message": str(e)}
