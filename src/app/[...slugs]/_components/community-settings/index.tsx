import React, { useCallback, useRef, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import i18next from "i18next";
import { LinearProgress } from "@/features/shared";
import { cleanString } from "@/utils/clean-string";
import { handleInvalid, handleOnInput } from "@/utils/input-util";
import { useUpdateCommunity } from "@/api/mutations";
import { Community } from "@/entities";

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
  community: Community;
  onHide: () => void;
}

export function CommunitySettingsDialog({ onHide, community }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [title, setTitle] = useState(cleanString(community.title));
  const [about, setAbout] = useState(cleanString(community.about));
  const [lang, setLang] = useState(community.lang || "en");
  const [description, setDescription] = useState(cleanString(community.description));
  const [flagText, setFlagText] = useState(cleanString(community.flag_text));
  const [isNsfw, setIsNsfw] = useState(community.is_nsfw);

  const { mutateAsync: updateCommunity, isPending } = useUpdateCommunity(community);

  const onChange = useCallback((e: React.ChangeEvent<any>): void => {
    const { target: el } = e;
    const key = el.name;
    const val = el.hasOwnProperty("checked") ? el.checked : el.value;

    // @ts-ignore
    this.stateSet({ [key]: val });
  }, []);

  const submit = useCallback(
    async () =>
      updateCommunity({
        payload: {
          title: cleanString(title),
          about: cleanString(about),
          description: cleanString(description),
          lang,
          flag_text: cleanString(flagText),
          is_nsfw: isNsfw
        }
      }),
    [about, description, flagText, isNsfw, lang, title, updateCommunity]
  );

  return (
    <Modal
      show={true}
      centered={true}
      onHide={onHide}
      className="community-settings-dialog"
      size="lg"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("community-settings.dialog-title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="community-settings-dialog-content">
          {isPending && <LinearProgress />}

          <Form
            ref={formRef}
            className={`settings-form ${isPending ? "in-progress" : ""}`}
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              e.stopPropagation();

              if (!formRef.current?.checkValidity()) {
                return;
              }

              submit().then();
            }}
          >
            <div className="flex mb-4">
              <div className="w-full sm:w-2/12">
                <label>{i18next.t("community-settings.title")}</label>
              </div>
              <div className="w-full sm:w-10/12">
                <InputGroup>
                  <FormControl
                    type="text"
                    autoComplete="off"
                    value={title}
                    name="title"
                    onChange={onChange}
                    required={true}
                    onInvalid={(e: any) =>
                      handleInvalid(e, "community-settings.", "validation-title")
                    }
                    onInput={handleOnInput}
                  />
                </InputGroup>
              </div>
            </div>
            <div className="flex mb-4">
              <div className="w-full sm:w-2/12">
                <label>{i18next.t("community-settings.about")}</label>
              </div>
              <div className="w-full sm:w-10/12">
                <FormControl
                  type="text"
                  autoComplete="off"
                  value={about}
                  name="about"
                  onChange={onChange}
                />
              </div>
            </div>
            <div className="flex mb-4">
              <div className="w-full sm:w-2/12">
                <label>{i18next.t("community-settings.lang")}</label>
              </div>
              <div className="w-full sm:w-4/12">
                <FormControl type="select" value={lang} name="lang" onChange={onChange}>
                  {langOpts.map((l, k) => (
                    <option key={k} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </FormControl>
              </div>
            </div>
            <div className="flex mb-4">
              <div className="w-full sm:w-2/12">
                <label>{i18next.t("community-settings.description")}</label>
              </div>
              <div className="w-full sm:w-10/12">
                <InputGroup>
                  <FormControl
                    type="textarea"
                    value={description}
                    name="description"
                    onChange={onChange}
                  />
                </InputGroup>
              </div>
            </div>
            <div className="flex mb-4">
              <div className="w-full sm:w-2/12">
                <label>{i18next.t("community-settings.rules")}</label>
              </div>
              <div className="w-full sm:w-10/12">
                <InputGroup>
                  <FormControl
                    type="textarea"
                    value={flagText}
                    name="flag_text"
                    onChange={onChange}
                  />
                </InputGroup>
                <small>{i18next.t("community-settings.rules-help")}</small>
              </div>
            </div>
            <div className="flex mb-4">
              <div className="w-full sm:w-2/12" />
              <div className="w-full sm:w-10/12">
                <FormControl
                  id="check-nsfw"
                  type="checkbox"
                  label="NSFW"
                  name="is_nsfw"
                  checked={isNsfw}
                  onChange={(v) => setIsNsfw(v)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {i18next.t("g.save")}
              </Button>
            </div>
          </Form>
        </div>
      </ModalBody>
    </Modal>
  );
}
