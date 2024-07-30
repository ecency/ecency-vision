import i18next from "i18next";
import { Metadata } from "next";
import { initI18next } from "@/features/i18n";

export namespace PagesMetadataGenerator {
  function buildForAbout(): Metadata {
    return {
      title: i18next.t("static.about.page-title")
    };
  }

  function buildForChats(): Metadata {
    return {
      title: i18next.t("chat.page-title")
    };
  }

  function buildForCommunities(): Metadata {
    return {
      title: i18next.t("communities.title"),
      description: i18next.t("communities.description")
    };
  }

  function buildForCommunityCreate(): Metadata {
    return {
      title: i18next.t("communities-create.page-title"),
      description: i18next.t("communities-create.description")
    };
  }

  function buildForContributors(): Metadata {
    return {
      title: i18next.t("contributors.title")
    };
  }

  function buildForDecks(): Metadata {
    return {
      title: i18next.t("decks.title")
    };
  }

  function buildForDiscover(): Metadata {
    return {
      title: i18next.t("discover.title"),
      description: i18next.t("discover.description")
    };
  }

  function buildForSubmit(): Metadata {
    return {
      title: i18next.t("submit.page-title"),
      description: i18next.t("submit.page-description")
    };
  }

  function buildForFaq(): Metadata {
    return {
      title: i18next.t("static.faq.page-title")
    };
  }

  function buildForMarket(): Metadata {
    return {
      title: i18next.t("market.title")
    };
  }

  function buildForOnboardFriend(): Metadata {
    return {
      title: "Onboarding a Friend"
    };
  }

  function buildForPerks(): Metadata {
    return {
      title: i18next.t("perks.page-title")
    };
  }

  function buildForProposals(): Metadata {
    return {
      title: i18next.t("proposals.page-title"),
      description: i18next.t("proposals.page-description")
    };
  }

  function buildForSearch(): Metadata {
    return {
      title: i18next.t("search-page.title"),
      description: i18next.t("search-page.description")
    };
  }

  function buildForSignUp(): Metadata {
    return {
      title: i18next.t("sign-up.header")
    };
  }

  function buildForWitnesses(): Metadata {
    return {
      title: i18next.t("witnesses.page-title"),
      description: i18next.t("witnesses.page-description")
    };
  }

  export async function getForPage(name: string): Promise<Metadata> {
    await initI18next();
    if (name === "about") return buildForAbout();
    if (name === "chats") return buildForChats();
    if (name === "communities") return buildForCommunities();
    if (name === "community-create") return buildForCommunityCreate();
    if (name === "contributors") return buildForContributors();
    if (name === "decks") return buildForDecks();
    if (name === "discover") return buildForDiscover();
    if (name === "draft") return buildForSubmit();
    if (name === "submit") return buildForSubmit();
    if (name === "faq") return buildForFaq();
    if (["market-swap", "market-limit", "market-advanced"].includes(name)) return buildForMarket();
    if (name === "onboard-friend") return buildForOnboardFriend();
    if (name === "perks") return buildForPerks();
    if (name === "proposals") return buildForProposals();
    if (name === "search") return buildForSearch();
    if (name === "signup") return buildForSignUp();
    if (name === "witnesses") return buildForWitnesses();
    return {};
  }
}
