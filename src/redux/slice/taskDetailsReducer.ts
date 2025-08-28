import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { asyncKey } from "../../constants/asyncKeys";
import { isOnline } from "../../utils/network";
import { getSession } from "../../utils/sesssion";
import {
    addTaskToFirebase,
    updateTaskInFirebase,
    deleteTaskFromFirebase,
    fetchTasksFromFirebase,
    syncTasksToFirebase
} from "../../services/firebaseService";

export interface Task {
    id: string;
    title: string;
    description: string;
    date: string; // ISO string
    status: string;
}

interface TaskDetailsState {
    taskDetails: Task[];
    loading: boolean;
}

const initialState: TaskDetailsState = {
    taskDetails: [],
    loading: false,
};

// Update the type for pending operations
type PendingOperation =
    | { type: "add" | "update", task: Task }
    | { type: "delete", id: string };

// Thunk to load tasks from AsyncStorage
export const loadTasks = createAsyncThunk("taskDetails/loadTasks", async () => {
    const uid = await getSession();
    if (await isOnline() && uid) {
        // If there are pending tasks, sync them first
        const pendingRaw = await AsyncStorage.getItem(asyncKey.pendingKey);
        if (pendingRaw) {
            try {
                const pendingOps = JSON.parse(pendingRaw) as PendingOperation[];
                if (pendingOps.length > 0) {
                    // Process all pending operations
                    for (const op of pendingOps) {
                        if (op.type === "add") {
                            await addTaskToFirebase(uid, op.task);
                        } else if (op.type === "update") {
                            await updateTaskInFirebase(uid, op.task);
                        } else if (op.type === "delete") {
                            await deleteTaskFromFirebase(uid, op.id);
                        }
                    }
                    await AsyncStorage.removeItem(asyncKey.pendingKey);
                }
            } catch { }
        }
        // Online: fetch from Firebase
        const tasks = await fetchTasksFromFirebase(uid) as Task[];
        await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(tasks));
        return tasks;
    } else {
        // Offline: fetch from local
        const data = await AsyncStorage.getItem(asyncKey.taskList);
        if (data) {
            try {
                return JSON.parse(data) as Task[];
            } catch {
                return [];
            }
        }
        return [];
    }
});


// Thunk to add a task and persist to AsyncStorage
export const addTaskAsync = createAsyncThunk(
    "taskDetails/addTaskAsync",
    async (task: Omit<Task, "id">, { getState }) => {
        const newTask: Task = {
            ...task,
            id: Date.now().toString(),
            status: task.status || "Pending",
        };
        const state = getState() as { taskDetails: TaskDetailsState };
        const updatedList = [newTask, ...state.taskDetails.taskDetails];
        const uid = await getSession();
        if (await isOnline() && uid) {
            await addTaskToFirebase(uid, newTask);
            await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(updatedList));
        } else {
            // Store in pendingSyncTasks for later sync
            const pendingRaw = await AsyncStorage.getItem(asyncKey.pendingKey);
            let pending: PendingOperation[] = [];
            if (pendingRaw) {
                try { pending = JSON.parse(pendingRaw) as PendingOperation[]; } catch { }
            }
            pending.unshift({ type: "add", task: newTask });
            await AsyncStorage.setItem(asyncKey.pendingKey, JSON.stringify(pending));
            await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(updatedList));
        }
        return newTask;
    }
);

// Thunk to update a task
export const updateTaskAsync = createAsyncThunk(
    "taskDetails/updateTaskAsync",
    async (task: Task, { getState }) => {
        const state = getState() as { taskDetails: TaskDetailsState };
        const updatedList = state.taskDetails.taskDetails.map((t) =>
            t.id === task.id ? { ...t, ...task } : t
        );
        const uid = await getSession();
        if (await isOnline() && uid) {
            await updateTaskInFirebase(uid, task);
            await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(updatedList));
        } else {
            // Update in pendingSyncTasks
            const pendingRaw = await AsyncStorage.getItem(asyncKey.pendingKey);
            let pending: PendingOperation[] = [];
            if (pendingRaw) {
                try { pending = JSON.parse(pendingRaw) as PendingOperation[]; } catch { }
            }
            // Remove any previous add/update for this id, then add new update
            const filtered = pending.filter(
                op => !(op.type !== "delete" && op.task.id === task.id)
            );
            filtered.unshift({ type: "update", task });
            await AsyncStorage.setItem(asyncKey.pendingKey, JSON.stringify(filtered));
            await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(updatedList));
        }
        return task;
    }
);

