import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guest Posts"
};

export default function GuestPostPage() {
  return (
    <>
      <ScrollToTop />
      <Theme />
      <Navbar />

      <div className="app-content static-page guest-post-page">
        <iframe
          title="Esteem contribution form"
          src="https://docs.google.com/forms/d/e/1FAIpQLSf3Pt8DQ79edkQK7XHrlIZkZYcueJvgJso6OXz2pgGCplLbaA/viewform?embedded=true"
          width="640"
          height="956"
          frameBorder={0}
          marginHeight={0}
          marginWidth={0}
        >
          Loading…
        </iframe>
      </div>
    </>
  );
}
