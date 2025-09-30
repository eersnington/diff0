import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full bg-card">
      <div className="-translate-x-1/2 absolute top-8 left-1/2 mx-auto transform justify-center">
        <Image alt="logo" height={100} src="/logo.svg" width={100} />
      </div>
      <div className="z-10 h-screen w-screen">{children}</div>
      <div className="base-grid fixed h-screen w-screen opacity-40" />
      <div className="fixed bottom-0 h-screen w-screen bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
    </div>
  );
}
