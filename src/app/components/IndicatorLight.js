import React from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { multilanguage } from 'redux-multilanguage';
import { networkSelector } from '../selectors';

const IndicatorLight = ({
  networkMatch,
  network,
  strings,
  hasWeb3Provider,
  walletUnlocked,
}) => {
  let className = '';
  let popup = strings.connected_successful;
  let networkString = networkSelector(network);

  if (!hasWeb3Provider) {
    className = 'network-error';
    popup = strings.no_wallet;
  } else if (!walletUnlocked) {
    className = 'network-error';
    popup = strings.unlock_wallet;
  } else if (!networkMatch) {
    className = 'network-error';
    popup = `${strings.connect_to_network} ${networkSelector(network)}`;
    networkString = strings.unknown_network;
  }

  const body = (
    <div className={`indicator btn disabled ${className}`}>
      <OverlayTrigger
        key="bottom"
        placement="bottom"
        overlay={(
          <Tooltip id="tooltip-status">
            {popup}
          </Tooltip>
        )}
      >
        <span>
          {networkString}
        </span>
      </OverlayTrigger>
    </div>
  );

  return hasWeb3Provider ? body : <Link to="/setup">{body}</Link>;
};

IndicatorLight.propTypes = {
  networkMatch: propTypes.bool.isRequired,
  network: propTypes.string.isRequired,
  hasWeb3Provider: propTypes.bool.isRequired,
  walletUnlocked: propTypes.bool.isRequired,
  strings: propTypes.shape().isRequired,
};

export default multilanguage(IndicatorLight);
