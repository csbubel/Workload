import * as React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useAuth, useSigninCheck } from 'reactfire';
import { Button, Card, Spinner } from "@blueprintjs/core";

const signOut = (auth: firebase.default.auth.Auth) => auth.signOut().then(() => console.log('signed out'));

export const AuthWrapper = ({ children, fallback }: React.PropsWithChildren<{ fallback: JSX.Element }>): JSX.Element => {
  const { status, data: signInCheckResult } = useSigninCheck();

  if (!children) {
    throw new Error('Children must be provided');
  }
  if (status === 'loading') {
    return <Spinner />;
  } else if (signInCheckResult.signedIn === true) {
    return children as JSX.Element;
  }

  return fallback;
};

interface UserDetailsProps {
    user: firebase.default.User
}

const UserDetails = ({ user }: UserDetailsProps) => {
  const auth = useAuth();

  return (
    <>
      <Card title="Displayname">{user.displayName}</Card>
      <Card title="Providers">
        <ul>
          {user.providerData?.map(profile => (
            <li key={profile?.providerId}>{profile?.providerId}</li>
          ))}
        </ul>
      </Card>
      <Card title="Sign Out">
        <Button onClick={() => signOut(auth)}>Sign Out</Button>
      </Card>
    </>
  );
};

const SignInForm = () => {
  const auth = useAuth;

  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [auth.GoogleAuthProvider.PROVIDER_ID],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => false
    }
  };

  return (
    <Card title="Sign-in form">
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />
    </Card>
  );
};

export const Auth = () => {
  const { status, data: signinResult } = useSigninCheck();

  if (status === 'loading') {
    return <Spinner />;
  }

  const { signedIn, user } = signinResult;

  if (signedIn === true) {
    return <UserDetails user={user!} />;
  } else {
    return <SignInForm />;
  }
};