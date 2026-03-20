import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import modalSlice from "./modalSlice";
import pageDirectionStore from "./pageDirectionSlice";
import assetsSlice from "./assetsSlice";
import menuSlice from "./menuSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    modal: modalSlice,
    pageDirection: pageDirectionStore,
    assets: assetsSlice,
    menus: menuSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
