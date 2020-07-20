import firebase from "firebase/app"
import "firebase/storage"
import { PlanState } from "@fleethub/core"
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string-uri-fix"
import { nanoid } from "@reduxjs/toolkit"

import { FhEntities } from "./store"

const firebaseConfig = {
  apiKey: "AIzaSyCTRbVqrTpJH2VNisHn7Zxb50bAQ-M80aA",
  authDomain: "kcfleethub.firebaseapp.com",
  databaseURL: "https://kcfleethub.firebaseio.com",
  projectId: "kcfleethub",
  storageBucket: "kcfleethub.appspot.com",
  messagingSenderId: "154546542358",
  appId: "1:154546542358:web:be495b1b23c20c66c82237",
  measurementId: "G-9F914T0225",
}

firebase.initializeApp(firebaseConfig)

// const provider = new firebase.auth.TwitterAuthProvider()
// firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
// export const login = () => firebase.auth().signInWithPopup(provider)
// export const logout = () => firebase.auth().signOut()

const publicStorageRef = firebase.storage().ref("public")

export const shorten = async (url: string, domain: "fleethub") => {
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

const getUrlParam = (key: string) => {
  const url = new URL(location.href)
  const value = url.searchParams.get(key)
  url.searchParams.delete(key)
  history.replaceState("", "", url.href)
  return value
}

export const parseUrlEntities = async (): Promise<FhEntities | undefined> => {
  const fileId = getUrlParam("storage-file")
  if (fileId) {
    const data = await fetch(`https://storage.googleapis.com/kcfleethub.appspot.com/public/${fileId}`).then((res) =>
      res.json()
    )
    return data
  }

  const entitiesParam = getUrlParam("entities")
  if (entitiesParam) {
    try {
      return JSON.parse(decompressFromEncodedURIComponent(entitiesParam))
    } catch (error) {
      console.warn(error)
      return
    }
  }

  return
}

export const publishFiles = async (entities: FhEntities) => {
  const url = new URL("http://localhost:8000")
  url.searchParams.set("entities", compressToEncodedURIComponent(JSON.stringify(entities)))

  if (url.href.length < 8000) return url.href

  url.searchParams.delete("entities")

  const id = nanoid()
  const res = await publicStorageRef
    .child(id)
    .putString(JSON.stringify(entities), "raw", { contentType: "application/json" })
  url.searchParams.set("storage-file", id)
  console.log(url.href)
  return url.href
}

export const publishPlan = async (plan: PlanState) => {
  const id = nanoid()
  const url = await publishFiles({
    entry: id,
    files: [{ id, type: "plan" }],
    plans: [{ ...plan, id }],
  })
  return url
}

export { firebase }
