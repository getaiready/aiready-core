import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">AIReady</h3>
            <p className="text-slate-400 max-w-sm">
              Making codebases AI-ready through automated analysis and
              optimization. Open source and free for developers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  href="/docs"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/caopengau/aiready-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="https://platform.getaiready.dev/metrics"
                  className="hover:text-cyan-400 transition-colors"
                >
                  AI Readiness Metrics
                </a>
              </li>
              <li>
                <a
                  href="https://platform.getaiready.dev/login"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Sign In
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-900 text-center text-sm text-slate-500">
          AIReady © {year}. Released under the{' '}
          <a
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white underline underline-offset-4"
          >
            MIT License
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
