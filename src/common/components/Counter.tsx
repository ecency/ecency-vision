import React from 'react';

const Counter = ({
                     increment,
                     incrementIfOdd,
                     incrementAsync,
                     decrement,
                     counter,
                 }) => (
    <p>
        Clicked: {counter} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
        {' '}
        <button onClick={incrementIfOdd}>Increment if odd</button>
        {' '}
        <button onClick={() => incrementAsync()}>Increment async</button>
    </p>
);


export default Counter;
