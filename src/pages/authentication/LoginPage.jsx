import BackgroundContainer from "../../components/authentication/BackgroundContainer";
import LoginForm from "../../components/authentication/LoginForm";
import "flowbite"; // Import Flowbite JS

export default function LoginPage() {
  return (
    <>
      <BackgroundContainer>
        <LoginForm />
      </BackgroundContainer>
    </>
  );
}
