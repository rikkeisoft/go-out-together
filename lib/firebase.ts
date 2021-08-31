import firebase from 'firebase/app'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export const uploadImage = async (image) => {
  if (image) {
    const ref = firebase.storage().ref().child(`/images/${image.name}`)
    let downloadURL = ''

    try {
      await ref.put(image)
      downloadURL = await ref.getDownloadURL()
    } catch (error) {
      console.error(error)
    }

    return downloadURL
  }

  return null
}

export const auth = firebase.auth()
export default firebase
