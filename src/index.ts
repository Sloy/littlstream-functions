import * as functions from 'firebase-functions'
import * as feedFunctions from './func-feed'
import { firestoreInstance } from './firebase-instance'
const generator = require('./generator.js')

import * as admin from 'firebase-admin'

const BASE_FEED_URL = 'https://us-central1-littlstar-feed.cloudfunctions.net/feed/'

async function getAuthorizedUid(authorization: string) {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw Error('No Firebase ID token was passed as a Bearer token in the Authorization header. M' +
      'ake sure you authorize your request by providing the following HTTP header: Auth' +
      'orization: Bearer <Firebase ID Token>');
  }
  const idToken = authorization.split('Bearer ')[1];
  const decodedIdToken = await admin.auth().verifyIdToken(idToken);
  console.log('ID Token correctly decoded', decodedIdToken);
  return decodedIdToken.uid
}

exports.publish = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Only POST allowd')
    return
  }

  const authorization = req.headers.authorization
  const feed = req.body

  try {
    const uid = await getAuthorizedUid(authorization)
    await storeUserFeed(uid, req.body)
    const url = BASE_FEED_URL + uid
    res.status(201).send(url)
  } catch (error) {
    console.error(error.message);
    res.status(403).send(error.message);
  }
});

async function storeUserFeed(uid, feed) {
  await storeFeedInPath(uid, feed)
}

async function storeFeedInPath(path, feed) {
  const rss = generator.generateRss(feed)
  console.log("rss: " + rss)
  console.log("feed: " + feed)
  await firestoreInstance
    .collection("feeds")
    .doc(path)
    .set({
      rss: rss,
      updateDate: new Date(),
      provider: feed.info.provider,
      json: feed
    })
}

exports.feed = functions.https.onRequest(async (req, res) => {
  const pathParts = req.path.split('/')
  const userId = pathParts[pathParts.length - 1]

  console.log("Request from user " + userId)

  const userAgent = req.headers["user-agent"]
  const isDebug = req.query.debug === "true"


  let cache = "no-cache"

  if (isDebug) {
    const html = await feedFunctions.loadLinksHtml(userId)
    return res.status(200)
      .type('text/html')
      .set("Cache-Control", cache)
      .send(html);
  }

  try {
    const rss = await feedFunctions.loadFeed(userId)
    //console.log(rss)
    return res.status(200)
      .type('application/rss+xml')
      .set("Cache-Control", cache)
      .send(rss);
  } catch (error) {
    console.error(error)
    return res.status(404).send(error.message);
  }
});

exports.logError = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Only POST allowd')
    return
  }

  const userId: string = "" + req.headers['user-id']
  const version: string = "" + req.headers['version']
  const client: string = "" + req.headers['client']
  const platform: string = "" + req.headers['platform']

  const ref = firestoreInstance
    .collection("errors")
    .doc()

  await ref.set({
    date: new Date(),
    userId: userId,
    version: version,
    client: client,
    platform: platform,
    data: req.body,
  })

  res.status(201).send(ref.id)
})

exports.slrpromo = functions.https.onRequest(async (req, res) => {
  let snapshot = await firestoreInstance.collection("SLRvideos").get()
  let videos = snapshot.docs
    .map(docSnapshot => docSnapshot.data())
    .map(video => {
      return {
        title: video['Title'],
        thumbnail: video['ThumbURL'],
        url: video['SceneURL'],
        studio: video['Studio'],
      }
    })

  return res.send(videos)
})