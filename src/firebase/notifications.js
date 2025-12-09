
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Crea una notificación para un usuario.
 * @param {string} toUserId 
 * @param {string} type 
 * @param {string} fromUserId 
 * @param {string} fromUserName 
 * @param {string} [postId] 
 */
export async function createNotification({ toUserId, type, fromUserId, fromUserName, postId = null }) {
  if (!toUserId || !type || !fromUserId || !fromUserName) {
    console.error('Missing required fields for createNotification');
    return;
  }

  try {
    await addDoc(collection(db, 'notifications'), {
      toUserId,
      type,
      fromUserId,
      fromUserName,
      postId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}