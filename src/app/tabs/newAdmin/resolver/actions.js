import {
  REQUEST_RESOLVER, RECEIVE_RESOLVER, REQUEST_SET_RESOLVER, RECEIVE_SET_RESOLVER,
  ERROR_SET_RESOLVER, WAITING_SET_RESOLVER, CLOSE_MESSAGE, REQUEST_CONTENT,
  RECEIVE_CONTENT, ERROR_CONTENT, REQUEST_SET_CONTENT, RECEIVE_SET_CONTENT,
  ERROR_SET_CONTENT, CLOSE_SET_CONTENT, REQUEST_SUPPORTED_INTERFACES, REQUEST_MIGRATE_ADDRESSES,
  RECEIVE_MIGRATE_ADDRESSES, ERROR_DECODING_ADDRESS, ERROR_MIGRATE_WITH_ADDRESSES,
  CLEAR_MIGRATE_CONTENT, RECEIVE_SUPPORTED_INTERFACES,
} from './types';

export const requestResolver = () => ({
  type: REQUEST_RESOLVER,
});

export const receiveResolver = (resolverAddr, resolverName) => ({
  type: RECEIVE_RESOLVER,
  resolverAddr,
  resolverName,
});

export const requestSetResolver = () => ({
  type: REQUEST_SET_RESOLVER,
});

export const waitingSetResolver = () => ({
  type: WAITING_SET_RESOLVER,
});

export const receiveSetResolver = (successTx, resolverAddr, resolverName) => ({
  type: RECEIVE_SET_RESOLVER,
  successTx,
  resolverAddr,
  resolverName,
});

export const errorSetResolver = message => ({
  type: ERROR_SET_RESOLVER,
  message,
});

export const closeMessage = () => ({
  type: CLOSE_MESSAGE,
});

export const requestContent = contentType => ({
  type: REQUEST_CONTENT,
  contentType,
});

export const receiveContent = (contentType, value, isEmpty) => ({
  type: RECEIVE_CONTENT,
  contentType,
  value,
  isEmpty,
});

export const errorContent = (contentType, message) => ({
  type: ERROR_CONTENT,
  contentType,
  message,
});

export const requestSetContent = contentType => ({
  type: REQUEST_SET_CONTENT,
  contentType,
});

export const receiveSetContent = (contentType, successTx, value, isEmpty) => ({
  type: RECEIVE_SET_CONTENT,
  contentType,
  successTx,
  value,
  isEmpty,
});

export const errorSetContent = (contentType, message) => ({
  type: ERROR_SET_CONTENT,
  contentType,
  message,
});

export const closeSetMessage = contentType => ({
  type: CLOSE_SET_CONTENT,
  contentType,
});

export const requestSupportedInterfaces = () => ({
  type: REQUEST_SUPPORTED_INTERFACES,
});

export const requestMigrateAddresses = () => ({
  type: REQUEST_MIGRATE_ADDRESSES,
});

export const receiveMigrateAddresses = txs => ({
  type: RECEIVE_MIGRATE_ADDRESSES,
  txs,
});

export const errorDecodingAddress = (chainId, chainName, errorMessage) => ({
  type: ERROR_DECODING_ADDRESS,
  chainName,
  chainId,
  errorMessage,
});

export const errorMigrateWithAddresses = message => ({
  type: ERROR_MIGRATE_WITH_ADDRESSES,
  message,
});

export const clearMigrateContent = () => ({
  type: CLEAR_MIGRATE_CONTENT,
});

export const receiveSupportedInterfaces = () => ({
  type: RECEIVE_SUPPORTED_INTERFACES,
});
