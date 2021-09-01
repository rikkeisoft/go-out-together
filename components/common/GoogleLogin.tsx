import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase'
import { auth } from 'lib/firebase'

function GoogleLogin(): JSX.Element {
  // Configure FirebaseUI.
  const uiConfig = {
    signInFlow: 'redirect',
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID, firebase.auth.FacebookAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  }

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
}

export default GoogleLogin
