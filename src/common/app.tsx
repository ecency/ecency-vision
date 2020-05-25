import React from 'react';
import {Route, Switch} from 'react-router-dom';

import EntryIndex from './pages/entry-index';


const App = () => {
    return (
        <>
            <Switch>
                <Route path="/" exact={true} component={EntryIndex}/>
            </Switch>
        </>
    );
};

export default App;
