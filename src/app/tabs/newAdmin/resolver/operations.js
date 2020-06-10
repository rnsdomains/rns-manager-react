import Web3 from 'web3';
import RNS from '@rsksmart/rns';
import { hash as namehash } from 'eth-ens-namehash';
import { deflate } from 'react-zlib-js';
import cbor from 'cbor';
import { validateBytes32 } from '../../../validations';

import {
  requestResolver, receiveResolver, requestSetResolver, receiveSetResolver, errorSetResolver,
  waitingSetResolver, requestContent, receiveContent, errorContent, requestSetContent,
  receiveSetContent, errorSetContent, clearAllContent, errorDecodingAddress,
  requestMigrateAddresses, receiveMigrateAddresses, errorMigrateWithAddresses,
} from './actions';
import { getAllChainAddresses, getIndexById, getChainNameById } from '../addresses/operations';

import {
  multiChainResolver as multiChainResolverAddress,
  publicResolver as publicResolverAddress,
  stringResolver as stringResolverAddress,
  definitiveResolver as definitiveResolverAddress,
} from '../../../adapters/configAdapter';
import { gasPrice as defaultGasPrice } from '../../../adapters/gasPriceAdapter';

import transactionListener from '../../../helpers/transactionListener';
import { getOptions } from '../../../adapters/RNSLibAdapter';
import { sendBrowserNotification } from '../../../browerNotifications/operations';

import {
  MULTICHAIN_RESOLVER, PUBLIC_RESOLVER, STRING_RESOLVER, UNKNOWN_RESOLVER,
  CONTENT_BYTES, CONTENT_BYTES_BLANK, DEFINITIVE_RESOLVER, CONTENT_HASH,
  MULTICHAIN, MULTICOIN, CONTRACT_ABI,
} from './types';

import { resolverAbi, abstractResolverAbi } from './abis.json';
import { definitiveResolverAbi } from './definitiveAbis.json';
import { interfaces } from './supportedInterfaces.json';
import { EMPTY_ADDRESS } from '../types';
import { addressDecoder } from '../helpers';

const web3 = new Web3(window.ethereum);
const rns = new RNS(web3, getOptions());

const definitiveResolver = new web3.eth.Contract(
  definitiveResolverAbi, definitiveResolverAddress, { gasPrice: defaultGasPrice },
);

/**
 * Returns user friendly name based on address
 * @param {address} address the resolver address
 */
export const getResolverNameByAddress = (resolverAddr) => {
  switch (resolverAddr.toLowerCase()) {
    case multiChainResolverAddress:
      return MULTICHAIN_RESOLVER;
    case publicResolverAddress:
      return PUBLIC_RESOLVER;
    case stringResolverAddress:
      return STRING_RESOLVER;
    case definitiveResolverAddress:
      return DEFINITIVE_RESOLVER;
    default:
      return UNKNOWN_RESOLVER;
  }
};

/**
 * Gets the resolver for a specified domain
 * @param {string} domain the domain to get the resolver address
 */
export const getDomainResolver = domain => async (dispatch) => {
  dispatch(requestResolver());
  const hash = namehash(domain);

  await rns.compose();
  await rns.contracts.registry.methods.resolver(hash)
    .call((error, result) => {
      dispatch(receiveResolver(result, getResolverNameByAddress(result)));
    });
};


/**
 * Get the content Bytes or contenthash from the given resolver
 * @param {address} resolverAddress to be queried
 * @param {string} domain
 * @param {const} type either CONTENT_BYTES or CONTENT_HASH
 */
export const getContentBytes = (resolverAddress, domain, type = CONTENT_BYTES) => (dispatch) => {
  dispatch(requestContent(type));

  const resolver = new web3.eth.Contract(
    resolverAbi, resolverAddress, { gasPrice: defaultGasPrice },
  );

  const hash = namehash(domain);

  const method = type === CONTENT_BYTES
    ? resolver.methods.content(hash)
    : resolver.methods.contenthash(hash);

  method.call()
    .then(value => dispatch(
      receiveContent(
        type,
        (value === CONTENT_BYTES_BLANK || !value) ? '' : value,
        (value === CONTENT_BYTES_BLANK || !value),
      ),
    ))
    .catch(error => dispatch(errorContent(type, error)));
};

/**
 * Querys the blockchain for all four encodings of contract ABI and returns values
 * @param {address} resolverAddress address of the domain's resolver
 * @param {domain} domain domain associated with the ABI.
 */
