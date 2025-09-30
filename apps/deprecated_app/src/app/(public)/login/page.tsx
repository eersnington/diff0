import Image from "next/image";
import { GitHubSignIn } from "@/components/github-signin";

export const metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex size-96 flex-col items-center justify-center">
        <Image alt="logo" height={350} src="/logo.png" width={350} />
        <GitHubSignIn />
      </div>
    </div>
  );
}
