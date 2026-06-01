import admin from 'firebase-admin';
import midtransClient from 'midtrans-client';

// Safeguard double-initialization of Firebase Admin in Serverless Environments
try {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
    }
  }
} catch (error) {
  console.log("Firebase Admin initialization issue:", error);
}

let db = null;
try {
  db = admin.firestore();
} catch (e) {
  console.log("Failed to initialize firestore admin");
}

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
});

export default async function handler(req, res) {
  // CORS Headers support
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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
    const notificationJson = req.body;
    const statusResponse = await snap.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let paymentStatus = "pending";

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        paymentStatus = "challenge";
      } else if (fraudStatus === "accept") {
        paymentStatus = "success";
      }
    } else if (transactionStatus === "settlement") {
      paymentStatus = "success";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      paymentStatus = "failed";
    } else if (transactionStatus === "pending") {
      paymentStatus = "pending";
    }

    if (db && orderId) {
      // Update the order in Firestore using Admin SDK
      await db.collection("bookings").doc(orderId).update({
        paymentStatus,
        transactionStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Order ${orderId} updated to ${paymentStatus}`);
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
