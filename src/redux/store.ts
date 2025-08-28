import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userReducer";
import taskDetailsReducer from "./slice/taskDetailsReducer";
import themeReducer from "./slice/themeReducer";



export const Store = configureStore({
    reducer: {
        user: userReducer,
        taskDetails: taskDetailsReducer,
        theme: themeReducer,
    }
})