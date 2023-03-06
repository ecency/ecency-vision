import React, { Component } from "react";

import { Modal, Form, Row, Col, InputGroup, FormControl, Button } from "react-bootstrap";

import { Global } from "../../store/global/types";
import { Community } from "../../store/communities/types";
import { ActiveUser } from "../../store/active-user/types";

import { clone } from "../../store/util";
import cleanString from "../../util/clean-string";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import { error } from "../feedback";

import { updateCommunity, formatError } from "../../api/operations";

import { _t } from "../../i18n";
import { handleInvalid, handleOnInput } from "../../util/input-util";
import "./_index.scss";

const langOpts = [
  { id: "af", name: "Afrikaans" },
  { id: "sq", name: "Albanian" },
  { id: "am", name: "Amharic" },
  { id: "ar", name: "Arabic" },
  { id: "hy", name: "Armenian" },
  { id: "az", name: "Azerbaijani" },
  { id: "eu", name: "Basque" },
  { id: "be", name: "Belarusian" },
  { id: "bn", name: "Bengali" },
  { id: "bs", name: "Bosnian" },
  { id: "bg", name: "Bulgarian" },
  { id: "my", name: "Burmese" },
  { id: "ca", name: "Catalan" },
  { id: "ny", name: "Chewa" },
  { id: "zh", name: "Chinese" },
  { id: "co", name: "Corsican" },
  { id: "hr", name: "Croatian" },
  { id: "cs", name: "Czech" },
  { id: "da", name: "Danish" },
  { id: "nl", name: "Dutch" },
  { id: "en", name: "English" },
  { id: "eo", name: "Esperanto" },
  { id: "et", name: "Estonian" },
  { id: "fi", name: "Finnish" },
  { id: "fr", name: "French" },
  { id: "gl", name: "Galician" },
  { id: "ka", name: "Georgian" },
  { id: "de", name: "German" },
  { id: "el", name: "Greek" },
  { id: "gu", name: "Gujarati" },
  { id: "ht", name: "Haitian Creole" },
  { id: "ha", name: "Hausa" },
  { id: "he", name: "Hebrew" },
  { id: "hi", name: "Hindi" },
  { id: "hu", name: "Hungarian" },
  { id: "is", name: "Icelandic" },
  { id: "ig", name: "Igbo" },
  { id: "id", name: "Indonesian" },
  { id: "ga", name: "Irish" },
  { id: "it", name: "Italian" },
  { id: "ja", name: "Japanese" },
  { id: "jv", name: "Javanese" },
  { id: "kn", name: "Kannada" },
  { id: "kk", name: "Kazakh" },
  { id: "rw", name: "Kinyarwanda" },
  { id: "ko", name: "Korean" },
  { id: "ku", name: "Kurdish" },
  { id: "ky", name: "Kyrgyz" },
  { id: "lo", name: "Lao" },
  { id: "la", name: "Latin" },
  { id: "lv", name: "Latvian" },
  { id: "lt", name: "Lithuanian" },
  { id: "lb", name: "Luxembourgish" },
  { id: "mk", name: "Macedonian" },
  { id: "mg", name: "Malagasy" },
  { id: "ms", name: "Malay" },
  { id: "ml", name: "Malayalam" },
  { id: "mt", name: "Maltese" },
  { id: "mi", name: "Maori" },
  { id: "mr", name: "Marathi" },
  { id: "mn", name: "Mongolian" },
  { id: "ne", name: "Nepali" },
  { id: "nb", name: "Norwegian (Bokmål)" },
  { id: "ps", name: "Pashto" },
  { id: "fa", name: "Persian" },
  { id: "pl", name: "Polish" },
  { id: "pt", name: "Portuguese" },
  { id: "pa", name: "Punjabi (Gurmukhi)" },
  { id: "ro", name: "Romanian" },
  { id: "ru", name: "Russian" },
  { id: "sm", name: "Samoan" },
  { id: "sr", name: "Serbian" },
  { id: "sn", name: "Shona" },
  { id: "sd", name: "Sindhi" },
  { id: "si", name: "Sinhala" },
  { id: "sk", name: "Slovak" },
  { id: "sl", name: "Slovenian" },
  { id: "so", name: "Somali" },
  { id: "es", name: "Spanish" },
  { id: "su", name: "Sundanese" },
  { id: "sw", name: "Swahili" },
  { id: "sv", name: "Swedish" },
  { id: "tg", name: "Tajik" },
  { id: "ta", name: "Tamil" },
  { id: "tt", name: "Tatar" },
  { id: "te", name: "Telugu" },
  { id: "th", name: "Thai" },
  { id: "tr", name: "Turkish" },
  { id: "tk", name: "Turkmen" },
  { id: "uk", name: "Ukrainian" },
  { id: "ur", name: "Urdu" },
  { id: "ug", name: "Uyghur" },
  { id: "uz", name: "Uzbek" },
  { id: "vi", name: "Vietnamese" },
  { id: "cy", name: "Welsh" },
  { id: "xh", name: "Xhosa" },
  { id: "yi", name: "Yiddish" },
  { id: "yo", name: "Yoruba" },
  { id: "zu", name: "Zulu" }
];

