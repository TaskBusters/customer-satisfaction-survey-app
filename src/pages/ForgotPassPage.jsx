import { Link } from "react-router-dom";
import "flowbite"; // Import Flowbite JS
import BackgroundContainer from "../components/BackgroundContainer";
import ForgotPassForm from "../components/ForgotPassForm.jsx";

export default function ForgotPassPage() {
  return (
    <BackgroundContainer>
      <ForgotPassForm />
    </BackgroundContainer>
  );
}
