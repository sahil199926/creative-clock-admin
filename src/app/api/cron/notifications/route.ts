import { NextResponse } from "next/server";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// This is the cron handler that Vercel will call
export const runtime = "edge";
export const preferredRegion = "bom1"; // Mumbai region for better latency to India

// Run at 12:30 PM UTC (6:00 PM IST) every day
export const maxDuration = 300; // 5 minutes max duration
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const expo = new Expo();
    const usersSnapshot = await getDocs(collection(db, "users"));

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userData.email;
      const goals = userData.goals || {};
      const pushToken = userData.expoPushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.log(`Invalid or missing token for ${userId}`);
        continue;
      }

      const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      const today = new Date();
      const todayDay = daysOfWeek[today.getDay()];

      let userGoals = [];
      let totalGoalDurationInSeconds = 0;

      for (const goal in goals) {
        const goalData = goals[goal];
        if (goalData.frequency.split(",").includes(todayDay)) {
          userGoals.push(goalData);
          totalGoalDurationInSeconds +=
            goalData.duration.hours * 3600 + goalData.duration.minutes * 60;
        }
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const activitiesQuery = query(
        collection(db, "activities"),
        where("user", "==", userId),
        where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
        where("createdAt", "<=", Timestamp.fromDate(endOfDay))
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);

      let totalActivityDuration = 0;
      activitiesSnapshot.forEach((doc) => {
        const activityData = doc.data();
        totalActivityDuration += activityData.duration;
      });

      let notificationMessage = "";
      if (totalActivityDuration >= totalGoalDurationInSeconds) {
        notificationMessage = `Hey ${userData.name}, you have completed your goals for today! 🎉`;
      } else {
        notificationMessage = `Hey ${userData.name}, you have not completed your goals for today. Keep going! 💪`;
      }

      const messages: ExpoPushMessage[] = [
        {
          to: pushToken,
          sound: "default",
          title: "Daily Progress Check",
          body: notificationMessage,
          priority: "high",
        },
      ];

      try {
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }
      } catch (error) {
        console.error(`Notification error for ${userId}:`, error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
