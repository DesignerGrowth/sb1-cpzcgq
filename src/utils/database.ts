import { db, storage } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, addDoc, getDocs, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const saveTask = async (userId: string, task: any) => {
  console.log('Saving task:', task, 'for user:', userId);
  const tasksRef = collection(db, `users/${userId}/tasks`);
  await setDoc(doc(tasksRef, task.id.toString()), task);
};

export const updateTask = async (userId: string, task: any) => {
  console.log('Updating task:', task, 'for user:', userId);
  const taskRef = doc(db, `users/${userId}/tasks/${task.id}`);
  await updateDoc(taskRef, task);
};

export const deleteTask = async (userId: string, taskId: number) => {
  console.log('Deleting task:', taskId, 'for user:', userId);
  const taskRef = doc(db, `users/${userId}/tasks/${taskId}`);
  await deleteDoc(taskRef);
};

export const savePomodoroSession = async (userId: string, sessionData: any) => {
  console.log('Saving Pomodoro session:', sessionData, 'for user:', userId);
  const sessionsRef = collection(db, `users/${userId}/sessions`);
  await addDoc(sessionsRef, sessionData);
};

export const getTasks = async (userId: string) => {
  console.log('Fetching tasks for user:', userId);
  const tasksRef = collection(db, `users/${userId}/tasks`);
  const snapshot = await getDocs(tasksRef);
  return snapshot.docs.map(doc => ({
    id: Number(doc.id),
    ...doc.data()
  }));
};

export const getUserSettings = async (userId: string) => {
  console.log('Fetching user settings for user:', userId);
  const userSettingsRef = doc(db, `users/${userId}/settings/userSettings`);
  const snapshot = await getDoc(userSettingsRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
};

export const saveUserSettings = async (userId: string, settings: any) => {
  console.log('Saving user settings:', settings, 'for user:', userId);
  const userSettingsRef = doc(db, `users/${userId}/settings/userSettings`);
  
  try {
    await setDoc(userSettingsRef, settings, { merge: true });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

export const uploadProfilePicture = async (userId: string, file: File) => {
  const storageRef = ref(storage, `profilePictures/${userId}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const updateTotalBreaks = async (userId: string, totalBreaks: number) => {
  console.log('Updating total breaks:', totalBreaks, 'for user:', userId);
  const userSettingsRef = doc(db, `users/${userId}/settings/userSettings`);
  await updateDoc(userSettingsRef, { totalBreaks });
};

export const createInitialUserSettings = async (userId: string, name: string, email: string) => {
  console.log('Creating initial user settings for user:', userId);
  const userSettingsRef = doc(db, `users/${userId}/settings/userSettings`);
  const initialSettings = {
    name,
    email,
    role: '',
    profilePictureUrl: '',
    pomodoroTime: 25,
    breakTime: 5,
    darkMode: false,
  };
  await setDoc(userSettingsRef, initialSettings);
};