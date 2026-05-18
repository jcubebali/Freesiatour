import express from "express";
import path from "path";
import cors from "cors";
import "dotenv/config";
import midtransClient from "midtrans-client";
import admin from "firebase-admin";

// Initialize Firebase Admin (Using application default or dummy credentials if not set, 
// but typically requires service account. We'll set it up to fail gracefully or use env variables)
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp(); // relies on GOOGLE_APPLICATION_CREDENTIALS or works in default environment
  }
} catch (error) {
  console.log("Firebase Admin already initialized or missing credentials");
}

let db: admin.firestore.Firestore | null = null;
try {
  db = admin.firestore();
} catch (e) {
  console.log("Failed to initialize firestore admin");
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Midtrans CoreApi
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || ""
});

app.post("/api/midtrans/token", async (req, res) => {
  try {
    const { orderId, grossAmount, customerDetails, itemDetails } = req.body;

    if (!orderId || !grossAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount), // Midtrans expects integer
      },
      customer_details: customerDetails,
      item_details: itemDetails,
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token, redirectUrl: transaction.redirect_url });
  } catch (error: any) {
    console.error("Midtrans token generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/midtrans/webhook", async (req, res) => {
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

    if (db) {
      // Update the order in Firestore
      await db.collection("bookings").doc(orderId).update({
        paymentStatus,
        transactionStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Order ${orderId} updated to ${paymentStatus}`);
    }

    res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error("Midtrans webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In standard production (non-Vercel), serve static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;
