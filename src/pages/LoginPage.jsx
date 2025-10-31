import React from "react";
import BackgroundContainer from "../BackgroundContainer";
import LoginForm from "./LoginForm";
import "flowbite"; // Import Flowbite JS

export default function LoginPage() {
  return (
    <BackgroundContainer>
      <LoginForm />
    </BackgroundContainer>
  );
}
