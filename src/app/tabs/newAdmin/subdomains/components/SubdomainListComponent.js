import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import { useDispatch } from 'react-redux';

import { SubdomainViewContainer } from '../containers';
import { getSubdomainListFromLocalStorage } from '../operations';

const SubdomainListComponent = ({
  strings, domain, subdomains,
}) => {
  const dispatch = useDispatch();
  useEffect(() => dispatch(getSubdomainListFromLocalStorage(domain)), [dispatch]);

  return (
    <div className="major-section">
      <h3 className="blue">{strings.my_subdomains}</h3>
      {Object.entries(subdomains).map((item) => {
        const subdomain = item[1];
        return (
          <div className="break-below">
            <SubdomainViewContainer
              key={subdomain.name}
              label={subdomain.name}
              value={subdomain.owner}
              isError={subdomain.editError !== ''}
              isWaiting={subdomain.isWaiting}
              isSuccess={subdomain.isSuccess}
              successTx={subdomain.confirmedTx}
              reset={subdomain.isSuccess}
              strings={{
                value_prefix: '',
                error_message: subdomain.editError,
                cancel: strings.cancel,
                submit: strings.submit,
                edit_placeholder: strings.type_owners_address,
                success_message: strings.subdomain_owner_set,
                waiting: strings.wait_transation_confirmed,
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
    type_owners_address: propTypes.string.isRequired,
    wait_transation_confirmed: propTypes.string.isRequired,
    subdomain_owner_set: propTypes.string.isRequired,
  }).isRequired,
  domain: propTypes.string.isRequired,
  subdomains: propTypes.arrayOf({
    name: propTypes.string.isRequired,
    owner: propTypes.string.isRequired,
  }).isRequired,
};

export default multilanguage(SubdomainListComponent);
