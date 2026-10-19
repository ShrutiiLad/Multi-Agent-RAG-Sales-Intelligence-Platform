import React from 'react';
import Layout from '@/Layout';
import { store } from '@/redux/store';
import AppRoutes from '@/routes';
import { Provider } from 'react-redux';

function App() {
  return (
    <Provider store={store}>
      <Layout>
        <AppRoutes />
      </Layout>
    </Provider>
  );
}

export default App;
