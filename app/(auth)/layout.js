export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
        {children}
      </div>
    </div>
  );
}
