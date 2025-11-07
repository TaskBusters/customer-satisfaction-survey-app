import { Link } from "react-router-dom";
import "flowbite"; // Import Flowbite JS
import BackgroundContainer from "../../components/authentication/BackgroundContainer.jsx";
import ForgotPassForm from "../../components/authentication/ForgotPassForm.jsx";

export default function ForgotPassPage() {
  return (
    <>
      <BackgroundContainer>
        <ForgotPassForm />
      </BackgroundContainer>
    </>
  );
}
