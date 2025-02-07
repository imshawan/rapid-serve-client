import { createSlice } from '@reduxjs/toolkit'

interface AppState {
    darkMode: boolean
    sidebarOpen: boolean
}

const initialState: AppState = {
    darkMode: false,
    sidebarOpen: true,
}

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode
        },
        toggleSidebar: (state, {payload=null}) => {
            console.log("toggleSidebar -> payload", payload)
            if (payload !== null) {
                state.sidebarOpen = payload
                return
            }
            state.sidebarOpen = !state.sidebarOpen
        },
    },
})

export const { toggleDarkMode, toggleSidebar } = appSlice.actions
export default appSlice.reducer