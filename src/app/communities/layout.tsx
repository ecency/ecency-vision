import { PropsWithChildren } from "react";
import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import { InputSkeletonLoader } from "@ui/input";

export default function Layout(props: PropsWithChildren) {
  return (
    <>
      <ScrollToTop />
      <Theme />
      <Navbar />
      <InputSkeletonLoader />
      {props.children}
    </>
  );
}
