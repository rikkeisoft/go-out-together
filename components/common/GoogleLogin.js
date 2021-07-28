import PropTypes from 'prop-types'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase'
import { auth } from 'lib/firebase'

function GoogleLogin({ url }) {
  // Configure FirebaseUI.
  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: `${url}`,
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  }

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
}

GoogleLogin.propTypes = {
  url: PropTypes.string,
}

GoogleLogin.defaultProps = {}

export default GoogleLogin
