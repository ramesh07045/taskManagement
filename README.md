# 📌 Task Management App

A simple and efficient **Task Management App** built with **React Native CLI** and **TypeScript**.  
It helps users organize daily tasks with features like adding, updating, deleting, and marking tasks as completed.  
The app integrates **Redux Toolkit** for state management and **Firebase** for backend services.

---

## 🚀 Features

- ✅ Create, update, and delete tasks  
- 📂 Organize tasks by categories  
- ⏰ Set due dates  
- 🌓 **Dark mode** (system + in-app toggle)  
- 🔔 **Push notifications** using **Firebase Cloud Messaging** (due reminders, status updates)  
- ☁️ **Firebase Auth** (email/password) & **Firestore** (task storage)  
- 🔄 **Redux Toolkit** for efficient state management  
- 💾 **Offline-first** with Redux Persist & Firestore’s local cache  
- 🎨 Smooth animations with **Reanimated**

---

##    Screen Record
    https://drive.google.com/drive/folders/1_2wcfC3I-aTyUWOYdcZJkkeLvblJq55_?usp=drive_link

---

## 🛠️ Tech Stack

- [React Native CLI](https://reactnative.dev/)  
- [TypeScript](https://www.typescriptlang.org/)  
- [Redux Toolkit](https://redux-toolkit.js.org/)  
- [Firebase](https://firebase.google.com/)  
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)  

---

## 📂 Project Structure

├── android/ # Native Android project files
├── ios/ # Native iOS project files
├── server/ # (Optional) Backend/server configs
├── src/ # App source code
│ ├── assets/ # Fonts, images, etc.
│ ├── constants/ # App constants (colors, strings)
│ ├── redux/ # Redux store & slices
│ │ ├── slice/ # Individual feature slices
│ │ └── store.ts # Redux store setup
│ ├── screens/ # All app screens
│ │ ├── auth/ # Login / Register screens
│ │ ├── dashboard/ # Main dashboard
│ │ ├── profile/ # User profile
│ │ ├── taskDetails/ # Task detail & update screen
│ │ └── topTab/ # Top tab navigation screens
│ ├── utils/ # Utility/helper functions
│ └── App.tsx # Root component
├── .eslintrc.js # ESLint configuration
├── .prettierrc.js # Prettier configuration
├── app.json # React Native app config
├── babel.config.js # Babel configuration
├── package.json
├── tsconfig.json
└── README.md

---

## ⚡ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ramesh07045/taskManagement
   cd task-management-app
2. Install dependencies:

    bash
    npm install
    # or
    yarn install
3. Install iOS dependencies (Mac only):

    bash
    cd ios && pod install && cd ..
4. Run the app:

    bash
    npx react-native run-android
    npx react-native run-ios

---

## 🗂️ State Management Approach

    The app uses Redux Toolkit for predictable and scalable state management.

    Slices: Each feature (e.g., auth, tasks, theme) is represented as a Redux slice in src/redux/slice/.

    Async Thunks: For Firestore operations (fetching tasks, adding tasks, updating status), async thunks are used to handle side effects.

    Normalization: Tasks are stored in a normalized structure (array + dictionary) to improve lookup and reduce redundancy.

    Integration with Firestore:

    When online → Redux state is synced with Firestore in real time.

    When offline → Redux state serves data from local storage and syncs automatically when back online.

    This approach ensures smooth user experience, offline-first support, and scalable code architecture.

---

## 📶 Offline Sync Strategy

The app is designed to work **seamlessly offline** and sync when network becomes available again.  
The core strategy involves:

1. **Local Storage with AsyncStorage**  
   - All tasks are cached locally (`taskList`) for instant offline access.  
   - Pending operations are queued in a `pendingKey` list.

2. **Pending Operations Queue**  
   - Each offline action is stored as a `PendingOperation` object:  
     ```ts
     type PendingOperation =
       | { type: "add" | "update", task: Task }
       | { type: "delete", id: string };
     ```
   - Examples:  
     - Adding a task while offline → `{ type: "add", task }`  
     - Updating a task → `{ type: "update", task }`  
     - Deleting a task → `{ type: "delete", id }`

3. **Replay on Reconnect**  
   - On app launch or when the user goes back online, the app:  
     - Reads pending operations from `AsyncStorage`.  
     - Executes them sequentially against **Firestore** (`addTaskToFirebase`, `updateTaskInFirebase`, `deleteTaskFromFirebase`).  
     - Clears the pending queue after success.  
   - This ensures no data loss and correct ordering of actions.

4. **Two Sources of Truth**  
   - **Offline mode** → Redux state + AsyncStorage is the source of truth.  
   - **Online mode** → Firestore is the source of truth; Redux state + AsyncStorage are updated after sync.

5. **Conflict Handling**  
   - The strategy prioritizes **last write wins** (the most recent update locally overwrites the previous state in Firestore).  
   - If needed, additional rules (timestamps, versioning) can be added in the future.

## AI Usage Disclosure
    Firebase Notifications – Implemented with guidance from ChatGPT.
    Animations – Implemented with support from GitHub Copilot.
    Toggle Functionality – Assisted by GitHub Copilot.
    Dashboard List Animations – Assisted by GitHub Copilot.
    Firestore Integration – Implemented with guidance from ChatGPT.
