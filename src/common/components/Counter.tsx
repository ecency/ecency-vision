import React, {Component} from 'react';
import {State as CounterState} from "../store/counter/types";

interface Props {
    incrementCounter: () => void
    decrementCounter: () => void,
    counter: CounterState
}

export default class Counter extends Component<Props> {
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
