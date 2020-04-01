import React from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import { Row, Col } from 'react-bootstrap';
import { toChecksumAddress } from 'rskjs-util';

import { ChainAddressEditContainer } from '../containers';
import networks from '../networks.json';
import { MULTICHAIN_RESOLVER } from '../../resolver/types';

const YourAddressesComponent = ({ strings, chainAddresses, resolverName }) => (
  <Row>
    <Col>
      <h1>
        {strings.your_addresses}
        {resolverName === MULTICHAIN_RESOLVER && ` - ${strings.multichain}`}
      </h1>
      <p>{strings.your_addresses_explanation}</p>
      {Object.entries(chainAddresses).map((chainAddress) => {
        if (chainAddress[1].address === '' || chainAddress[1].address === '0x0000000000000000000000000000000000000000') {
          return (<></>);
        }

        const chainName = chainAddress[0];
        const {
          chainId, address, isEditing, isWaiting, isSuccess, isError, successTx, errorMessage,
        } = chainAddress[1];

        const network = networks.filter(net => net.name === chainName)[0];
        const isHex = network.validation === 'HEX';
        const networkChainId = (chainName === 'RSK') ? process.env.REACT_APP_ENVIRONMENT_ID : network.checksum;

        return (
          <div className="break-below">
            <ChainAddressEditContainer
              key={chainName}
              label={chainName}
              labelIcon={network.icon}
              networkId={chainId}
              value={address}
              valueDisplay={isHex ? toChecksumAddress(address, networkChainId) : address}
              isError={isError}
              isEditing={isEditing}
              isWaiting={isWaiting}
              isSuccess={isSuccess}
              successTx={successTx}
              reset={isSuccess}
              validationChainId={networkChainId}
              validation={isHex}
              strings={{
                value_prefix: strings.value,
                error_message: errorMessage,
                cancel: strings.cancel,
                submit: strings.submit,
                edit_placeholder: '',
                success_message: '',
                waiting: strings.wait_transation_confirmed,
                delete: strings.delete,
                edit: strings.edit,
                delete_confirm_text: strings.delete_chain_confirm,
              }}
            />
          </div>
        );
      })}
    </Col>
  </Row>
);

YourAddressesComponent.propTypes = {
  strings: propTypes.shape({
    cancel: propTypes.string.isRequired,
    submit: propTypes.string.isRequired,
    edit: propTypes.string.isRequired,
    delete: propTypes.string.isRequired,
    delete_chain_confirm: propTypes.string.isRequired,
    value: propTypes.string.isRequired,
    wait_transation_confirmed: propTypes.string.isRequired,
    your_addresses: propTypes.string.isRequired,
    your_addresses_explanation: propTypes.string.isRequired,
    multichain: propTypes.string.isRequired,
  }).isRequired,
  chainAddresses: propTypes.shape().isRequired,
  resolverName: propTypes.string.isRequired,
};

export default multilanguage(YourAddressesComponent);