// Thunk to delete a task
export const deleteTaskAsync = createAsyncThunk(
    "taskDetails/deleteTaskAsync",
    async (taskId: string, { getState }) => {
        const state = getState() as { taskDetails: TaskDetailsState };
        const updatedList = state.taskDetails.taskDetails.filter((t) => t.id !== taskId);
        const uid = await getSession();
        if (await isOnline() && uid) {
            await deleteTaskFromFirebase(uid, taskId);
            await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(updatedList));
        } else {
            // Add a delete operation to pendingSyncTasks
            const pendingRaw = await AsyncStorage.getItem(asyncKey.pendingKey);
            let pending: PendingOperation[] = [];
            if (pendingRaw) {
                try { pending = JSON.parse(pendingRaw) as PendingOperation[]; } catch { }
            }
            // Remove any previous add/update for this id, then add delete
            const filtered = pending.filter(
                op => !(op.type !== "delete" && op.task.id === taskId)
            );
            filtered.unshift({ type: "delete", id: taskId });
            await AsyncStorage.setItem(asyncKey.pendingKey, JSON.stringify(filtered));
            await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(updatedList));
        }
        return taskId;
    }
);

// Thunk to mark a task as complete
export const completeTaskAsync = createAsyncThunk(
    "taskDetails/completeTaskAsync",
    async (taskId: string, { getState }) => {
        const state = getState() as { taskDetails: TaskDetailsState };
        const updatedList = state.taskDetails.taskDetails.map((t) =>
            t.id === taskId ? { ...t, status: "Completed" } : t
        );
        const uid = await getSession();
        const completedTask = state.taskDetails.taskDetails.find(t => t.id === taskId);
        if (await isOnline() && uid && completedTask) {
            await updateTaskInFirebase(uid, { ...completedTask, status: "Completed" });
            await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(updatedList));
        } else if (completedTask) {
            // Add/update in pendingSyncTasks
            const pendingRaw = await AsyncStorage.getItem(asyncKey.pendingKey);
            let pending: PendingOperation[] = [];
            if (pendingRaw) {
                try { pending = JSON.parse(pendingRaw) as PendingOperation[]; } catch { }
            }
            // Remove any previous add/update for this id, then add update
            const filtered = pending.filter(
                op => !(op.type !== "delete" && op.task.id === taskId)
            );
            filtered.unshift({ type: "update", task: { ...completedTask, status: "Completed" } });
            await AsyncStorage.setItem(asyncKey.pendingKey, JSON.stringify(filtered));
            await AsyncStorage.setItem(asyncKey.taskList, JSON.stringify(updatedList));
        }
        return taskId;
    }
);


const taskDetailsSlice = createSlice({
    name: "taskDetails",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadTasks.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.taskDetails = action.payload;
                state.loading = false;
            })
            .addCase(loadTasks.rejected, (state) => {
                state.loading = false;
            })
            .addCase(addTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
                state.taskDetails.unshift(action.payload);
            })
            .addCase(updateTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
                state.taskDetails = state.taskDetails.map((t) =>
                    t.id === action.payload.id ? { ...t, ...action.payload } : t
                );
            })
            .addCase(deleteTaskAsync.fulfilled, (state, action: PayloadAction<string>) => {
                state.taskDetails = state.taskDetails.filter((t) => t.id !== action.payload);
            })
            .addCase(completeTaskAsync.fulfilled, (state, action: PayloadAction<string>) => {
                state.taskDetails = state.taskDetails.map((t) =>
                    t.id === action.payload ? { ...t, status: "Completed" } : t
                );
            });
    },
});

export default taskDetailsSlice.reducer;