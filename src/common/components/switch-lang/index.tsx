import React, { Component } from 'react';

import { History } from 'history';

import { Link } from 'react-router-dom';

import { Global } from '../../store/global/types';

import i18n from 'i18next';

import DropDown from '../dropdown';

import { _t } from '../../i18n';

import { langOptions } from '../../i18n';

import * as ls from '../../util/local-storage';

interface Props {
  history: History;
  global: Global;
  label?: string;
  setLang: (lang: string) => void;
}

export class SwitchLang extends Component<Props> {
  render() {
    const { global, setLang, label } = this.props;

    const languageFromLS = ls && ls.get('lang');
    const lang = languageFromLS !== null ? languageFromLS.slice(0, 2).toUpperCase() : 'EN';
    const langMenuConfig = {
      history: this.props.history,
      label: label || lang,
      items: langOptions.map((f) => {
        return {
          label: f.name,
          active: global.lang === f.code,
          onClick: () => {
            i18n.changeLanguage(f.code).then(() => {
              setLang(f.code);
            });
            ls.set('current-language', f.code);
          }
        };
      }),
      postElem: (
        <div className="drop-down-menu-contributors">
          <Link to="/contributors">{_t('switch-lang.contributors')}</Link>
        </div>
      )
    };

    return (
      <div className="switch-language">
        <DropDown {...langMenuConfig} float={label ? 'left' : 'right'} />
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    global: p.global,
    label: p.label,
    setLang: p.setLang
  };

  return <SwitchLang {...props} />;
};
