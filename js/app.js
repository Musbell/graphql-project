import 'babel-polyfill';

import QuotesLibrary from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';



ReactDOM.render(
    <Relay.RootContainer
        Component={QuotesLibrary}
        route={new AppHomeRoute()}
    />,
    document.getElementById('root')
);