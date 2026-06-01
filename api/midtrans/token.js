import midtransClient from 'midtrans-client';

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

  try {
    const { 
      orderId, 
      amount, 
      grossAmount, 
      customerName, 
      customerEmail, 
      customerDetails, 
      itemDetails 
    } = req.body;

    // Support both amount (requested) and grossAmount (existing frontend logic)
    const finalAmount = amount || grossAmount;

    if (!orderId || !finalAmount) {
      return res.status(400).json({ error: 'Missing orderId or amount' });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return res.status(500).json({ error: 'Midtrans Server Key is not configured' });
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
    };

    // Support both personalized name/email and nested customerDetails objects
    if (customerName || customerEmail) {
      parameter.customer_details = {
        first_name: customerName,
        email: customerEmail || '',
      };
    } else if (customerDetails) {
      parameter.customer_details = {
        first_name: customerDetails.first_name || customerDetails.name || '',
        email: customerDetails.email || '',
        phone: customerDetails.phone || '',
      };
    }

    if (itemDetails) {
      parameter.item_details = itemDetails;
    }

    const transaction = await snap.createTransaction(parameter);
    
    return res.status(200).json({ 
      token: transaction.token,
      redirectUrl: transaction.redirect_url 
    });
  } catch (error) {
    console.error('Midtrans serverless function error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
