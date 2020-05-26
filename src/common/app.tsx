import React from 'react';
import {Route, Switch} from 'react-router-dom';

import EntryIndexContainer from './pages/entry-index';

import routes from './routes';

const App = () => {
    return (
        <>
            <Switch>
                <Route exact={true} path={routes.HOME} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.FILTER} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.FILTER_TAG} component={EntryIndexContainer}/>

            </Switch>
        </>
    );
};

export default App;
