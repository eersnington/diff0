export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 font-bold text-4xl">Privacy Policy</h1>
      <p className="mb-8 text-muted-foreground">
        Last updated: October 1, 2025
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">1. Introduction</h2>
          <p>
            ObbyLabs ("we", "us", or "our") operates diff0, an AI-powered code review service. 
            This Privacy Policy explains how we collect, use, and protect your personal information when you use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">2. Information We Collect</h2>
          
          <h3 className="mb-3 font-semibold text-xl">2.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Name and email address (from GitHub OAuth)</li>
            <li>GitHub profile information (username, avatar)</li>
            <li>Account preferences and settings</li>
          </ul>

          <h3 className="mt-6 mb-3 font-semibold text-xl">2.2 GitHub Integration Data</h3>
          <p>When you connect your GitHub account, we access:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Repository information (names, descriptions)</li>
            <li>Pull request data (code changes, comments, metadata)</li>
            <li>Installation and permission details</li>
          </ul>

          <h3 className="mt-6 mb-3 font-semibold text-xl">2.3 Usage Data</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Credit transactions and balance information</li>
            <li>Review history and results</li>
            <li>Service usage patterns and analytics</li>
            <li>Technical data (IP address, browser type, device information)</li>
          </ul>

          <h3 className="mt-6 mb-3 font-semibold text-xl">2.4 Code Data</h3>
          <p>
            We process your code temporarily to perform AI reviews. Code is not stored permanently 
            after review completion unless required for troubleshooting specific issues.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">3. How We Use Your Information</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>To provide and maintain the AI code review service</li>
            <li>To process payments and manage your credit balance</li>
            <li>To send service-related notifications and updates</li>
            <li>To improve our AI models and service quality</li>
            <li>To detect and prevent abuse or fraud</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">4. Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard practices:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Secure database storage with access controls</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to authorized personnel only</li>
          </ul>
          <p className="mt-4">
            While we implement reasonable security measures, no method of transmission over the internet 
            or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">5. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., Convex for database, Polar for payments, OpenAI for AI processing)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">6. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>GitHub:</strong> For authentication and repository access</li>
            <li><strong>Convex:</strong> For database and backend services</li>
            <li><strong>Dodopayments:</strong> For payment processing</li>
            <li><strong>OpenAI:</strong> For AI code analysis</li>
          </ul>
          <p className="mt-4">
            Each service has its own privacy policy. We encourage you to review their policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Withdraw consent for data processing</li>
            <li>Object to certain processing activities</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us at <a className="text-primary hover:underline" href="mailto:legal@obby.dev">legal@obby.dev</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">8. Data Retention</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Account data is retained while your account is active</li>
            <li>Transaction records are kept for legal and accounting purposes</li>
            <li>Code data is processed temporarily and deleted after review completion</li>
            <li>Analytics data may be retained in anonymized form</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">9. Cookies and Tracking</h2>
          <p>
            We use essential cookies for authentication and session management. 
            We may use analytics tools to understand how users interact with our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">10. Children's Privacy</h2>
          <p>
            Our Service is not intended for users under 13 years of age. 
            We do not knowingly collect information from children under 13.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">11. International Data Transfers</h2>
          <p>
            We operate from the United Arab Emirates. Your data may be transferred to and processed in 
            countries other than your own. We ensure appropriate safeguards are in place for such transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes 
            via email or through the Service. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">13. Open Source</h2>
          <p>
            diff0 is open source software under the MIT License. You can review our code on{" "}
            <a className="text-primary hover:underline" href="https://github.com/eersnington/diff0" rel="noopener noreferrer" target="_blank">GitHub</a> 
            to understand how we handle your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">14. Contact Us</h2>
          <p>
            For privacy-related questions or concerns:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Email: <a className="text-primary hover:underline" href="mailto:legal@obby.dev">legal@obby.dev</a> (legal matters)</li>
            <li>Email: <a className="text-primary hover:underline" href="mailto:hi@obby.dev">hi@obby.dev</a> (general inquiries)</li>
            <li>GitHub: <a className="text-primary hover:underline" href="https://github.com/eersnington/diff0/issues" rel="noopener noreferrer" target="_blank">File an issue</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}