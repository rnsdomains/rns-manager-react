import { connect } from 'react-redux';
import { ViewRecordsComponent } from '../components';
import { CONTENT_HASH } from '../types';

const mapStateToProps = state => ({
  domain: state.auth.name,
  resolverAddr: state.newAdmin.resolver.resolverAddr,
  content: Object.entries(state.newAdmin.resolver.content).filter(c => c[0] !== CONTENT_HASH),
  gettingContent: state.newAdmin.resolver.gettingContent,
});

export default connect(
  mapStateToProps,
)(ViewRecordsComponent);
