import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import { IndexRouteListener, LandingPage } from "@/app/_components";

export default async function Home() {
  return (
    <>
      {/*<Meta {...metaProps} />*/}
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      <IndexRouteListener />
      <LandingPage />
    </>
  );
}
