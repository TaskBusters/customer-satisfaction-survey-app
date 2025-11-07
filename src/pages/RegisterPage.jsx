import React from "react"; // core React import
import RegisterForm from "../components/authentication/RegisterForm";
import BackgroundContainer from "../components/authentication/BackgroundContainer";

export default function RegisterPage() {
  return (
    <BackgroundContainer>
      <RegisterForm />
    </BackgroundContainer>
  );
}
