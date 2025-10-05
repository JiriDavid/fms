export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} FarmTrack. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="link" href="mailto:support@farmtrack.app">
            Support
          </a>
          <a
            className="link"
            href="https://clerk.com/docs/nextjs"
            target="_blank"
            rel="noreferrer"
          >
            Clerk docs
          </a>
        </div>
      </div>
    </footer>
  );
}
