import { connect } from 'react-redux';
import IndicatorLight from '../components/IndicatorLight';

const mapStateToProps = state => ({
  networkMatch: state.auth.networkMatch,
  hasWeb3Provider: state.auth.hasWeb3Provider,
  walletUnlocked: state.auth.walletUnlocked,
  network: process.env.REACT_APP_ENVIRONMENT_ID,
});

export default connect(mapStateToProps)(IndicatorLight);
