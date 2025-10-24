export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 font-bold text-4xl">Terms of Service</h1>
      <p className="mb-8 text-muted-foreground">
        Last updated: October 1, 2025
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">1. Introduction</h2>
          <p>
            Welcome to diff0 (the "Service"), an AI-powered code review platform
            operated by ObbyLabs ("we", "us", or "our"). By accessing or using
            our Service, you agree to be bound by these Terms of Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">
            2. Service Description
          </h2>
          <p>
            diff0 provides automated code review services for GitHub pull
            requests using artificial intelligence. The Service operates on a
            credit-based system where users purchase credits to run AI reviews
            on their code.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">3. Credit System</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Credits are purchased on a pay-as-you-go basis with no recurring
              subscriptions
            </li>
            <li>Credits expire within 1 year from the date of purchase</li>
            <li>Credits are non-refundable except as required by law</li>
            <li>
              Credit packages and pricing may change at any time with notice to
              active users
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">
            4. User Responsibilities
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              You must provide accurate information when creating an account
            </li>
            <li>
              You are responsible for maintaining the security of your account
            </li>
            <li>
              You must not use the Service for any illegal or unauthorized
              purpose
            </li>
            <li>
              You must not abuse, harass, or exploit the Service or other users
            </li>
            <li>
              You must not attempt to reverse engineer or circumvent the Service
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">5. Prohibited Conduct</h2>
          <p>
            Any form of abuse will not be tolerated. This includes but is not
            limited to:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Attempting to exploit vulnerabilities in the Service</li>
            <li>Using the Service to process malicious code</li>
            <li>
              Excessive or automated use that impacts Service availability
            </li>
            <li>Violating any applicable laws or regulations</li>
          </ul>
          <p className="mt-4">
            We reserve the right to suspend or terminate accounts that violate
            these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">6. GitHub Integration</h2>
          <p>
            Our Service integrates with GitHub. By using our Service, you also
            agree to comply with GitHub's Terms of Service. We are not
            responsible for any issues arising from GitHub's services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">7. Open Source</h2>
          <p>
            diff0 is open source software licensed under the MIT License. The
            source code is available on GitHub. While the software is open
            source, the Service itself and associated infrastructure are
            proprietary.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">
            8. Limitation of Liability
          </h2>
          <p>
            The Service is provided "as is" without warranties of any kind. We
            are not liable for any damages arising from your use of the Service,
            including but not limited to code quality issues, security
            vulnerabilities, or business losses.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of the United Arab Emirates, without regard to its conflict
            of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will
            notify users of any material changes via email or through the
            Service. Continued use of the Service after changes constitutes
            acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-semibold text-2xl">11. Contact</h2>
          <p>
            If you have any questions about these Terms or need to report
            issues:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Email us at{" "}
              <a
                className="text-primary hover:underline"
                href="mailto:legal@obby.dev"
              >
                legal@obby.dev
              </a>{" "}
              for legal matters
            </li>
            <li>
              Email us at{" "}
              <a
                className="text-primary hover:underline"
                href="mailto:hi@obby.dev"
              >
                hi@obby.dev
              </a>{" "}
              for general inquiries
            </li>
            <li>
              File an issue on our{" "}
              <a
                className="text-primary hover:underline"
                href="https://github.com/eersnington/diff0"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub repository
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
