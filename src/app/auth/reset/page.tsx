import { redirect } from "next/navigation";

export default function AuthResetRedirectPage() {
  redirect("/forgot-password");
}
