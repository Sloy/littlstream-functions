import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp(functions.config().firebase)

export const firestoreInstance = admin.firestore();

firestoreInstance.settings({ timestampsInSnapshots: true });