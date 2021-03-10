import React, { useState } from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import { Alert } from 'react-bootstrap';
import UserWaitingComponent from '../../../../components/UserWaitingComponent';
import AddressInputComponent from '../../../../components/AddressInputComponent';

const MyUrlComponent = ({
  strings, url, gettingContent, handleSave,
}) => {
  const [newInput, setNewInput] = useState('');
  const contentHashPlaceholder = 'ipfs://..., ipns://..., bzz://..., onion://..., onion3://...';

  if (gettingContent) {
    return <UserWaitingComponent visible />;
  }

  if (!url) {
    return (
      <>
        <h1>{strings.decentralized_url}</h1>
        <Alert key="decode" variant="warning">Your resolver does not support decentralized URL.</Alert>
      </>
    );
  }

  return (
    <div>
      <h1>{strings.decentralized_url}</h1>
      <p>{strings.decentralized_exp}</p>

      {url.isRequesting && <UserWaitingComponent visible />}
      {url.isEmpty && !url.isRequesting && (
        <div className="new row">
          <div className="col-md-10">
            <input
              className="rsk-input"
              type="text"
              value={newInput}
              onChange={evt => setNewInput(evt.target.value)}
              placeholder={contentHashPlaceholder}
            />
          </div>
          <div className="col-md-2">
            <button type="button" className="rsk-button" onClick={() => handleSave(newInput)}>Add</button>
          </div>

          {url.errorMessage && <div className="error">{url.errorMessage}</div>}
          {url.isWaiting && <UserWaitingComponent visible />}
        </div>
      )}

      {!url.isEmpty && (
        <AddressInputComponent
          handleSubmit={handleSave}
          value={url.value}
          isWaiting={url.isWaiting}
          isError={!!url.errorMessage}
          allowDelete
          handleDelete={() => handleSave('')}
          strings={{
            value_prefix: '',
            cancel: strings.cancel,
            delete: strings.delete,
            edit_placeholder: contentHashPlaceholder,
            submit: strings.submit,
            error_message: url.errorMessage,
            delete_confirm_text: strings.delete_content_confirm,
          }}
          label=""
          validation={false}
        />
      )}
    </div>
  );
};

MyUrlComponent.defaultProps = {
  url: null,
};

MyUrlComponent.propTypes = {
  strings: propTypes.shape().isRequired,
  url: propTypes.shape(),
  gettingContent: propTypes.bool.isRequired,
  handleSave: propTypes.func.isRequired,
};

export default multilanguage(MyUrlComponent);
