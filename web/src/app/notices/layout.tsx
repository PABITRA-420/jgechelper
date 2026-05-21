import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Notice Board | JGECHelper",
    description: "Stay updated with the latest official announcements, exam schedules, holidays, and urgent notices from JGEC.",
};

export default function NoticesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
