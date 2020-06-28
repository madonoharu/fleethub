import firebase from "firebase/app"
import "firebase/auth"
import "firebase/database"
import "firebase/firestore"
import "firebase/storage"
import { PlanState } from "@fleethub/core"
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string-uri-fix"
import { FhEntities } from "./store"
import { nanoid } from "@reduxjs/toolkit"

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

const provider = new firebase.auth.TwitterAuthProvider()
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)

const storageFilesRef = firebase.storage().ref("files")

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

export const parseUrlEntities = async (): Promise<FhEntities | undefined> => {
  const url = new URL(location.href)
  const storageId = url.searchParams.get("storage-file")
  if (storageId) {
    const downloadUrl = await storageFilesRef.child(storageId).getDownloadURL()
    const data = await fetch(downloadUrl).then((res) => res.json())
    return data
  }

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

export const createShareUrl = async (entities: FhEntities) => {
  const url = new URL("http://localhost:8000")
  url.searchParams.set("entities", compressToEncodedURIComponent(JSON.stringify(entities)))

  if (url.href.length < 8000) return url.href

  url.searchParams.delete("entities")

  const id = nanoid()
  const res = await storageFilesRef
    .child(id)
    .putString(JSON.stringify(entities), "raw", { contentType: "application/json" })
  url.searchParams.set("storage-file", id)
  console.log(url.href)
  return url.href
}

export const createShareUrlByPlan = async (plan: PlanState) => {
  const id = nanoid()
  const url = await createShareUrl({
    files: [{ id, type: "plan" }],
    plans: [{ ...plan, id }],
  })
  return url
}

export { firebase }
