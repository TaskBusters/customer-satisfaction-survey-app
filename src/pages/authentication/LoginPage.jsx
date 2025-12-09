import BackgroundContainer from "../../components/authentication/BackgroundContainer";
import LoginForm from "../../components/authentication/LoginForm";
import "flowbite"; // Import Flowbite JS
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useLocation } from "react-router-dom";

const GOOGLE_CLIENT_ID =
  "60929193374-3paeve0ig0pqcenie8gdsh6k1b53hj91.apps.googleusercontent.com";

export default function LoginPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const noGoogle = params.get("noGoogle") === "1";

  // If redirected from a protected route, avoid initializing the Google provider
  // to prevent any automatic OAuth behavior. The Google button will still
  // be available if the page is loaded directly without the `noGoogle` flag.
  if (noGoogle) {
    return (
      <BackgroundContainer>
        <LoginForm />
      </BackgroundContainer>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BackgroundContainer>
        <LoginForm />
      </BackgroundContainer>
    </GoogleOAuthProvider>
  );
}
