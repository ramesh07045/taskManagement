import firestore from '@react-native-firebase/firestore';

export const getUserTasksRef = (uid: string) =>
    firestore().collection('users').doc(uid).collection('tasks');

export const syncTasksToFirebase = async (uid: string, tasks: any[]) => {
    const ref = getUserTasksRef(uid);
    const batch = firestore().batch();
    tasks.forEach(task => {
        const docRef = ref.doc(task.id);
        batch.set(docRef, task);
    });
    await batch.commit();
};

export const addTaskToFirebase = async (uid: string, task: any) => {
    await getUserTasksRef(uid).doc(task.id).set(task);
};

export const updateTaskInFirebase = async (uid: string, task: any) => {
    await getUserTasksRef(uid).doc(task.id).update(task);
};

export const deleteTaskFromFirebase = async (uid: string, taskId: string) => {
    await getUserTasksRef(uid).doc(taskId).delete();
};

export const fetchTasksFromFirebase = async (uid: string) => {
    const snapshot = await getUserTasksRef(uid).get();
    return snapshot.docs.map(doc => doc.data());
};

// Save user's FCM token to Firestore
export const saveUserFcmToken = async (uid: string, token: string) => {
    await firestore().collection('users').doc(uid).update({ fcmToken: token });
};
