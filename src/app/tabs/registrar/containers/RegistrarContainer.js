import { parse } from 'query-string';
import { connect } from 'react-redux';
import { RegistrarComponent } from '../components';
import getDomainState from '../../search/operations';
import { checkIfAlreadyRegistered } from '../operations';
import { closeErrorMessage } from '../actions';

const mapStateToProps = state => ({
  domain: parse(state.router.location.search).domain,
  domainStateLoading: state.search.domainStateLoading,
  owned: state.search.owned,
  owner: state.search.owner,
  walletAddress: state.auth.address,
  blocked: state.search.blocked,
  requestingOwner: state.search.requestingOwner,
  committed: state.registrar.committed,
  waiting: state.registrar.waiting,
  canReveal: state.registrar.canReveal,
  revealConfirmed: state.registrar.revealConfirmed,
  errorMessage: state.registrar.errorMessage,
  language: state.multilanguage.currentLanguageCode,
});

const mapDispatchToProps = dispatch => ({
  getState: domain => dispatch(getDomainState(domain)),
  checkIfAlreadyRegistered: domain => dispatch(checkIfAlreadyRegistered(domain)),
  handleCloseClick: () => dispatch(closeErrorMessage()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrarComponent);
