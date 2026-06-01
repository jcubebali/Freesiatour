import midtransClient from 'midtrans-client';

// Email validator regex matching valid standard format
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export default async function handler(req, res) {
  // CORS Headers support
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Debug Log for incoming payload request
  console.log('--- Midtrans Token API Call ---');
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  try {
    const { 
      orderId, 
      amount, 
      grossAmount, 
      customerName, 
      customerEmail, 
      customerPhone,
      customerDetails, 
      itemDetails 
    } = req.body;

    // Support both amount (requested) and grossAmount (existing frontend logic)
    const finalAmount = amount || grossAmount;

    if (!orderId || !finalAmount) {
      console.error('Validation Error: Missing orderId or amount/grossAmount');
      return res.status(400).json({ error: 'Missing orderId or amount' });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('Config Error: Midtrans Server Key is not configured');
      return res.status(500).json({ error: 'Midtrans Server Key is not configured' });
    }

    // Determine the safe & validated email
    let validatedEmail = 'guest@freesiatour.com';
    let rawEmailInput = '';

    if (customerEmail) {
      rawEmailInput = customerEmail;
    } else if (customerDetails && customerDetails.email) {
      rawEmailInput = customerDetails.email;
    }

    if (rawEmailInput && isValidEmail(rawEmailInput)) {
      validatedEmail = rawEmailInput.trim();
      console.log(`Email check passed: Using "${validatedEmail}"`);
    } else {
      console.log(`Email validation failed or missing (raw input: "${rawEmailInput}"). Falling back to "guest@freesiatour.com"`);
    }

    // Determine safe & clean name
    let validatedName = 'Guest Customer';
    let rawNameInput = '';

    if (customerName) {
      rawNameInput = customerName;
    } else if (customerDetails && (customerDetails.first_name || customerDetails.name)) {
      rawNameInput = customerDetails.first_name || customerDetails.name;
    }

    if (rawNameInput) {
      validatedName = rawNameInput.trim();
    }

    // Determine safe & clean phone
    let validatedPhone = '';
    let rawPhoneInput = '';

    if (customerPhone) {
      rawPhoneInput = customerPhone;
    } else if (customerDetails && customerDetails.phone) {
      rawPhoneInput = customerDetails.phone;
    }

    if (rawPhoneInput) {
      validatedPhone = rawPhoneInput.trim();
    }

    // Initialize Midtrans Snap client in sandbox mode
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: serverKey,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(Number(finalAmount)), // Midtrans expects integer
      },
      customer_details: {
        first_name: validatedName,
        email: validatedEmail,
        phone: validatedPhone,
      }
    };

    if (itemDetails) {
      parameter.item_details = itemDetails;
    }

    console.log('Sending following parameters to Midtrans snap API:', JSON.stringify(parameter, null, 2));

    const transaction = await snap.createTransaction(parameter);
    
    console.log('Successfully generated Midtrans snap token:', transaction.token);

    return res.status(200).json({ 
      token: transaction.token,
      redirectUrl: transaction.redirect_url 
    });
  } catch (error) {
    console.error('Midtrans serverless function error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
