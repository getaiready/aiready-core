import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | AIReady',
  description: 'Terms of Service for AIReady platform',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-blue w-96 h-96 -top-48 -right-48" />
        <div className="orb orb-purple w-80 h-80 bottom-0 -left-40" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8 gradient-text">
          Terms of Service
        </h1>
        <p className="text-slate-400 mb-4">Last updated: February 2026</p>

        <div className="glass-card rounded-2xl p-8 space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using AIReady ("the Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by these terms, please do not use this
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Description of Service
            </h2>
            <p>
              AIReady provides AI readiness analysis tools and metrics for
              software repositories. The service includes code analysis, AI
              readiness scoring, and related features to help teams improve
              their codebase for AI adoption.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for any
              and all activities that occur under your account. You must notify
              us immediately upon becoming aware of any breach of security or
              unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Acceptable Use
            </h2>
            <p>You agree not to use the Service:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>For any unlawful purpose or in violation of any laws</li>
              <li>
                To transmit any malicious code, viruses, or harmful content
              </li>
              <li>To interfere with or disrupt the Service or servers</li>
              <li>
                To attempt to gain unauthorized access to any portion of the
                Service
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by AIReady and are protected by international copyright,
              trademark, and other intellectual property laws. Our trademarks
              may not be used without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Data and Privacy
            </h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. By
              using the Service, you consent to the collection and use of
              information as detailed in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Limitation of Liability
            </h2>
            <p>
              In no event shall AIReady, its directors, employees, partners,
              agents, suppliers, or affiliates, be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time.
              If a revision is material, we will try to provide at least 30 days
              notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
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
            href="/privacy"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Privacy Policy →
          </a>
        </div>
      </div>
    </main>
  );
}
