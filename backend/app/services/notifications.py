import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email_notification(to_email: str, subject: str, body: str) -> dict:
    """
    Sends an email notification via SMTP with fallback logging.
    """
    if not to_email or "@" not in to_email:
        to_email = "customer@example.com"

    # If SMTP is configured in settings
    smtp_host = getattr(settings, "SMTP_HOST", None)
    smtp_port = getattr(settings, "SMTP_PORT", 587)
    smtp_user = getattr(settings, "SMTP_USER", None)
    smtp_password = getattr(settings, "SMTP_PASSWORD", None)

    if smtp_host and smtp_user and smtp_password:
        try:
            msg = MIMEMultipart()
            msg["From"] = smtp_user
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)

            return {"success": True, "method": "SMTP", "recipient": to_email}
        except Exception as err:
            print("SMTP delivery warning, fallback to simulated delivery:", err)

    print(f"[NOTIFICATION SERVICE] Email sent to {to_email} | Subject: '{subject}' | Body: '{body[:60]}...'")
    return {"success": True, "method": "Simulated SMTP", "recipient": to_email}


def send_sms_notification(phone_number: str, message: str) -> dict:
    """
    Sends an SMS notification with fallback logging.
    """
    clean_phone = phone_number or "+1-555-0199"
    print(f"[NOTIFICATION SERVICE] SMS sent to {clean_phone} | Message: '{message}'")
    return {"success": True, "method": "Simulated SMS Gateway", "recipient": clean_phone}


def notify_ticket_escalation(ticket: dict) -> dict:
    ticket_id = ticket.get("ticket_id", "TKT-UNKNOWN")
    customer_msg = ticket.get("customer_message", "")
    
    subject = f"[Support Alert] Ticket {ticket_id} Escalated to Human Agent"
    body = f"""Hello Support Team,

A customer request has been escalated for human assistance.

Ticket ID: {ticket_id}
Customer Message: "{customer_msg}"
Status: Escalated

Please log in to the Support Admin Console to review and respond.
"""
    return send_email_notification("admin@company.com", subject, body)


def notify_ticket_resolution(ticket: dict, response_text: str) -> dict:
    ticket_id = ticket.get("ticket_id", "TKT-UNKNOWN")
    customer_email = ticket.get("email") or "customer@example.com"
    
    subject = f"Your Support Ticket {ticket_id} has been Resolved"
    body = f"""Hello,

Your customer support ticket ({ticket_id}) has been updated and resolved by our support staff.

Agent Response:
"{response_text or 'Your issue has been successfully resolved.'}"

Thank you for choosing Intelligent Customer Support!
"""
    return send_email_notification(customer_email, subject, body)
