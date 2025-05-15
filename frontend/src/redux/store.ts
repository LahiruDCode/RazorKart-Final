import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
    reducer: {
        // Add other reducers here if needed
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 