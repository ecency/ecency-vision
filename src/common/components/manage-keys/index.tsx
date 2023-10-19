import React, { useEffect, useState } from "react";
import { History } from "history";
import { cryptoUtils, PrivateKey, PublicKey } from "@hiveio/dhive";
import { decodeObj, encodeObj } from "../../util/encoder";
import { ActiveUser } from "../../store/active-user/types";
import { User, UserKeys } from "../../store/users/types";
import { AccountDataType, actionType, Keytype, PublicKeys } from "../manage-authority/types";
import ManageAuthIcon from "../manage-auth-icon";
import { error, success } from "../feedback";
import { generateKeys } from "../../helper/generate-private-keys";
import * as ls from "../../util/local-storage";
import { _t } from "../../i18n";
import { keySvg } from "../../img/svg";
import "./index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { Td, Tr } from "@ui/table";

interface Props {
  accountData: AccountDataType;
  activeUser: ActiveUser;
  history: History;
}

export default function ManageKeys(props: Props) {
  const [ownerReveal, setOwnerReveal] = useState(true);
  const [activeReveal, setActiveReveal] = useState(true);
  const [postingReveal, setPostingReveal] = useState(true);
  const [memoReveal, setMemoReveal] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [formattedPrivateKeys, setFormattedPrivatekeys] = useState<UserKeys>({});
  const [formattedPublicKeys, setFormattedPublickeys] = useState<PublicKeys>({});
  const [keyType, setKeyType] = useState("");
  const [privateKeys, setPrivatekeys] = useState<UserKeys>({});
  const [key, setKey] = useState("");
  const [keyDialog, setKeyDialog] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => {
        const ismobile = window.innerWidth < 1200;
        if (ismobile !== isMobile) {
          setIsMobile(ismobile);
        }
      },
      false
    );
  }, [isMobile]);

  useEffect(() => {
    getKeys();
  }, []);

  useEffect(() => {
    if (isMobile) {
      keysSetter();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      keysSetter();
    }
  }, [privateKeys]);

  const handleOwnerReveal = () => {
    setOwnerReveal(!ownerReveal);
  };

  const handleActiveReveal = () => {
    setActiveReveal(!activeReveal);
  };

  const handlePostingReveal = () => {
    setPostingReveal(!postingReveal);
  };

  const handleMemoReveal = () => {
    setMemoReveal(!memoReveal);
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const getKeys = () => {
    const { activeUser } = props;
    const currentUser = ls
      .getByPrefix("user_")
      .map((x) => {
        const u = decodeObj(x) as User;
        return {
          username: u.username,
          privateKeys: u.privateKeys!
        };
      })
      .filter((x) => x.username === activeUser?.username);
    if (currentUser) {
      setPrivatekeys(currentUser[0].privateKeys);
    }
  };

  const keysFormatter = (keyObject: any) => {
    let encrypKeys = {};
    for (const pkey in keyObject) {
      const Pkey = keyObject[pkey];
      let firstThreeChars = Pkey.substr(0, 3);
      let lastThreeChars = Pkey.substr(Pkey.length - 3);
      let finalString = firstThreeChars + "*******" + lastThreeChars;
      Object.assign(encrypKeys, { [pkey]: finalString });
    }
    return encrypKeys;
  };
  const handleSubmit = () => {
    const { activeUser } = props;
    //decode user object.
    const currentUser = ls
      .getByPrefix("user_")
      .map((x) => {
        const u = decodeObj(x) as User;
        return u;
      })
      .filter((x) => x.username === props.activeUser?.username);

    if (!key.length) {
      error(_t("manage-authorities.error-fields-required"));
      return;
    }

    try {
      PublicKey.fromString(key);
      error(_t("login.error-public-key"));
      return;
    } catch (e) {}

    const isPlainPassword = !cryptoUtils.isWif(key);

    let thePrivateKey!: PrivateKey;
    var keys: UserKeys = {};

    if (isPlainPassword) {
      thePrivateKey = PrivateKey.fromLogin(props.accountData!.account.name, key, "active");
      keys = generateKeys(activeUser!, key);
      const activePublicInput = thePrivateKey.createPublic().toString();
      if (!props.accountData!.publicKeys.publicActiveKey.toString().includes(activePublicInput)) {
        error(_t("login.error-authenticate")); // enter master or active key
        return;
      }
    } else {
      if (
        props
          .accountData!.publicKeys.publicOwnerKey.toString()
          .includes(PrivateKey.fromString(key).createPublic().toString())
      ) {
        thePrivateKey = PrivateKey.fromString(key);
        const ownerKey = thePrivateKey.toString();
        if (ownerKey === key && keyType === Keytype.Owner) {
          keys = { owner: ownerKey };
        } else {
          error(_t("manage-authorities.error-wrong-key"));
          return;
        }
      } else if (
        props
          .accountData!.publicKeys.publicPostingKey.toString()
          .includes(PrivateKey.fromString(key).createPublic().toString())
      ) {
        thePrivateKey = PrivateKey.fromString(key);
        const postingKey = thePrivateKey.toString();
        if (postingKey === key && keyType === Keytype.Posting) {
          keys = { posting: postingKey };
        } else {
          error(_t("manage-authorities.error-wrong-key"));
          return;
        }
      } else if (
        props.accountData!.publicKeys.publicMemoKey.includes(
          PrivateKey.fromString(key).createPublic().toString()
        )
      ) {
        thePrivateKey = PrivateKey.fromString(key);
        const memoKey = thePrivateKey.toString();
        if (memoKey === key && keyType === Keytype.Memo) {
          keys = { memo: memoKey };
        } else {
          error(_t("manage-authorities.error-wrong-key"));
          return;
        }
      } else {
        if (
          props
            .accountData!.publicKeys.publicActiveKey.toString()
            .includes(PrivateKey.fromString(key).createPublic().toString())
        ) {
          thePrivateKey = PrivateKey.fromString(key);
          const activeKey = thePrivateKey.toString();
          if (activeKey === key && keyType === Keytype.Active) {
            keys = { active: activeKey };
          } else {
            error(_t("manage-authorities.error-wrong-key"));
            return;
          }
        } else {
          error(_t("manage-authorities.error-wrong-key"));
          return;
        }
      }
    }

    const pKeys = currentUser[0].privateKeys;
    const updatedUser: User = {
      ...currentUser[0],
      ...{ ...{ privateKeys: { ...pKeys, ...keys } } }
    };
    updateUser(activeUser!, updatedUser);
    setStep(2);
    getKeys();
  };

  const updateUser = (activeUser: ActiveUser, updatedUser: User) => {
    ls.set(`user_${activeUser!.username}`, encodeObj(updatedUser));
  };

  const copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("manage-authorities.copied"));
  };

  const keysSetter = () => {
    const encryPrivatekeys = keysFormatter(privateKeys);
    const encrypPublicKeys = keysFormatter(props.accountData?.publicKeys);
    setFormattedPrivatekeys(encryPrivatekeys);
    setFormattedPublickeys(encrypPublicKeys);
  };

  const handleImportBtn = (type: string) => {
    setKeyType(type);
    setKeyDialog(true);
    setStep(1);
  };

  const finish = () => {
    setKeyDialog(false);
  };

  const passwordModal = () => {
    return (
      <>
        <div className="sign-dialog-header border-b border-[--border-color]">
          <div className="step-no">1</div>
          <div className="sign-dialog-titles">
            <div className="authority-main-title">{_t("manage-authorities.password-title")}</div>
            <div className="authority-sub-title">{_t("manage-authorities.password-sub-title")}</div>
          </div>
        </div>
        <div className="curr-password">
          <Form
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
            }}
          >
            <InputGroup
              prepend={keySvg}
              append={<Button onClick={handleSubmit}>{_t("key-or-hot.sign")}</Button>}
            >
              <FormControl
                value={key}
                type="password"
                autoFocus={true}
                autoComplete="off"
                placeholder={_t("manage-authorities.placeholder")}
                onChange={(e) => setKey(e.target.value)}
              />
            </InputGroup>
          </Form>
        </div>
      </>
    );
  };

  const keySuccessModal = () => {
    return (
      <>
        <div className="sign-dialog-header border-b border-[--border-color]">
          <div className="step-no">2</div>
          <div className="sign-dialog-titles">
            <div className="authority-main-title">{_t("manage-authorities.success-title")}</div>
            <div className="authority-sub-title">{_t("manage-authorities.success-sub-title")}</div>
          </div>
        </div>
        <div className="success-dialog-body">
          <div className="success-dialog-content">
            <span>{_t("manage-authorities.keys-success-message")} </span>
          </div>
          <div className="flex justify-center">
            <span className="hr-6px-btn-spacer" />
            <Button onClick={finish}>{_t("g.finish")}</Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Tr>
        <Td className="col-type-content"> {_t("manage-authorities.owner")}</Td>
        <Td className="key">
          {ownerReveal
            ? isMobile
              ? formattedPublicKeys.publicOwnerKey
              : props.accountData!.publicKeys.publicOwnerKey
            : isMobile
            ? formattedPrivateKeys.owner
            : privateKeys?.owner!}
        </Td>
        <Td className="hidden sm:table-cell">
          <p className="action-btns">
            <Button
              className="copy-btn"
              outline={true}
              onClick={() =>
                ownerReveal
                  ? copyToClipboard(props.accountData!.publicKeys.publicOwnerKey.toString())
                  : copyToClipboard(privateKeys?.owner!)
              }
            >
              {_t("manage-authorities.copy")}
            </Button>
            {privateKeys?.owner! ? (
              <Button className="reveal-btn" outline={true} onClick={handleOwnerReveal}>
                {ownerReveal
                  ? _t("manage-authorities.reveal-private-key")
                  : _t("manage-authorities.reveal-public-key")}
              </Button>
            ) : (
              <Button
                className="import-btn"
                outline={true}
                onClick={() => handleImportBtn(Keytype.Owner)}
              >
                {_t("manage-authorities.import")}
              </Button>
            )}
          </p>
        </Td>

        <Td className="sm:hidden">
          {
            <ManageAuthIcon
              history={props.history}
              type={actionType.Keys}
              action={privateKeys?.owner ? actionType.Reveal : actionType.Import}
              keyType={Keytype.Owner}
              Pkey={
                ownerReveal ? props.accountData!.publicKeys.publicOwnerKey : privateKeys?.owner!
              }
              label={
                privateKeys?.owner
                  ? ownerReveal
                    ? _t("manage-authorities.reveal-private-key")
                    : _t("manage-authorities.reveal-public-key")
                  : _t("manage-authorities.import")
              }
              onCopy={(key) => {
                copyToClipboard(key);
              }}
              onImport={(type) => {
                handleImportBtn(type);
              }}
              onReveal={() => {
                handleOwnerReveal();
              }}
            />
          }
        </Td>
        <Td className="col-weight-content">{props.accountData!.owner[1]}</Td>
      </Tr>

      <Tr>
        <Td className="col-type-content"> {_t("manage-authorities.active")}</Td>
        <Td className="key">
          {activeReveal
            ? isMobile
              ? formattedPublicKeys.publicActiveKey
              : props.accountData!.publicKeys.publicActiveKey
            : isMobile
            ? formattedPrivateKeys.active
            : privateKeys?.active!}
        </Td>
        <Td className="hidden sm:table-cell">
          <p className="action-btns">
            <Button
              className="copy-btn"
              outline={true}
              onClick={() => {
                activeReveal
                  ? copyToClipboard(props.accountData!.publicKeys.publicActiveKey.toString())
                  : copyToClipboard(privateKeys?.active!);
              }}
            >
              {_t("manage-authorities.copy")}
            </Button>
            {privateKeys?.active! ? (
              <Button className="reveal-btn" outline={true} onClick={handleActiveReveal}>
                {activeReveal
                  ? _t("manage-authorities.reveal-private-key")
                  : _t("manage-authorities.reveal-public-key")}
              </Button>
            ) : (
              <Button
                className="import-btn"
                outline={true}
                onClick={() => handleImportBtn(Keytype.Active)}
              >
                {_t("manage-authorities.import")}
              </Button>
            )}
          </p>
        </Td>
        <Td className="sm:hidden">
          {
            <ManageAuthIcon
              history={props.history}
              type={actionType.Keys}
              action={privateKeys?.active ? actionType.Reveal : actionType.Import}
              keyType={Keytype.Active}
              Pkey={
                activeReveal ? props.accountData!.publicKeys.publicActiveKey : privateKeys?.active!
              }
              label={
                privateKeys?.active
                  ? activeReveal
                    ? _t("manage-authorities.reveal-private-key")
                    : _t("manage-authorities.reveal-public-key")
                  : _t("manage-authorities.import")
              }
              onCopy={(key) => {
                copyToClipboard(key);
              }}
              onImport={(type) => {
                handleImportBtn(type);
              }}
              onReveal={() => {
                handleActiveReveal();
              }}
            />
          }
        </Td>

        <Td className="col-weight-content">{props.accountData!.active[1]}</Td>
      </Tr>
      <Tr>
        <Td className="col-type-content"> {_t("manage-authorities.posting")}</Td>
        <Td className="key">
          {postingReveal
            ? isMobile
              ? formattedPublicKeys.publicPostingKey
              : props.accountData!.publicKeys.publicPostingKey
            : isMobile
            ? formattedPrivateKeys.posting
            : privateKeys?.posting!}
        </Td>
        <Td className="hidden sm:table-cell">
          <p className="action-btns">
            <Button
              className="copy-btn"
              outline={true}
              onClick={() =>
                postingReveal
                  ? copyToClipboard(props.accountData!.publicKeys.publicPostingKey.toString())
                  : copyToClipboard(privateKeys?.posting!)
              }
            >
              {_t("manage-authorities.copy")}
            </Button>
            {privateKeys?.posting! ? (
              <Button className="reveal-btn" outline={true} onClick={handlePostingReveal}>
                {postingReveal
                  ? _t("manage-authorities.reveal-private-key")
                  : _t("manage-authorities.reveal-public-key")}
              </Button>
            ) : (
              <Button
                className="import-btn"
                outline={true}
                onClick={() => handleImportBtn(Keytype.Posting)}
              >
                {_t("manage-authorities.import")}
              </Button>
            )}
          </p>
        </Td>
        <Td className="sm:hidden">
          {
            <ManageAuthIcon
              history={props.history}
              type={actionType.Keys}
              action={privateKeys?.posting ? actionType.Reveal : actionType.Import}
              keyType={Keytype.Posting}
              Pkey={
                postingReveal
                  ? props.accountData!.publicKeys.publicPostingKey
                  : privateKeys?.posting!
              }
              label={
                privateKeys?.posting
                  ? postingReveal
                    ? _t("manage-authorities.reveal-private-key")
                    : _t("manage-authorities.reveal-public-key")
                  : _t("manage-authorities.import")
              }
              onCopy={(key) => {
                copyToClipboard(key);
              }}
              onImport={(type) => {
                handleImportBtn(type);
              }}
              onReveal={() => {
                handlePostingReveal();
              }}
            />
          }
        </Td>

        <Td className="col-weight-content">{props.accountData!.posting[1]}</Td>
      </Tr>

      <Tr>
        <Td className="col-type-content"> {_t("manage-authorities.memo")}</Td>
        <Td className="key">
          {memoReveal
            ? isMobile
              ? formattedPublicKeys.publicMemoKey
              : props.accountData!.publicKeys.publicMemoKey
            : isMobile
            ? formattedPrivateKeys.memo
            : privateKeys?.memo!}
        </Td>
        <Td className="hidden sm:table-cell">
          <p className="action-btns">
            <Button
              className="copy-btn"
              outline={true}
              onClick={() =>
                memoReveal
                  ? copyToClipboard(props.accountData!.publicKeys.publicMemoKey)
                  : copyToClipboard(privateKeys?.memo!)
              }
            >
              {_t("manage-authorities.copy")}
            </Button>
            {privateKeys?.memo! ? (
              <Button className="reveal-btn" outline={true} onClick={handleMemoReveal}>
                {memoReveal
                  ? _t("manage-authorities.reveal-private-key")
                  : _t("manage-authorities.reveal-public-key")}
              </Button>
            ) : (
              <Button
                className="import-btn"
                outline={true}
                onClick={() => handleImportBtn(Keytype.Memo)}
              >
                {_t("manage-authorities.import")}
              </Button>
            )}
          </p>
        </Td>

        <Td className="sm:hidden">
          {
            <ManageAuthIcon
              history={props.history}
              type={actionType.Keys}
              action={privateKeys?.memo ? actionType.Reveal : actionType.Import}
              keyType={Keytype.Memo}
              Pkey={memoReveal ? props.accountData!.publicKeys.publicMemoKey : privateKeys?.memo!}
              label={
                privateKeys?.memo
                  ? memoReveal
                    ? _t("manage-authorities.reveal-private-key")
                    : _t("manage-authorities.reveal-public-key")
                  : _t("manage-authorities.import")
              }
              onCopy={(key) => {
                copyToClipboard(key);
              }}
              onImport={(type) => {
                handleImportBtn(type);
              }}
              onReveal={() => {
                handleMemoReveal();
              }}
            />
          }
        </Td>
        <Td className="col-weight-content">{props.accountData!.owner[1]}</Td>
      </Tr>

      {keyDialog && (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          className="manage-keys"
          size="lg"
        >
          <ModalHeader closeButton={true} />
          <ModalBody>
            {step === 1 && passwordModal()}
            {step === 2 && keySuccessModal()}
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
