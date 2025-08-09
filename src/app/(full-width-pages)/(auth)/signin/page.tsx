import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROOM 8 ADMIN",
 };


export default function SignIn() {
  return <SignInForm />;
}