const getContractAbi = (resolverAddress, domain) => async (dispatch) => {
  dispatch(requestContent(CONTRACT_ABI));
  const hash = namehash(domain);
  const resolver = new web3.eth.Contract(
    definitiveResolverAbi, resolverAddress, { gasPrice: defaultGasPrice },
  );

  const promiseArray = [];
  [1, 2, 4, 8].forEach(async (id) => {
    promiseArray.push(
      new Promise((resolve) => {
        resolver.methods.ABI(hash, id).call()
          .then(result => resolve({
            id,
            result: (result[1] !== '0x00' && result[1]) ? result[1] : null,
          }));
      }),
    );
  });

  Promise.all(promiseArray).then((values) => {
    const hasValues = values
      .filter(item => item.result !== null && parseInt(item.result, 16) !== 0).length;
    dispatch(receiveContent(CONTRACT_ABI, values, !hasValues));
  });
};

/**
 * Loops through manager's supported interfaces and checks if resolver also supports them.
 * @param {address} resolverAddress
 * @param {string} domain
 */
export const supportedInterfaces = (resolverAddress, domain) => (dispatch) => {
  dispatch(clearAllContent());
  const abstractResolver = new web3.eth.Contract(abstractResolverAbi, resolverAddress);

  // loop throgh supported interfaces and if found, call 'get' function.
  // only calls MULTICHAIN on the resolver page for the migration component
  // multicoin data is not needed on this page.
  interfaces.forEach((i) => {
    abstractResolver.methods
      .supportsInterface(i.interfaceId).call()
      .then((supportsInterface) => {
        if (supportsInterface) {
          switch (i.name) {
            case CONTENT_BYTES:
            case CONTENT_HASH:
              return dispatch(getContentBytes(resolverAddress, domain, i.name));
            case MULTICHAIN:
              return dispatch(getAllChainAddresses(
                domain, getResolverNameByAddress(resolverAddress),
              ));
            case CONTRACT_ABI:
              return (dispatch(getContractAbi(resolverAddress, domain)));
            case MULTICOIN:
            default:
          }
        }
        return null;
      });
  });
};


/**
 * Sets the resolver for a specified domain
 * @param {string} domain the domain to set
 * @param {address} resolverAddress the address to be set
 */
export const setDomainResolver = (domain, resolverAddress) => async (dispatch) => {
  dispatch(requestSetResolver());
  const lowerResolverAddress = resolverAddress.toLowerCase();

  const accounts = await window.ethereum.enable();
  const currentAddress = accounts[0];
  const hash = namehash(domain);

  await rns.compose();
  await rns.contracts.registry.methods.setResolver(hash, lowerResolverAddress)
    .send({ from: currentAddress }, (error, result) => {
      dispatch(waitingSetResolver());
      if (error) {
        return dispatch(errorSetResolver(error.message));
      }

      const transactionConfirmed = () => () => {
        const resolverName = getResolverNameByAddress(lowerResolverAddress);
        dispatch(receiveSetResolver(
          result, lowerResolverAddress, resolverName,
        ));
        dispatch(getAllChainAddresses(domain, resolverName));
        dispatch(supportedInterfaces(lowerResolverAddress, domain));
        sendBrowserNotification(domain, 'resolver_set_success');
      };

      return dispatch(
        transactionListener(result, () => transactionConfirmed()),
      );
    });
};

/**
 * Sets the ContentBytes OR ContentHash for the domain
 * @param {address} resolverAddress address of the Resolver used
 * @param {string} domain to be associated with the data
 * @param {bytes32} input to be set, or empty to set blank
 * @param {const} type either CONTENT_BYTES or CONTENT_HASH
 */
const setContentBytes = (
  resolverAddress, domain, input, type = CONTENT_BYTES,
) => async (dispatch) => {
  dispatch(requestSetContent(type));

  const value = input !== '' ? input : CONTENT_BYTES_BLANK;

  // validation
  if (validateBytes32(value)) {
    return dispatch(errorSetContent(type, validateBytes32(value)));
  }

  const resolver = new web3.eth.Contract(
    resolverAbi, resolverAddress, { gasPrice: defaultGasPrice },
  );

  const accounts = await window.ethereum.enable();
  const currentAddress = accounts[0];

  const method = type === CONTENT_BYTES
    ? resolver.methods.setContent(namehash(domain), value)
    : resolver.methods.setContenthash(namehash(domain), value);

  return method.send(
    { from: currentAddress }, (error, result) => {
      if (error) {
        return dispatch(errorSetContent(type, error.message));
      }

      const transactionConfirmed = () => () => {
        dispatch(receiveSetContent(
          type, result, (value === CONTENT_BYTES_BLANK) ? '' : value,
        ));
        sendBrowserNotification(domain, 'record_set');
      };

      return dispatch(transactionListener(result, () => transactionConfirmed()));
    },
  );
};

