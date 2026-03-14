"use client";
import React, { useEffect } from "react";
import { store } from "./store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { setUserData, clearUserData } from "./userSlice";
import type { RootState } from "./store";

const InnerProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Only fetch user if redux user is empty
        if (!user) {
          const userRes = await fetch("/api/me");

          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData?.user) dispatch(setUserData(userData.user));
          } else if (userRes.status === 401 || userRes.status === 404) {
            dispatch(clearUserData());
          }
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };

    loadData();
  }, [dispatch, user]);

  return <>{children}</>;
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <InnerProvider>{children}</InnerProvider>
    </Provider>
  );
};