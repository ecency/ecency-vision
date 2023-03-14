import React from "react";
import loadable from "@loadable/component";
import "./index.scss";

const AboutContainer = loadable(() => import("./about"));
const ContributeContainer = loadable(() => import("./contribute"));
const ContributorsContainer = loadable(() => import("./contributors"));
const FaqContainer = loadable(() => import("./faq"));
const GuestPostContainer = loadable(() => import("./guest-post"));
const PrivacyContainer = loadable(() => import("./privacy"));
const TosContainer = loadable(() => import("./tos"));
const WhitePaperContainer = loadable(() => import("./white-paper"));

export const AboutPage = (props: any) => <AboutContainer {...props} />;
export const ContributePage = (props: any) => <ContributeContainer {...props} />;
export const ContributorsPage = (props: any) => <ContributorsContainer {...props} />;
export const FaqPage = (props: any) => <FaqContainer {...props} />;
export const GuestPostPage = (props: any) => <GuestPostContainer {...props} />;
export const PrivacyPage = (props: any) => <PrivacyContainer {...props} />;
export const TosPage = (props: any) => <TosContainer {...props} />;
export const WhitePaperPage = (props: any) => <WhitePaperContainer {...props} />;
