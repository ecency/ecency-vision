import moment from 'moment';
import React from 'react';
import {Link} from 'react-router-dom';
import {_t} from '../../i18n';
import {openInNewSvg} from '../../img/svg';
import WitnessVoteBtn from '../witness-vote-btn';

export const WitnessCard = ({
  voted,
  row,
  witness,
  onSuccess,
  global,
  ...other
}: any) => {
  return (
    <div className='p-3 mb-3 border rounded'>
      <div className='d-flex align-items-center justify-content-between'>
        <div>
          <h3>
            <Link to={`/@${row.name}`}>
              <b>{row.name}</b>
            </Link>
            {row.witnessBy && (
              <div className={'notranslate'}>
                <small>by {row.witnessBy}</small>
              </div>
            )}
          </h3>
        </div>
        <div>
          <img
            src={`https://images.ecency.com/${
              global.canUseWebp ? 'webp/' : ''
            }u/${row.name}/avatar/medium`}
            alt=''
            className='rounded-circle avatar mr-3'
          />
        </div>
      </div>
      <div className='d-flex'>
        <div className='mr-3 d-flex'>
          <div className='mr-2'>
            <b>{_t('witnesses.list-rank')} :</b>
          </div>
          <div>{row.rank}</div>
        </div>

        <div>
          {WitnessVoteBtn({
            ...other,
            voted,
            witness,
            onSuccess,
          })}
        </div>
      </div>
      <div className='d-flex align-items-center'>
        <b>{_t('witnesses.list-miss')}: </b>
        <div className='ml-2'>{row.miss}</div>{' '}
        <div>
          <a target='_external' href={row.url} className='witness-link ml-3'>
            {openInNewSvg}
          </a>
        </div>
      </div>
      <div className='d-flex align-items-center'>
        <b>{_t('witnesses.list-miss')}: </b>
        <div className='ml-2'>{row.fee}</div>
      </div>
      <div className='d-flex align-items-center my-2 justify-content-between'>
        <div className='witness-feed'>
          <span className='inner'>
            ${row.feed.replace(' HBD', '')} |{' '}
            {moment(row.priceAge).fromNow(true)}
          </span>
        </div>
        <div className='d-flex align-items-center'>
          <div className='witness-version'>
            <span className='inner'>{row.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
