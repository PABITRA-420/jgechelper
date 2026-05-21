import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Account | JGECHelper",
    description: "Register for JGECHelper to access free academic resources, question papers, and campus notices for JGEC engineering students.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
