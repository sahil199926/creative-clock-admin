import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "./firebase";

// Initialize Firebase Admin if it hasn't been initialized yet
if (!getApps().length) {
  try {
    // For local development, you can use the default credentials
    // For production, you should use environment variables
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

// Get Firestore instance
export const adminDb = getFirestore();

// Function to send a notification to a specific user
export const sendNotificationToUser = async (userId: string) => {
  try {
    const functions = getFunctions();
    const sendPushNotificationCall = httpsCallable(
      functions,
      "sendPushNotificationCall"
    );

    const result = await sendPushNotificationCall({ userId });
    return result.data;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Function to send notifications to all users
export const sendNotificationsToAllUsers = async () => {
  try {
    const functions = getFunctions();
    const sendPushNotificationCall = httpsCallable(
      functions,
      "sendPushNotificationCall"
    );

    const result = await sendPushNotificationCall({ allUsers: true });
    return result.data;
  } catch (error) {
    console.error("Error sending notifications to all users:", error);
    throw error;
  }
};
