// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import webPush from "web-push";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const VAPID_KEYS = webPush.generateVAPIDKeys();
webPush.setVapidDetails(
  "mailto:your-email@example.com", // Change to your email
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

// Store subscribers and notifications
let subscribers = [];
let notifications = ["hello"];

// Subscribe to notifications
app.post("/subscribe", (req, res) => {
  console.log("first");
  const subscription = req.body;
  subscribers.push(subscription);
  res.status(201).json({});
});

// Schedule a notification
app.post("/schedule-notification", (req, res) => {
  const { content, time } = req.body;
  console.log(content, time);
  const timeInMs = new Date(time).getTime();
  const now = Date.now();

  if (timeInMs > now) {
    notifications.push({ content, time: timeInMs });
    res.status(200).json({ message: "Notification scheduled." });
    setTimeout(() => {
      sendNotification(content);
    }, timeInMs - now);
  } else {
    res.status(400).json({ message: "Time must be in the future." });
  }
});

// Send push notification
function sendNotification(content) {
  const payload = JSON.stringify({ title: "New Notification", body: content });
  subscribers.forEach((sub) => {
    webPush.sendNotification(sub, payload).catch((error) => {
      console.error("Error sending notification:", error);
    });
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("VAPID Public Key:", VAPID_KEYS.publicKey);
});
