import React from 'react';

const Counter = ({increment, decrement, counter,}) => (
    <p>
        Clicked: {counter} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
        {' '}
    </p>
);


export default Counter;
