import React, {Component} from "react";

import {History} from "history";

import {Link} from "react-router-dom";

import {Global} from "../../store/global/types";

import i18n from "i18next";

import DropDown from "../dropdown";

import {_t} from "../../i18n";

import {langOptions} from "../../i18n";

import {translateSvg} from "../../img/svg";


interface Props {
    history: History;
    global: Global;
    setLang: (lang: string) => void;
}

export class SwitchLang extends Component<Props> {

    render() {
        const {global, setLang} = this.props;

        const langMenuConfig = {
            history: this.props.history,
            label: '',
            icon: translateSvg,
            items: langOptions.map((f => {
                return {
                    label: f.name,
                    active: global.lang === f.code,
                    onClick: () => {
                        i18n.changeLanguage(f.code).then(() => {
                            setLang(f.code);
                        });
                    }
                }
            })),
            postElem: <div className="drop-down-menu-contributors">
                <Link to="/contributors">{_t("switch-lang.contributors")}</Link>
            </div>
        };

        return (
            <div className="switch-language">
                <DropDown {...langMenuConfig} float="right"/>
            </div>
        );
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        global: p.global,
        setLang: p.setLang
    }

    return <SwitchLang {...props} />
}
