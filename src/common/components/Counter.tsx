import React, {Component} from 'react';

interface Props {
    incrementCounter: () => void
    decrementCounter: () => void,
    counter: number
}

export default class Counter extends Component<Props> {
    render() {
        const {incrementCounter, decrementCounter, counter} = this.props;
        return (
            <div>
                Clicked: {counter} times
                {' '}
                <button onClick={incrementCounter}>+</button>
                {' '}
                <button onClick={decrementCounter}>-</button>
                {' '}
            </div>
        )
    }
}
