import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | AIReady',
  description: 'Privacy Policy for AIReady - making your codebase AI-ready',
};

export default function PrivacyPage() {
  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-300">
      <Header />

      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          Privacy Policy
        </h1>
        <p className="text-slate-400 mb-12">Last updated: March 17, 2026</p>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We collect information you provide directly to us through our
              website and platform:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <span className="text-white font-medium">
                  Account information:
                </span>{' '}
                GitHub username, email, and profile data when you sign in to the
                platform.
              </li>
              <li>
                <span className="text-white font-medium">Request data:</span>{' '}
                Email addresses and repository URLs provided when requesting an
                AI-readiness report.
              </li>
              <li>
                <span className="text-white font-medium">Repository data:</span>{' '}
                URLs and analysis results for repositories you track or submit
                for analysis.
              </li>
              <li>
                <span className="text-white font-medium">Usage data:</span>{' '}
                Information about how you interact with our website and tools.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Provide, maintain, and improve our services and analysis tools.
              </li>
              <li>
                Process your requests and send transactional reports (e.g.,
                AI-readiness reports).
              </li>
              <li>
                Send you technical notices, updates, and support messages.
              </li>
              <li>Respond to your comments, questions, and feedback.</li>
              <li>
                Analyze usage patterns to improve user experience and tool
                accuracy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Information Sharing
            </h2>
            <p>
              We do not sell, rent, or trade your personal information. We may
              share your information in the following limited situations:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
              <li>With your explicit consent.</li>
              <li>
                With trusted service providers who assist in operating our
                platform (e.g., AWS for email delivery).
              </li>
              <li>
                To comply with legal obligations or respond to lawful requests.
              </li>
              <li>
                To protect our rights, privacy, safety, or property, and that of
                our users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              loss, or alteration. However, please be aware that no method of
              electronic transmission or storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to
              provide you with the services you have requested or as needed to
              comply with our legal obligations. You can request deletion of
              your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Your Rights
            </h2>
            <p className="mb-4">
              Depending on your location, you may have the following rights
              regarding your data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The right to access your personal data.</li>
              <li>The right to correct inaccurate or incomplete data.</li>
              <li>The right to request deletion of your data.</li>
              <li>
                The right to object to or restrict the processing of your data.
              </li>
              <li>The right to data portability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Cookies and Tracking
            </h2>
            <p>
              We use essential cookies for authentication and session
              management. We also use privacy-respecting analytics to understand
              website traffic. We do not use tracking cookies for advertising or
              third-party behavioral tracking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or our data
              practices, please contact our team at:{' '}
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
            href="/terms"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Terms of Service →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
