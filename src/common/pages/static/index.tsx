import React, { lazy } from "react";

const AboutContainer = lazy(() => import("./about"));
const ContributeContainer = lazy(() => import("./contribute"));
const ContributorsContainer = lazy(() => import("./contributors"));
const FaqContainer = lazy(() => import("./faq"));
const GuestPostContainer = lazy(() => import("./guest-post"));
const PrivacyContainer = lazy(() => import("./privacy"));
const TosContainer = lazy(() => import("./tos"));
const WhitePaperContainer = lazy(() => import("./white-paper"));

export const AboutPage = (props: any) => <AboutContainer {...props} />;
export const ContributePage = (props: any) => <ContributeContainer {...props} />;
export const ContributorsPage = (props: any) => <ContributorsContainer {...props} />;
export const FaqPage = (props: any) => <FaqContainer {...props} />;
export const GuestPostPage = (props: any) => <GuestPostContainer {...props} />;
export const PrivacyPage = (props: any) => <PrivacyContainer {...props} />;
export const TosPage = (props: any) => <TosContainer {...props} />;
export const WhitePaperPage = (props: any) => <WhitePaperContainer {...props} />;
