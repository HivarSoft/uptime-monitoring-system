import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  imgUrl: string;
  id: string;
}

const initialState: UserState = {
  email: "",
  firstName: "",
  lastName: "",
  token: localStorage.getItem("token") ?? "",
  imgUrl: "",
  id: "",
};

export const userSlice = createSlice({
  name: "USER",
  initialState,
  reducers: {
    USER: (
      state,
      action: PayloadAction<{ data: Partial<UserState>; token: string }>
    ) => {
      state.email = action.payload.data.email ?? state.email;
      state.firstName = action.payload.data.firstName ?? state.firstName;
      state.lastName = action.payload.data.lastName ?? state.lastName;
      state.imgUrl = action.payload.data.imgUrl ?? state.imgUrl;
      state.id = (action.payload.data.id as string) ?? state.id;
      state.token = action.payload.token;
    },

    SET_USER_PROFILE: (state, action: PayloadAction<Partial<UserState>>) => {
      if (action.payload.firstName) state.firstName = action.payload.firstName;
      if (action.payload.lastName) state.lastName = action.payload.lastName;
      if (action.payload.email) state.email = action.payload.email;
      if (action.payload.imgUrl !== undefined)
        state.imgUrl = action.payload.imgUrl;
    },

    LogoutUSER: (state) => {
      state.email = "";
      state.firstName = "";
      state.lastName = "";
      state.token = "";
      state.imgUrl = "";
      state.id = "";
    },
  },
});

export const { USER, LogoutUSER, SET_USER_PROFILE } = userSlice.actions;

export const selectUser = (state: { user: UserState }) => state.user;

export default userSlice.reducer;
