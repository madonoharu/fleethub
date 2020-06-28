import firebase from "firebase/app"
import "firebase/auth"
import "firebase/database"
import "firebase/firestore"
import "firebase/storage"
import { PlanState } from "@fleethub/core"
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string-uri-fix"
import { FhEntities } from "./store"

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
const db = firebase.firestore()

const provider = new firebase.auth.TwitterAuthProvider()
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)

export const login = () => firebase.auth().signInWithPopup(provider)
export const logout = () => firebase.auth().signOut()

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

const databaseRef = firebase.database().ref()
const storageRef = firebase.storage().ref()
const usersRef = storageRef.child("users")

export const setPlan = async (plan: PlanState) => {
  const user = firebase.auth().currentUser
  if (!user) return

  const databaseUserRef = databaseRef.child("users").child(user.uid)
  const userRef = usersRef.child(user.uid)

  const file = new File([JSON.stringify(plan)], "name", { type: "application/json" })
  const fileId = "file1"

  databaseUserRef.set({
    [fileId]: { id: fileId, type: "folder", children: ["file2", "file3"] },
    file2: { id: "file2", type: "plan" },
    file3: { id: "file3", type: "folder", children: ["file4"] },
    file4: { id: "file4", type: "plan" },
  })
}

type FhFolder = {
  id: string
  type: "folder"
  children: FhFile[]
}

type FhPlanFile = {
  id: string
  type: "plan"
  data: PlanState
}

type FhFile = FhPlanFile | FhFolder

const openPlanUrl = (plan: PlanState) => {
  const url = new URL("http://localhost:8000")
  url.searchParams.set("plan", compressToEncodedURIComponent(JSON.stringify(plan)))
  console.log(url.href)
}

export const parseUrlEntities = (): FhEntities | undefined => {
  const url = new URL(location.href)
  const param = url.searchParams.get("entities")
  if (!param) return

  url.searchParams.delete("entities")
  history.replaceState("", "", url.href)

  try {
    return JSON.parse(decompressFromEncodedURIComponent(param))
  } catch (error) {
    console.warn(error)
    return
  }
}

export const createShareUrl = (entities: FhEntities) => {
  const url = new URL("http://localhost:8000")
  url.searchParams.set("entities", compressToEncodedURIComponent(JSON.stringify(entities)))
  console.log(url.href)
  const param = url.searchParams.get("entities")
  console.log(param && JSON.parse(decompressFromEncodedURIComponent(param)))
}

export { firebase }
