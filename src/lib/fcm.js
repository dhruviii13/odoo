import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, send } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Send FCM notification to specific user
export async function sendNotificationToUser(fcmToken, title, body, data = {}) {
  if (!fcmToken) return false;

  try {
    const message = {
      token: fcmToken,
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/fcm/send`, {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    return response.ok;
  } catch (error) {
    console.error('FCM Error:', error);
    return false;
  }
}

// Send FCM notification to topic (all users)
export async function sendNotificationToTopic(topic, title, body, data = {}) {
  try {
    const message = {
      to: `/topics/${topic}`,
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/fcm/send`, {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    return response.ok;
  } catch (error) {
    console.error('FCM Topic Error:', error);
    return false;
  }
}

// Send platform-wide notification
export async function sendPlatformNotification(title, body, data = {}) {
  return await sendNotificationToTopic('all', title, body, data);
}

// Get FCM token for current user (client-side)
export async function getFCMToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
} 