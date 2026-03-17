import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AIReady',
  description: 'Privacy Policy for AIReady platform',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-blue w-96 h-96 -top-48 -right-48" />
        <div className="orb orb-purple w-80 h-80 bottom-0 -left-40" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8 gradient-text">
          Privacy Policy
        </h1>
        <p className="text-slate-400 mb-4">Last updated: February 2026</p>

        <div className="glass-card rounded-2xl p-8 space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-2">
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Account information: GitHub username, email, and profile data
                when you sign in
              </li>
              <li>
                Repository data: URLs and analysis results for repositories you
                track
              </li>
              <li>Usage data: How you interact with our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your requests and transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Information Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share your
              information in the following situations:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>With your consent</li>
              <li>
                With service providers who assist in operating our platform
              </li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and the safety of users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized or unlawful
              processing, accidental loss, destruction, or damage. However, no
              method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as your account is
              active or as needed to provide you services. You can request
              deletion of your account and associated data at any time by
              contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Cookies and Tracking
            </h2>
            <p>
              We use essential cookies to authenticate users and maintain
              session state. We do not use tracking cookies or third-party
              analytics services that sell your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Third-Party Services
            </h2>
            <p>
              Our service uses GitHub for authentication. Your use of GitHub is
              subject to GitHub's Privacy Policy. We only access basic profile
              information necessary for authentication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Children's Privacy
            </h2>
            <p>
              Our service is not directed to children under 13. We do not
              knowingly collect personal information from children under 13. If
              we become aware that we have collected personal information from a
              child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              11. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{' '}
              <a
                href="mailto:team@getaiready.dev"
                className="text-cyan-400 hover:text-cyan-300"
              >
                team@getaiready.dev
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <a
            href="/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Home
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="/terms"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Terms of Service →
          </a>
        </div>
      </div>
    </main>
  );
}
