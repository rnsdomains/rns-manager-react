import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import { useDispatch } from 'react-redux';

import { SubdomainViewContainer } from '../containers';
import { getSubdomainListFromLocalStorage } from '../operations';
import { truncateString } from '../../helpers';
import SettingsContainer from '../containers/SettingsContainer';

const SubdomainListComponent = ({
  strings, domain, subdomains, chainId, address,
}) => {
  const dispatch = useDispatch();
  useEffect(() => dispatch(getSubdomainListFromLocalStorage(domain)), [dispatch]);

  return (
    <div className="major-section">
      <h3 className="blue">{strings.my_subdomains}</h3>
      {Object.entries(subdomains).map((item) => {
        const subdomain = item[1];
        if (!subdomain.isActive) {
          return <></>;
        }
        const isOwner = subdomain.owner.toLowerCase() === address.toLowerCase();

        return (
          <div className="break-below">
            <SubdomainViewContainer
              key={subdomain.name}
              label={subdomain.name}
              labelDisplay={`${subdomain.name}.${domain}`}
              value={subdomain.owner}
              isError={subdomain.editError !== ''}
              isWaiting={subdomain.isWaiting}
              isSuccess={subdomain.isSuccess}
              successTx={subdomain.confirmedTx}
              reset={subdomain.isSuccess}
              validation
              validationChainId={chainId}
              suggestions={[{
                name: `${strings.your_address} (${truncateString(address)})`,
                value: address,
              }]}
              settingsMenu={isOwner && <SettingsContainer domain={`${subdomain.name}.${domain}`} />}
              strings={{
                value_prefix: strings.owner,
                error_message: subdomain.editError,
                cancel: strings.cancel,
                submit: strings.submit,
                edit_placeholder: strings.address_placeholder,
                success_message: strings.subdomain_owner_set,
                waiting: strings.wait_transation_confirmed,
                delete: strings.delete,
                edit: strings.edit,
                delete_confirm_text: strings.remove_subdomain_comfirm,
                suggestion: strings.suggestion,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

SubdomainListComponent.propTypes = {
  strings: propTypes.shape({
    my_subdomains: propTypes.string.isRequired,
    cancel: propTypes.string.isRequired,
    submit: propTypes.string.isRequired,
    address_placeholder: propTypes.string.isRequired,
    wait_transation_confirmed: propTypes.string.isRequired,
    subdomain_owner_set: propTypes.string.isRequired,
    delete: propTypes.string.isRequired,
    edit: propTypes.string.isRequired,
    remove_subdomain_comfirm: propTypes.string.isRequired,
    owner: propTypes.string.isRequired,
    suggestion: propTypes.string.isRequired,
    your_address: propTypes.string.isRequired,
  }).isRequired,
  domain: propTypes.string.isRequired,
  subdomains: propTypes.arrayOf({
    name: propTypes.string.isRequired,
    owner: propTypes.string.isRequired,
  }).isRequired,
  chainId: propTypes.number.isRequired,
  address: propTypes.string.isRequired,
};

export default multilanguage(SubdomainListComponent);
