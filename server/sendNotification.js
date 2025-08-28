const admin = require('firebase-admin');

// Initialize admin SDK with your service account
admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

async function sendNotification(deviceToken, title, body, data = {}) {
    const message = {
        token: deviceToken,
        notification: { title, body },
        data,
    };
    await admin.messaging().send(message);
    console.log('Notification sent!');
}

// Usage example:
// sendNotification('<DEVICE_FCM_TOKEN>', 'Task Update', 'Your task was updated!');
module.exports = sendNotification;
