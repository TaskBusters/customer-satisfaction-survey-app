import BackgroundContainer from "../../components/authentication/BackgroundContainer"
import LoginForm from "../../components/authentication/LoginForm"
import "flowbite" // Import Flowbite JS
import { GoogleOAuthProvider } from "@react-oauth/google"

const GOOGLE_CLIENT_ID = "60929193374-3paeve0ig0pqcenie8gdsh6k1b53hj91.apps.googleusercontent.com"

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BackgroundContainer>
        <LoginForm />
      </BackgroundContainer>
    </GoogleOAuthProvider>
  )
}
