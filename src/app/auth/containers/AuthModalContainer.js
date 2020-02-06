import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { AuthModalComponent } from '../components';
import { closeModal } from '../actions';
import { authenticate } from '../operations';
import { networkSelector } from '../../selectors';

const mapStateToProps = state => ({
  show: state.auth.showModal,
  hasMetamask: state.auth.hasMetamask,
  enabling: state.auth.enabling,
  enableError: state.auth.enableError,
  address: state.auth.address,
  network: networkSelector(state.auth.network),
  managerNetwork: networkSelector(process.env.REACT_APP_ENVIRONMENT_ID),
  authError: state.auth.authError,
  name: state.auth.name,
  storageName: state.auth.storageName,
  isOwner: state.auth.isOwner,
  defaultDomain: state.auth.defaultDomain,
});

const mapDispatchToProps = dispatch => ({
  close: () => dispatch(closeModal()),
  authenticate: (name, address) => dispatch(authenticate(name, address)),
  openWallets: () => {
    dispatch(push('/walltes'));
    dispatch(closeModal());
  },
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  authenticate: name => dispatchProps.authenticate(name, stateProps.address),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(AuthModalComponent);
