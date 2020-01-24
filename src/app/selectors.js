import { toChecksumAddress as toChainChecksumAddress } from 'rskjs-util';

const getChainId = state => state.auth.network;

export const toChecksumAddress = state => (
  address => address && toChainChecksumAddress(address, getChainId(state))
);

export const networkSelector = (network) => {
  if (network === process.env.REACT_APP_ENVIRONMENT_ID) {
    return 'Local';
  }

  switch (network) {
    case '30': return 'RSK MainNet';
    case '31': return 'RSK TestNet';
    default: return 'invalid';
  }
};
