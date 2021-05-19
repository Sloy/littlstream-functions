import { firestoreInstance } from "./firebase-instance";

export async function loadFeed(userId: string) {
  const feedRef = firestoreInstance
    .collection('feeds')
    .doc(userId)

  const feedDoc = await feedRef.get()
  const feed = feedDoc.data()

  if (feed === undefined) {
    throw Error(`Feed for user ${userId} doesn't exist`)
  }

  return feed.rss
}

export async function loadLinksHtml(userId: string): Promise<string> {
  const feedRef = firestoreInstance
    .collection('feeds')
    .doc(userId)

  const feedDoc = await feedRef.get()
  const feed = feedDoc.data()

  if (feed === undefined) {
    throw Error(`Feed for user ${userId} doesn't exist`)
  }

  const links = feed.json.videos.map(it => it.mp4Link)
  return generateLinksHtml(links)
}

export function generateLinksHtml(links: Array<string>): string {
  return "<ul>" + links.map(link => `<li><a href="${link}">${link}</a></li>`).join("\n") + "</ul>"
}
