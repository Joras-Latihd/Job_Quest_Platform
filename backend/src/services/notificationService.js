import Notification from '../models/Notification.js';

// Notifications must never break the action that triggered them, so errors are logged and swallowed.
export async function notify(userId, { type = 'SYSTEM', title, message, link }) {
  try {
    if (userId) await Notification.create({ user: userId, type, title, message, link });
  } catch (error) {
    console.error('Could not create notification:', error.message);
  }
}

export async function notifyMany(userIds, payload) {
  try {
    if (!userIds.length) return;
    await Notification.insertMany(userIds.map((user) => ({ user, type: payload.type || 'SYSTEM', title: payload.title, message: payload.message, link: payload.link })));
  } catch (error) {
    console.error('Could not create notifications:', error.message);
  }
}
