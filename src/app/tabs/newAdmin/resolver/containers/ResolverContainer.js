import { connect } from 'react-redux';
import { ResolverComponent } from '../components';

// eslint-disable-next-line no-unused-vars
const mapStateToProps = state => ({
  gettingResolver: state.newAdmin.resolver.gettingResolver,
  resolverName: state.newAdmin.resolver.resolverName,
});

// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResolverComponent);