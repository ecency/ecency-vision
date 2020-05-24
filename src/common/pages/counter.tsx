import React, {Component} from 'react';
import {bindActionCreators, AnyAction, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {AppState} from '../store/index';
import {State as CounterState} from '../store/counter/types';
import {incrementCounter, decrementCounter} from '../store/counter/index';

interface Props {
    incrementCounter: () => void
    decrementCounter: () => void,
    counter: CounterState
}

export class Counter extends Component<Props> {

    render() {
        const {incrementCounter, decrementCounter, counter} = this.props;
        return (
            <div>
                Clicked: {counter.val} times
                {' '}
                <button onClick={incrementCounter}>+</button>
                {' '}
                <button onClick={decrementCounter}>-</button>
                {' '}
            </div>
        )
    }
}


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
