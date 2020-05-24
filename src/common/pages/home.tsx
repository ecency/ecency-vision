import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Helmet} from 'react-helmet';

export default class Home extends Component {

    render() {

        return (
            <div>
                <Helmet>
                    <title>Home</title>
                </Helmet>

                <p> HOME | <Link to="/counter">Counter</Link></p>
            </div>
        )
    }
}
