/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {RoundTable} from './src/react-round-table';
import {getSeverAddress} from './src/utils/serverHandlers';

// configs
import {
  PRODUCTION_SERVER,
  LOCAL_DEVELOPMENT_SERVER,
  REMOTE_DEVELOPMENT_SERVER,
} from './src/configs/server';

RoundTable.connect(
  getSeverAddress({
    debug: 'remote',
    server: PRODUCTION_SERVER,
    remote: REMOTE_DEVELOPMENT_SERVER,
    local: LOCAL_DEVELOPMENT_SERVER,
  }),
);

AppRegistry.registerComponent(appName, () => App);
