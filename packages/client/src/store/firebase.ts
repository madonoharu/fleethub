import firebase from "firebase/app"
import "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBTCNFmu7K2mlUzVcxbc2vAuzMJxvNk4-s",
  authDomain: "jervisor.firebaseapp.com",
  databaseURL: "https://jervisor.firebaseio.com",
  projectId: "jervisor",
  storageBucket: "jervisor.appspot.com",
  messagingSenderId: "622340276549",
  appId: "1:622340276549:web:9f5a69030ed3673b487e2c",
  measurementId: "G-5QNXK21VP0",
}

firebase.initializeApp(firebaseConfig)
firebase.firestore()

export const shorten = async (url: string, domain: "kcj") => {
  const apiKey = firebaseConfig.apiKey

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  const body = {
    longDynamicLink: `https://${domain}.page.link/?link=${url}`,
    suffix: {
      option: "SHORT",
    },
  }

  const res = await fetch(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json()
  return json as { previewLink: string; shortLink: string } | { error: { code: number } }
}

export { firebase }
