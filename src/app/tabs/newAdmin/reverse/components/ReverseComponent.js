import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import ReverseInputContainer from '../containers/ReverseInputContainer';
import { getReverse } from '../operations';

const ReverseComponent = ({
  reverseValue, address, strings, isRequesting,
}) => {
  const dispatch = useDispatch();
  useEffect(() => dispatch(getReverse(address)), []);

  if (isRequesting) {
    return (<></>);
  }

  return (
    <div>
      <h1>{strings.reverse}</h1>
      <p>{strings.reverse_explanation}</p>

      <ReverseInputContainer
        value={reverseValue}
        label={address}
        allowDelete={false}
        validate={false}
        strings={{
          value_prefix: '',
          submit: strings.submit,
          cancel: strings.cancel,
        }}
      />
    </div>
  );
};

ReverseComponent.propTypes = {
  strings: propTypes.shape({
    reverse: propTypes.string.isRequired,
    reverse_explanation: propTypes.string.isRequired,
    submit: propTypes.string.isRequired,
    cancel: propTypes.string.isRequired,
  }).isRequired,
  address: propTypes.string.isRequired,
  reverseValue: propTypes.string.isRequired,
  isRequesting: propTypes.bool.isRequired,
};

export default multilanguage(ReverseComponent);
