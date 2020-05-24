import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions';

const mapStateToProps = (state: any) => ({
    counter: state.counter,
});

function mapDispatchToProps(dispatch: any) {
    // @ts-ignore
    return bindActionCreators(CounterActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
