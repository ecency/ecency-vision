import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import { FullHeight } from "@/features/ui";
import { PropsWithChildren } from "react";

export default function Layout(props: PropsWithChildren) {
  return (
    <>
      <ScrollToTop />
      <FullHeight />
      <Theme />
      <Navbar />
      {props.children}
    </>
  );
}
