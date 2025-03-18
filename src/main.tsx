import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { backButton, init } from '@telegram-apps/sdk-react';
import store from './store/store';
import { Provider } from 'react-redux';

init();
backButton.mount();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRoot>
        <App/>
      </AppRoot>
    </Provider>
  </React.StrictMode>
);