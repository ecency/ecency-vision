import {bindActionCreators, AnyAction, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {AppState} from '../store/index';
import {incrementCounter, decrementCounter} from '../store/counter/index';

import Counter from '../components/Counter';

const mapStateToProps = (state: AppState) => ({
    counter: state.counter,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            incrementCounter,
            decrementCounter
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Counter);
