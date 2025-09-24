const admin = require('firebase-admin');
const serviceAccount = require('./arundaya-9fb69-firebase-adminsdk-4ifqu-4b5212e77d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "arundaya-9fb69.appspot.com" // Sesuaikan dengan storageBucket Anda
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
