import {
  Body,
  Button,
  Container,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3001";

export default function WelcomeEmail() {
  return (
    <Html>
      <Preview>Welcome to diff0 — Your AI Code Review Companion</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans">
          <Container className="mx-auto my-[40px] max-w-[600px] border-transparent">
            <Img alt="logo" height={100} src="/logo.png" width={100} />
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal">
              Welcome to diff0
            </Heading>
            <Section className="mb-4">
              {" "}
              Hi there, I'm Sree, the founder of diff0.
            </Section>
            <Section className="mb-4">
              diff0 is an open-source AI code review agent inspired by Vercel's
              AI review tools. It reads your pull requests, highlights issues,
              and gives suggestions so you can ship code confidently — faster.
            </Section>
            <Section className="mb-4">
              This is just the beginning. I&apos;d love to hear your thoughts,
              feedback, or wild ideas. Seriously, reach out anytime. I
              personally read every message.
            </Section>
            <Section className="mb-6">
              <Link href={baseUrl}>
                <Button className="bg-black p-4 text-center text-white">
                  Get started
                </Button>
              </Link>
            </Section>
            <Hr />
            <Section className="mt-4 text-center text-gray-500 text-sm">
              Ping me at <Link href="mailto:hi@eers.dev">hi@eers.dev</Link> or
              send a message on{" "}
              <Link href="https://x.com/eersnington">@eersnington</Link>.
              I&apos;ll get back to you personally.
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
