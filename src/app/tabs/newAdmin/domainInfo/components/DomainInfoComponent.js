import React from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import { Row, Col } from 'react-bootstrap';

import CopyButtonComponent from '../../../../components/CopyButtonComponent';
import {
  TransferAddressContainer, RenewButtonContainer, RenewDomainContainer,
} from '../containers';

const DomainInfoComponent = (props) => {
  const {
    strings,
    domain,
    isSubdomain,
  } = props;

  return (
    <div className="domainInfo">
      <h1>{strings.domain_info}</h1>
      <Row>
        <Col md={7}>
          <div className="domain">
            {domain}
            <CopyButtonComponent text={domain} />
          </div>
        </Col>
        {!isSubdomain && (
          <Col md={5} className="renew">
            <RenewButtonContainer />
          </Col>
        )}
      </Row>
      <RenewDomainContainer />
      {!isSubdomain
      && (
      <Row className="break-above">
        <Col>
          <h2>{strings.transfer}</h2>
          <p>{strings.transfer_warning}</p>
          <TransferAddressContainer
            strings={{
              value_prefix: strings.owner,
              submit: strings.transfer,
              cancel: strings.cancel,
              error_title: 'Error!',
            }}
          />
        </Col>
      </Row>
      )}
    </div>
  );
};

DomainInfoComponent.propTypes = {
  strings: propTypes.shape({
    cancel: propTypes.string.isRequired,
    domain_info: propTypes.string.isRequired,
    owner: propTypes.string.isRequired,
    transfer: propTypes.string.isRequired,
    transfer_warning: propTypes.string.isRequired,
  }).isRequired,
  domain: propTypes.string.isRequired,
  isSubdomain: propTypes.bool.isRequired,
};

export default multilanguage(DomainInfoComponent);
