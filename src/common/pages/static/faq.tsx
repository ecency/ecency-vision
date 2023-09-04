import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import { removeDiacritics } from "../../store/diacritics";
import { _t, langOptions } from "../../i18n";
import i18n from "i18next";
import * as ls from "../../util/local-storage";
import Feedback, { success } from "../../components/feedback";
import clipboard from "../../util/clipboard";
import { apiBase } from "../../api/helper";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBarElectron from "../../../desktop/app/components/navbar";
import { Button, Form } from "react-bootstrap";
import { copyContent } from "../../img/svg";
import { Link } from "react-router-dom";
import { Tsx } from "../../i18n/helper";
import { faqKeysGeneral } from "../../constants";
import NavBar from "../../components/navbar";
import FaqCategory from "../../components/faq-category";
import { connect } from "react-redux";
import { FormControl, InputGroup } from "@ui/input";

interface FAQPageState {
  search: string;
  currentLanguage: string;
}

class FaqPage extends Component<PageProps, FAQPageState> {
  constructor(props: PageProps) {
    super(props);
    let searchFromUrl: any = props.location.search.split("&lang=")[0].replace("?q=", "");
    searchFromUrl = removeDiacritics(searchFromUrl);
    const languageFromUrl = props.location.search.split("&lang=")[1];
    const languageFromList = langOptions.find(
      (item) => item.code.split("-")[0] === languageFromUrl
    );

    if (languageFromList) {
      props.setLang(languageFromList.code);
      i18n.changeLanguage(languageFromList.code);
    }
    this.state = {
      search: searchFromUrl || "",
      currentLanguage: props.global.lang
    };

    if (languageFromList && props.global.lang !== languageFromList.code) {
      ls.set("current-language", props.global.lang);
    }
  }

  componentWillUnmount() {
    const currentLang = ls.get("current-language");
    this.props.setLang(currentLang);
    i18n.changeLanguage(currentLang);
  }

  copyToClipboard = (text: string) => {
    success(_t("static.faq.search-link-copied"));
    clipboard(text);
  };

  render() {
    const { search } = this.state;
    //  Meta config
    const metaProps = {
      title: _t("static.faq.page-title")
    };

    const { global } = this.props;
    const imgs = apiBase(`/assets/ecency-faq.${this.props.global.canUseWebp ? "webp" : "jpg"}`);
    let containerClasses = global.isElectron ? " mt-0 pt-6" : "";
    let faqKeys = [...faqKeysGeneral];
    let searchResult: string[] = [];
    if (search && search.length > 0) {
      faqKeys.map((x) => {
        let isSearchValid = _t(`static.faq.${x}-body`)
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase());
        if (isSearchValid) {
          searchResult.push(x);
        }
      });
    }
    let dataToShow = search.length > 0 && searchResult.length > 0 ? searchResult : faqKeys;

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Feedback activeUser={this.props.activeUser} />
        <Theme global={this.props.global} />
        {global.isElectron ? (
          NavBarElectron({
            ...this.props
          })
        ) : (
          <NavBar history={this.props.history} />
        )}

        <div
          className={"app-content static-page faq-page" + containerClasses}
          itemScope={true}
          itemType="https://schema.org/FAQPage"
        >
          <div className="static-content">
            <div className="position-relative rounded" style={{ marginBottom: "8%" }}>
              <img src={imgs} className="rounded" />
              <div className="position-absolute search-container d-flex justify-content-center align-items-center flex-column rounded p-3">
                <h1 className="text-white faq-title text-center mb-3">
                  {_t("static.faq.page-title")}
                </h1>
                <InputGroup
                  append={
                    <Button
                      variant="primary"
                      size="sm"
                      className="copy-to-clipboard"
                      disabled={search.length === 0}
                      onClick={() => {
                        this.copyToClipboard(
                          `https://ecency.com/faq?q=${search}&lang=${global.lang.split("-")[0]}`
                        );
                      }}
                    >
                      {copyContent}
                    </Button>
                  }
                  className="mb-3 w-75"
                >
                  <FormControl
                    type="text"
                    placeholder={`${_t("static.faq.search-placeholder")}`}
                    className="w-75"
                    onChange={(e) => {
                      this.setState({ search: e.target.value });
                    }}
                    value={search}
                    autoFocus={true}
                  />
                </InputGroup>
                {search.length > 0 && (
                  <Form.Text className="text-white mt-2 mt-sm-3 w-75 text-center helper-text">
                    {searchResult.length > 0 ? (
                      _t("static.faq.search", { search: `"${search}"` })
                    ) : (
                      <div className="text-not-found">
                        {_t("static.faq.search-not-found")}
                        <Link to="https://discord.me/ecency" target="_blank">
                          Discord
                        </Link>
                        .
                      </div>
                    )}
                  </Form.Text>
                )}
              </div>
            </div>

            {search ? (
              <>
                <h3>{_t("static.faq.page-sub-title")}</h3>
                <ul className="table-contents">
                  {dataToShow.map((x) => {
                    return (
                      <li key={x}>
                        <a href={`#${x}`}>{_t(`static.faq.${x}-header`)}</a>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="category-cards">
                <FaqCategory
                  categoryTitle={_t(`static.faq.about-ecency`)}
                  contentList={dataToShow.slice(0, 5)}
                />
                <FaqCategory
                  categoryTitle={_t(`static.faq.working`)}
                  contentList={dataToShow.slice(5, 10)}
                />
                <FaqCategory
                  categoryTitle={_t(`static.faq.about-blockchain`)}
                  contentList={dataToShow.slice(10, 15)}
                />
                <FaqCategory
                  categoryTitle={_t(`static.faq.features`)}
                  contentList={dataToShow.slice(15, 34)}
                />
              </div>
            )}

            <div className="faq-list">
              {dataToShow.map((x) => {
                return (
                  <div
                    key={x}
                    className="faq-item"
                    itemScope={true}
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <span className="anchor" id={x} />
                    <h4 className="faq-item-header" itemProp="name">
                      {_t(`static.faq.${x}-header`)}
                    </h4>
                    <div
                      itemScope={true}
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                      id="content"
                    >
                      <Tsx k={`static.faq.${x}-body`}>
                        <div className="faq-item-body" itemProp="text" />
                      </Tsx>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default connect(pageMapStateToProps, pageMapDispatchToProps)(FaqPage);
