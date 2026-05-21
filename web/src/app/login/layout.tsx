import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In | JGECHelper",
    description: "Sign in to JGECHelper to access study materials, question papers, and campus notices for JGEC students.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
