"use client";
import { confirmSignUp, signIn, signOut, signUp } from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import config from "../../amplifyconfiguration.json";
Amplify.configure(config);

//Create new user
export const handleSignUp = async (password, email) => {
  try {
    const response = await signUp({
      username: email,
      password: password,
    });

    // console.log(userId);
    return response;
  } catch (error) {
    console.log("error signing up:", error);
  }
};

//Confirmation Code

export const handleSignUpConfirmation = async (username, confirmationCode) => {
  try {
    const response = await confirmSignUp({ username, confirmationCode });
    return response;
  } catch (error) {
    console.log("This code is wrong", error);
  }
};

//Sign in
export const LogIn = async (username, password) => {
  try {
    const response = await signIn({ username, password });
    // console.log(response);
    return response;
  } catch (error) {
    console.log("error signing in", error);
    // return error;
  }
};

export const LogOutUser = async () => {
  try {
    const response = await signOut();
    return response;
  } catch (error) {
    console.log(error);
  }
};
