import { connect } from 'react-redux';
import { AdminTabComponent } from '../components';
import { toggleBasicAdvancedSwitch } from '../operations';

// eslint-disable-next-line no-unused-vars
const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
  toggleAdvancedBasic: value => dispatch(toggleBasicAdvancedSwitch(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdminTabComponent);
