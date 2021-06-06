import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import { FirebaseAppProvider } from 'reactfire';
import reportWebVitals from './reportWebVitals';
import { Auth, AuthWrapper } from './components/Auth';
import { Spinner } from '@blueprintjs/core';

const firebaseConfig = {
  apiKey: "AIzaSyBKASnS8wvfAaTjygRP0hPGAxQkbnIneU4",
  authDomain: "workload-dfd13.firebaseapp.com",
  databaseURL: "https://workload-dfd13.firebaseio.com",
  projectId: "workload-dfd13",
  storageBucket: "workload-dfd13.appspot.com",
  messagingSenderId: "362610505012",
  appId: "1:362610505012:web:e47d4fb7cfb3651e54e161"
};

ReactDOM.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig} suspense={true}>
      <Suspense fallback={<Spinner />}>
        <Auth />
        <AuthWrapper fallback={<span style={{color: "white"}}>Sign in to use this component</span>}>
          <App />
        </AuthWrapper>
      </Suspense>
    </FirebaseAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
