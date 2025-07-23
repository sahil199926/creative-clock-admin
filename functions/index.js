const { Expo } = require("expo-server-sdk");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall } = require("firebase-functions/v2/https");

const expo = new Expo();
admin.initializeApp();
const firestore = admin.firestore();

// Callable function to send notifications
exports.sendPushNotificationCall = onCall(async (data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { userId, allUsers } = data;

  try {
    if (allUsers) {
      // Send notifications to all users
      const usersSnapshot = await firestore.collection("users").get();
      let successCount = 0;
      let failCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const pushToken = userData.expoPushToken;

        if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
          console.log(`Invalid or missing token for ${userData.email}`);
          failCount++;
          continue;
        }

        const messages = [
          {
            to: pushToken,
            sound: "default",
            title: "Admin Notification",
            body: "This is a notification from the admin panel.",
            priority: "high",
          },
        ];

        try {
          const chunks = expo.chunkPushNotifications(messages);
          for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
          }
          successCount++;
        } catch (error) {
          console.error(`Notification error for ${userData.email}:`, error);
          failCount++;
        }
      }

      return {
        success: true,
        message: `Notifications sent to ${successCount} users. Failed: ${failCount}`,
      };
    } else if (userId) {
      // Send notification to a specific user
      const usersRef = firestore.collection("users");
      const q = usersRef.where("email", "==", userId);
      const querySnapshot = await q.get();

      if (querySnapshot.empty) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const pushToken = userData.expoPushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "User does not have a valid push token"
        );
      }

      const messages = [
        {
          to: pushToken,
          sound: "default",
          title: "Admin Notification",
          body: "This is a notification from the admin panel.",
          priority: "high",
        },
      ];

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }

      return { success: true, message: "Notification sent successfully" };
    } else {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Either userId or allUsers must be provided"
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error sending notification",
      error
    );
  }
});

// Scheduled function to send daily notifications
exports.sendPushNotification = onSchedule(
  {
    schedule: "every day 12:00", // Runs at 6 PM UTC
    timeZone: "Asia/Kolkata", // Adjusts to IST
  },
  async (event) => {
    const usersSnapshot = await firestore.collection("users").get();

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

      const activitiesSnapshot = await firestore
        .collection("activities")
        .where("user", "==", userId)
        .where("createdAt", ">=", startOfDay)
        .where("createdAt", "<=", endOfDay)
        .get();

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

      const messages = [
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

    return null;
  }
);
