import React from 'react';
import {Route, Switch} from 'react-router-dom';

import Home from './pages/home';
import Counter from './pages/counter';

const App = () => {
    return (
        <>
            <Switch>
                <Route path="/" exact={true} component={Home}/>
                <Route path="/counter" exact={true} component={Counter}/>
            </Switch>
        </>
    );
};

export default App;
