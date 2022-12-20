import React from "react";
import loadable from "@loadable/component";

export const AboutContainer = loadable(() => import("./about"));
export const ContributeContainer = loadable(() => import("./contribute"));
export const ContributorsContainer = loadable(() => import("./contributors"));
export const FaqContainer = loadable(() => import("./faq"));
export const GuestPostContainer = loadable(() => import("./guest-post"));
export const PrivacyContainer = loadable(() => import("./privacy"));
export const TosContainer = loadable(() => import("./tos"));
export const WhitePaperContainer = loadable(() => import("./white-paper"));

export const AboutPage = (props: any) => <AboutContainer {...props} />;
export const ContributePage = (props: any) => <ContributeContainer {...props} />;
export const ContributorsPage = (props: any) => <ContributorsContainer {...props} />;
export const FaqPage = (props: any) => <FaqContainer {...props} />;
export const GuestPostPage = (props: any) => <GuestPostContainer {...props} />;
export const PrivacyPage = (props: any) => <PrivacyContainer {...props} />;
export const TosPage = (props: any) => <TosContainer {...props} />;
export const WhitePaperPage = (props: any) => <WhitePaperContainer {...props} />;