interface Props {
  global: Global;
  community: Community;
  activeUser: ActiveUser;
  addCommunity: (data: Community) => void;
  onHide: () => void;
}

interface State {
  title: string;
  about: string;
  lang: string;
  description: string;
  flag_text: string;
  is_nsfw: boolean;
  inProgress: boolean;
}

const pureState = (props: Props): State => {
  const { community: c } = props;

  return {
    title: cleanString(c.title),
    about: cleanString(c.about),
    lang: c.lang || "en",
    description: cleanString(c.description),
    flag_text: cleanString(c.flag_text),
    is_nsfw: c.is_nsfw,
    inProgress: false
  };
};

export class CommunitySettings extends BaseComponent<Props, State> {
  state: State = pureState(this.props);

  form = React.createRef<HTMLFormElement>();

  onChange = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { target: el } = e;
    const key = el.name;
    const val = el.hasOwnProperty("checked") ? el.checked : el.value;

    // @ts-ignore
    this.stateSet({ [key]: val });
  };

  submit = () => {
    const { activeUser, community, addCommunity, onHide } = this.props;
    const { title, about, description, lang, flag_text, is_nsfw } = this.state;
    const newProps = {
      title: cleanString(title),
      about: cleanString(about),
      description: cleanString(description),
      lang,
      flag_text: cleanString(flag_text),
      is_nsfw
    };

    this.stateSet({ inProgress: true });
    return updateCommunity(activeUser.username, community.name, newProps)
      .then(() => {
        const nCom: Community = { ...clone(community), ...newProps };
        addCommunity(nCom);
        onHide();
      })
      .catch((err) => error(...formatError(err)))
      .finally(() => this.stateSet({ inProgress: false }));
  };

  render() {
    const { title, about, lang, description, flag_text, is_nsfw, inProgress } = this.state;

    return (
      <div className="community-settings-dialog-content">
        {inProgress && <LinearProgress />}

        <Form
          ref={this.form}
          className={`settings-form ${inProgress ? "in-progress" : ""}`}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.form.current?.checkValidity()) {
              return;
            }

            this.submit().then();
          }}
        >
          <Form.Group as={Row}>
            <Form.Label column={true} sm="2">
              {_t("community-settings.title")}
            </Form.Label>
            <Col sm="10">
              <InputGroup>
                <Form.Control
                  type="text"
                  autoComplete="off"
                  value={title}
                  name="title"
                  onChange={this.onChange}
                  required={true}
                  onInvalid={(e: any) =>
                    handleInvalid(e, "community-settings.", "validation-title")
                  }
                  onInput={handleOnInput}
                />
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column={true} sm="2">
              {_t("community-settings.about")}
            </Form.Label>
            <Col sm="10">
              <InputGroup>
                <Form.Control
                  type="text"
                  autoComplete="off"
                  value={about}
                  name="about"
                  onChange={this.onChange}
                />
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column={true} sm="2">
              {_t("community-settings.lang")}
            </Form.Label>
            <Col sm="4">
              <InputGroup>
                <Form.Control as={"select"} value={lang} name="lang" onChange={this.onChange}>
                  {langOpts.map((l, k) => (
                    <option key={k} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Form.Control>
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column={true} sm="2">
              {_t("community-settings.description")}
            </Form.Label>
            <Col sm="10">
              <InputGroup>
                <Form.Control
                  as="textarea"
                  value={description}
                  name="description"
                  onChange={this.onChange}
                />
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column={true} sm="2">
              {_t("community-settings.rules")}
            </Form.Label>
            <Col sm="10">
              <InputGroup>
                <Form.Control
                  as="textarea"
                  value={flag_text}
                  name="flag_text"
                  onChange={this.onChange}
                />
              </InputGroup>
              <Form.Text>{_t("community-settings.rules-help")}</Form.Text>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Col sm={{ span: 10, offset: 2 }}>
              <Form.Check
                id="check-nsfw"
                type="checkbox"
                label="NSFW"
                name="is_nsfw"
                checked={is_nsfw}
                onChange={this.onChange}
              />
            </Col>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button type="submit" disabled={inProgress}>
              {_t("g.save")}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default class CommunitySettingsDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        keyboard={false}
        className="community-settings-dialog"
        size="lg"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{_t("community-settings.dialog-title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CommunitySettings {...this.props} />
        </Modal.Body>
      </Modal>
    );
  }
}