const setContractAbi = (resolverAddress, domain, value) => async (dispatch) => {
  dispatch(requestSetContent(CONTRACT_ABI));
  let dataSourceError;
  let parsedJson;
  const response = [];
  console.log('setting Contract Abi!', resolverAddress, domain, value);

  // get data by input method starting with URI:
  if (value.inputMethod === 'uri') {
    await fetch(encodeURI(value.uri))
      .then(res => res.json())
      .then((data) => {
        try {
          parsedJson = JSON.stringify(data);
        } catch (e) {
          dataSourceError = `Could not validate JSON from URI, ${e.message}`;
        }
      })
      .catch((e) => {
        dataSourceError = e.message;
      });
  } else if (value.inputMethod !== 'delete') {
    // get the data from the input form
    try {
      parsedJson = JSON.stringify(JSON.parse(value.jsonText));
    } catch (e) {
      dataSourceError = 'Could not validate JSON';
    }
  }

  if (dataSourceError) {
    return dispatch(errorSetContent(CONTRACT_ABI, dataSourceError));
  }

  const multiCallMethods = [];

  // type 1: uncompressed Json
  if (value.encodings.json && parsedJson !== '') {
    console.log('adding 1: JSON', parsedJson);
    response.push({ id: 1, result: web3.utils.toHex(parsedJson) });
  } else if (value.isEditing && !value.encodings.json) {
    // if editing, and uri is not checked, erase the value just in case
    console.log('blank 1: JSON');
    response.push({ id: 1, result: 0 });
  }

  // type 2:
  if (value.encodings.zlib && parsedJson !== '') {
    console.log('adding 2: zLIB');
    const zLibPromise = new Promise((resolve, reject) => {
      deflate(parsedJson, async (err, buffer) => {
        console.log('deflateFinished');
        if (err) {
          return reject(dispatch(errorSetContent(CONTRACT_ABI, 'Error creating zlib package')));
        }
        const zlibCompressed = web3.utils.toHex(buffer);
        console.log('zlib to hex', zlibCompressed);
        return resolve(zlibCompressed);
      });
    });

    await zLibPromise.then(zlibHex => response.push({ id: 2, result: zlibHex }));
  } else if (value.isEditing && !value.encodings.zlib) {
    console.log('blank 2: URI');
    response.push({ id: 2, result: 0 });
  }

  // type 4:
  if (value.encodings.cbor && parsedJson !== '') {
    console.log('adding 4: cbor');
    const cborEncoded = web3.utils.toHex(cbor.encode(parsedJson));
    response.push({ id: 4, result: web3.utils.toHex(cbor.encode(parsedJson)) });
    console.log('result', cborEncoded);
  } else if (value.isEditing && !value.encodings.cbor) {
    console.log('blank 4: CBOR');
    response.push({ id: 4, result: 0 });
  }

  // type 8: the URI:
  if (value.encodings.uri) {
    console.log('adding 8: URI', value.uri);
    response.push({ id: 8, result: web3.utils.toHex(value.uri) });
  } else if (value.isEditing && !value.encodings.uri) {
    console.log('blank 8: URI');
    response.push({ id: 8, result: 0 });
  }

  // Let's Multicall!
  console.log('starting multicall!');
  response.forEach((call) => {
    console.log('adding to multicall:', call.id);
    multiCallMethods.push(
      definitiveResolver.methods['setABI(bytes32,uint256,bytes)'](
        namehash(domain), call.id, call.result,
      ).encodeABI(),
    );
  });

  if (multiCallMethods.length === 0) {
    return dispatch(errorSetContent(CONTRACT_ABI, 'No encodings selected'));
  }

  console.log(multiCallMethods);
  // make the call!
  const accounts = await window.ethereum.enable();
  const currentAddress = accounts[0];
  console.log('sending the message');
  return definitiveResolver.methods.multicall(multiCallMethods)
    .send({ from: currentAddress }, (e, result) => {
      console.log('method sent', multiCallMethods);
      if (e) {
        console.log('error in send');
        return dispatch(errorSetContent(CONTRACT_ABI, e.message));
      }

      const transactionConfirmed = () => () => {
        console.log('transaction Confirmed!', result);
        dispatch(receiveSetContent(
          CONTRACT_ABI, result, response, (value.inputMethod === 'delete'),
        ));
        sendBrowserNotification(domain, 'contract_abi_set');
      };

      return dispatch(transactionListener(
        result,
        () => transactionConfirmed(),
        errorReason => dispatch(errorSetContent(CONTRACT_ABI, errorReason)),
      ));
    });
};


