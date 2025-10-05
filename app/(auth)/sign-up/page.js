import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign up | FarmTrack",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create your FarmTrack account
        </h1>
        <p className="text-sm text-slate-500">
          Invite your team, manage livestock, and keep every record in sync.
        </p>
      </div>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary-600 hover:bg-primary-700",
          },
        }}
        afterSignUpUrl="/dashboard"
        redirectUrl="/dashboard"
      />
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
