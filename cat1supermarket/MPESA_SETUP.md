# M-Pesa STK Push Setup Guide

This guide will help you set up M-Pesa STK Push for your supermarket application using the Safaricom Daraja API.

## Prerequisites

1. A Safaricom phone number (for receiving test payments)
2. Access to https://developer.safaricom.co.ke/
3. Node.js installed (v14 or higher recommended)
4. ngrok (for local testing) - https://ngrok.com/

---

## Step 1: Create Daraja Developer Account

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Click "Sign Up" and create an account
3. Verify your email address
4. Log in to your dashboard

---

## Step 2: Create an App

1. In your dashboard, go to "My Apps" section
2. Click "Create App"
3. Fill in the details:
   - **App Name**: "Supermarket POS" (or any descriptive name)
   - **App Type**: Select appropriate type
4. Click "Create App"
5. Note down the following credentials:
   - **Consumer Key**
   - **Consumer Secret**
   - Keep these secure and never share them publicly

---

## Step 3: Get Your Shortcode and Passkey

### For Sandbox (Testing):

1. Go to "Test Credentials" section in your dashboard
2. Note the **Business Shortcode** (usually `174379` for sandbox)
3. For Passkey:
   - Go to "Lipa Na M-Pesa" > "Passkey"
   - The default sandbox passkey is: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
   - Or generate a new one following the API guidelines

### For Production:

1. Register for M-Pesa Business账户
2. Get your official shortcode from Safaricom
3. Request a passkey through your business account manager

---

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cd /home/bree/Downloads/cat1supermarket/server
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```env
   MPESA_CONSUMER_KEY=your_consumer_key_here
   MPESA_CONSUMER_SECRET=your_consumer_secret_here
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
   MPESA_CALLBACK_URL=http://localhost:3000/api/mpesa/callback
   ```

---

## Step 5: Set Up Callback URL (ngrok for Local Testing)

M-Pesa needs a publicly accessible URL to send payment callbacks.

### Install ngrok:
```bash
# Download from https://ngrok.com/ or install via npm
npm install -g ngrok
```

### Start ngrok:
```bash
ngrok http 3000
```

This will show output like:
```
Session Status                online
Account                       your@email.com
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

### Update Callback URL:
Update your `.env`:
```env
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
```

**Note:** ngrok URLs change each time you restart it. For permanent URLs, create a free account on ngrok.

---

## Step 6: Start the Server

```bash
cd /home/bree/Downloads/cat1supermarket/server
npm start
```

The server will start on `http://localhost:3000`

---

## Step 7: Test STK Push

### Using the Application:

1. Open the client application in your browser
2. Add items to cart
3. Click "Pay via M-Pesa"
4. Enter your test phone number (format: 07XX XXX XXX)
5. Check your phone for the STK push notification
6. Enter your M-Pesa PIN
7. Complete the payment

### Using curl (Direct API Test):

```bash
# First, login to get a token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123"}'

# Then initiate STK Push (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "phone": "254700000000",
    "amount": 100,
    "branch": "Nairobi",
    "product": "Coke"
  }'
```

---

## Understanding the Flow

```
1. User initiates payment in app
2. Server calls Daraja STK Push API
3. Safaricom sends SMS to user's phone
4. User enters PIN on their phone
5. Safaricom processes payment
6. Safaricom sends callback to your server
7. Server updates transaction status
8. WebSocket notifies client of result
```

---

## Troubleshooting

### Common Errors:

#### 1. `invalid credentials`
- Check your Consumer Key and Consumer Secret
- Ensure you're using the correct environment (sandbox vs production)

#### 2. `Bad Request - Missing parameters`
- Verify all required fields are present in the request
- Check that phone number is in correct format (254XXXXXXXXX)

#### 3. `Callback not received`
- Ensure ngrok is running and URL is correct
- Check that your firewall allows incoming connections
- Verify the callback endpoint is publicly accessible

#### 4. `Token expired`
- Tokens are valid for 1 hour
- The server should automatically refresh tokens

### Enable Debug Logging:

In your `.env`:
```env
NODE_ENV=development
DEBUG=mpesa:*
```

---

## Moving to Production

### Requirements for Production:

1. **Live Credentials**: Use production Consumer Key/Secret
2. **HTTPS Callback**: Must use HTTPS (not http://)
3. **Registered Shortcode**: Official M-Pesa business shortcode
4. **Production Passkey**: Official passkey from Safaricom
5. **Security**: Implement proper security measures

### Production Checklist:

- [ ] Use production API endpoints (not sandbox)
- [ ] Implement proper authentication
- [ ] Add rate limiting
- [ ] Implement idempotency for transactions
- [ ] Add proper error handling and logging
- [ ] Set up monitoring and alerts
- [ ] Test thoroughly with small amounts

---

## API Reference

### Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mpesa/stkpush` | Initiate STK Push |
| POST | `/api/mpesa/stkquery` | Query transaction status |
| POST | `/api/mpesa/callback` | Receive payment callbacks |
| GET | `/api/mpesa/transactions` | Get transaction history |

### STK Push Payload:
```json
{
  "phone": "254700000000",
  "amount": 100,
  "branch": "Nairobi",
  "product": "Coke"
}
```

---

## Security Best Practices

1. **Never commit `.env` to version control**
2. **Rotate credentials regularly**
3. **Validate all callback signatures**
4. **Implement idempotency keys**
5. **Log all transactions for auditing**
6. **Use HTTPS for all callbacks in production**

---

## Support

- Daraja API Documentation: https://developer.safaricom.co.ke/docs
- Support Email: api.support@safaricom.co.ke
- Community Forum: https://developer.safaricom.co.ke/forum

