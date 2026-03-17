import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | AIReady',
  description: 'Terms of Service for AIReady - making your codebase AI-ready',
};

export default function TermsPage() {
  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-300">
      <Header />

      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          Terms of Service
        </h1>
        <p className="text-slate-400 mb-12">Last updated: March 17, 2026</p>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using AIReady ("the Service"), including our
              website (getaiready.dev), platform, and CLI tools, you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Description of Service
            </h2>
            <p>
              AIReady provides tools for analyzing software repositories to
              assess and improve their readiness for AI collaboration. This
              includes but is not limited to CLI tools, interactive reports, and
              metrics dashboards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. User Accounts and Content
            </h2>
            <p className="mb-4">
              When you create an account or submit data (such as repository
              URLs) to our Service:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                You are responsible for maintaining the security of your
                account.
              </li>
              <li>
                You represent that you have the right to submit the repository
                data for analysis.
              </li>
              <li>
                You retain ownership of your code. AIReady only processes the
                metadata and analysis results required to provide the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Acceptable Use
            </h2>
            <p className="mb-4">You agree not to use the Service:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                For any unlawful purpose or to solicit others to perform
                unlawful acts.
              </li>
              <li>
                To transmit any malicious code, viruses, or harmful content.
              </li>
              <li>
                To interfere with the security features or operation of the
                Service.
              </li>
              <li>
                To attempt to gain unauthorized access to our infrastructure or
                other user accounts.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Intellectual Property
            </h2>
            <p>
              The AIReady brand, website design, and original analysis
              algorithms are protected by copyright and trademark laws. Our CLI
              tools are released under the MIT License, allowing for broad use
              as specified in the license agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Limitation of Liability
            </h2>
            <p>
              AIReady is provided "as is" without any warranties. In no event
              shall AIReady, its developers, or affiliates be liable for any
              damages arising out of the use or inability to use the Service,
              even if advised of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify users of significant changes by updating the date at the
              top of this page. Your continued use of the Service after changes
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:{' '}
              <a
                href="mailto:team@getaiready.dev"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                team@getaiready.dev
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-900 flex gap-6">
          <Link
            href="/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            ← Back to Home
          </Link>
          <Link
            href="/privacy"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Privacy Policy →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
