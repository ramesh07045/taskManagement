import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    userDetails: {}
}


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserSDetails: (state, action) => {
            state.userDetails = action.payload
        }
    }
})

export const { setUserSDetails } = userSlice.actions
export default userSlice.reducer