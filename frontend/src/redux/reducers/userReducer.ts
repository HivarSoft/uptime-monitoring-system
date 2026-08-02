import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  email: string;
  firstName: string;
  lastName: string;
  imgUrl: string;
  id: string;
  /** Whether the session has been verified via /checkLogin */
  authenticated: boolean;
  /** OAuth providers linked to this account */
  providers: string[];
}

const initialState: UserState = {
  email: "",
  firstName: "",
  lastName: "",
  imgUrl: "",
  id: "",
  authenticated: false,
  providers: [],
};

export const userSlice = createSlice({
  name: "USER",
  initialState,
  reducers: {
    SET_USER: (state, action: PayloadAction<Partial<UserState>>) => {
      const p = action.payload;
      if (p.email     !== undefined) state.email     = p.email;
      if (p.firstName !== undefined) state.firstName = p.firstName;
      if (p.lastName  !== undefined) state.lastName  = p.lastName;
      if (p.imgUrl    !== undefined) state.imgUrl    = p.imgUrl;
      if (p.id        !== undefined) state.id        = p.id;
      if (p.providers !== undefined) state.providers = p.providers;
      state.authenticated = true;
    },

    LOGOUT_USER: (state) => {
      state.email         = "";
      state.firstName     = "";
      state.lastName      = "";
      state.imgUrl        = "";
      state.id            = "";
      state.authenticated = false;
      state.providers     = [];
    },
  },
});

export const { SET_USER, LOGOUT_USER } = userSlice.actions;

export const selectUser           = (state: { user: UserState }) => state.user;
export const selectAuthenticated  = (state: { user: UserState }) => state.user.authenticated;

export default userSlice.reducer;
