import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign in | FarmTrack",
};

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">
          Sign in to manage herd records, inventory, and finances.
        </p>
      </div>
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary-600 hover:bg-primary-700",
          },
        }}
        afterSignInUrl="/dashboard"
        redirectUrl="/dashboard"
      />
      <p className="text-center text-sm text-slate-500">
        New to FarmTrack?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
