import React from 'react';
import {Route, Switch} from 'react-router-dom';

import EntryIndex from './pages/entry-index';
import Counter from './pages/counter';

const App = () => {
    return (
        <>
            <Switch>
                <Route path="/" exact={true} component={EntryIndex}/>
                <Route path="/counter" exact={true} component={Counter}/>
            </Switch>
        </>
    );
};

export default App;
