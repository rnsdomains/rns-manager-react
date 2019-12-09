import Web3 from 'web3';
import { keccak_256 as sha3 } from 'js-sha3';
import {
  requestDomainState, receiveDomainState, blockedDomain,
  requestDomainOwner, receiveDomainOwner,
} from './actions';
import { rskOwner as rskOwnerAddress } from '../../../config/contracts.json';
import { notifyError } from '../../notifications';
import { rskMain } from '../../../config/nodes.json';
import { rskOwnerAbi } from './abis.json';

export default domain => (dispatch) => {
  if (!domain) {
    return dispatch(receiveDomainState(''));
  }

  dispatch(requestDomainState());

  const web3 = new Web3(rskMain);

  const rskOwner = new web3.eth.Contract(rskOwnerAbi, rskOwnerAddress);

  const hash = `0x${sha3(domain.split('.')[0])}`;

  if (domain.length < 5) {
    return dispatch(blockedDomain());
  }

  return rskOwner.methods.available(hash).call()
    .then((available) => {
      if (!available) {
        dispatch(receiveDomainState(false));
        dispatch(requestDomainOwner());
        return rskOwner.methods.ownerOf(hash).call()
          .then(owner => dispatch(receiveDomainOwner(owner)))
          .catch(error => dispatch(notifyError(error.message)));
      }

      return dispatch(receiveDomainState(available));
    })
    .catch(error => dispatch(notifyError(error.message)));
};
