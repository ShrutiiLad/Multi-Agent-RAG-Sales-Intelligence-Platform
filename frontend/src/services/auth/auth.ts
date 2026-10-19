import { login } from "@/redux/slices/authSlice";
import { AUTH_URL, getHeaders } from "@/services/global_config";
// src/services/auth/auth.ts

export const logger = {
  info: (message: string) => {
    console.log(`[INFO]`, message);
  },
  error: (message: string) => {
    console.error(`[ERROR] ${message}`);
  },
};

// src/services/auth/auth.ts

export const loginUser =
  (username: string, password: string) => async (dispatch: any) => {
    const apiUrl = `${AUTH_URL}login/`;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      dispatch(login({ token: data.token, user: data.user })); // Dispatch login action with token and user info
      localStorage.setItem("userData", JSON.stringify(data.user));
      return { data: data, success: true };
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      // Handle error (e.g., dispatch an error action)
      return { error: error, success: false };
    }
  };

export const signUpUser = async (
  username: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  const apiUrl = `${AUTH_URL}signup/`;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        firstName,
        lastName,
      }),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return { data: data, success: true };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    // Handle error (e.g., dispatch an error action)
    return { error: error, success: false };
  }
};

export const logOut = async (token: string | "") => {
  // Clear token from local storage
  // Redirect to login page
  console.log("Logging out");

  const apiUrl = `${AUTH_URL}logout/`;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: getHeaders(token),
    });
    console.log(response);
    if (!response.ok) {
      console.log(response);
      throw new Error("Network response was not ok");
    } else {
      console.log("Logged out");
      return { success: true };
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    // Handle error (e.g., dispatch an error action)
    return { error: error, success: false };
  }
};
