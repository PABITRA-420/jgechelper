import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About | JGECHelper",
    description: "Learn about JGECHelper, our privacy policy, terms of use, and how to get in touch. Built by students, for students.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
