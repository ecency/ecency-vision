import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Counter from './pages/counter';

const App = () => {
    return (
        <>
            <Switch>
                <Route path="/" exact={true} component={Counter}/>
            </Switch>
        </>
    );
};

export default App;