/**
 * Function to handle content type when setting. This will be expanded as more
 * content types are supported.
 * @param {const} contentType
 * @param {address} resolverAddress address of the resolver
 * @param {string} domain domain the content is associated with
 * @param {string} value value of the content
 */
export const setContent = (contentType, resolverAddress, domain, value) => (dispatch) => {
  switch (contentType) {
    case CONTENT_BYTES:
    case CONTENT_HASH:
      return dispatch(setContentBytes(resolverAddress, domain, value, contentType));
    case CONTRACT_ABI:
      return dispatch(setContractAbi(resolverAddress, domain, value));
    default: return null;
  }
};

/**
 * Set the resolver to the Definitive Resolver and Migrate Users Addresses
 * @param {string} domain domain to be migrated
 * @param {array} chainAddresses array of all the chainAddresses from the reducer
 * @param {bool} understandWarning bool that the user knows some addresses are invalid
 */
export const setDomainResolverAndMigrate = (
  domain, chainAddresses, contentBytes, understandWarning,
) => async (dispatch) => {
  dispatch(requestMigrateAddresses());
  const accounts = await window.ethereum.enable();
  const currentAddress = accounts[0];
  const hash = namehash(domain);

  // loop through addresses and skip empties, then get decoded version of the address,
  // if valid, create the contract method and add it to the multiCallMethods array.
  const multiCallMethods = [];
  let decodeError = false;
  Object.entries(chainAddresses).forEach((item) => {
    // if address is empty, do not continue
    if (item[1].address === '' || item[1].address === EMPTY_ADDRESS) {
      return false;
    }

    const decodedAddress = addressDecoder(item[1].address, getIndexById(item[1].chainId));

    // if returned a string, it is an error:
    if (typeof (decodedAddress) === 'string') {
      decodeError = true;
      return dispatch(errorDecodingAddress(
        item[1].chainId, getChainNameById(item[1].chainId), decodedAddress,
      ));
    }

    // valid address to be added to the multiCallMethods array:
    return multiCallMethods.push(
      definitiveResolver.methods['setAddr(bytes32,uint256,bytes)'](
        hash, item[1].chainId, decodedAddress,
      ).encodeABI(),
    );
  });

  // add contentBytes if not null or empty
  if (contentBytes && contentBytes !== CONTENT_BYTES_BLANK.value) {
    multiCallMethods.push(
      definitiveResolver.methods['setContenthash(bytes32,bytes)'](
        hash, contentBytes.value,
      ).encodeABI(),
    );
  }

  // return if an error in decoding happened to let the user know
  if (decodeError && !understandWarning) {
    return dispatch(errorMigrateWithAddresses(''));
  }

  await rns.compose();
  const migratePromise = [
    new Promise((resolve, reject) => {
      rns.contracts.registry.methods.setResolver(hash, definitiveResolverAddress)
        .send({ from: currentAddress }, (error, result) => (error
          ? reject() : dispatch(transactionListener(result, () => () => resolve(result)))));
    }),
    new Promise((resolve, reject) => {
      definitiveResolver.methods.multicall(multiCallMethods)
        .send({ from: currentAddress }, (error, result) => (error
          ? reject() : dispatch(transactionListener(result, () => () => resolve(result)))));
    }),
  ];

  return Promise.all(migratePromise).then((values) => {
    dispatch(receiveSetResolver(
      values[0], definitiveResolverAddress, DEFINITIVE_RESOLVER,
    ));
    dispatch(receiveMigrateAddresses(values));
    dispatch(getAllChainAddresses(domain, DEFINITIVE_RESOLVER));
    dispatch(supportedInterfaces(definitiveResolverAddress, domain));
    sendBrowserNotification(domain, 'resolver_migration_complete');
  })
    .catch(() => {
      dispatch(errorMigrateWithAddresses('One of the transactions had an error.'));
    });
};
