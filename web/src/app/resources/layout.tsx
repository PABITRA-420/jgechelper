import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resources | JGECHelper",
    description: "Browse question papers, notes, routines and study materials for all engineering branches at JGEC.",
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
