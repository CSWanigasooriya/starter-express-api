const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser');
const serviceAccount = require("./newtoneinstruments-firebase-adminsdk-1yr5j-d1f372486a.json");
const admin = require("firebase-admin");
const cookieParser = require('cookie-parser')

const app = express();
app.use(cors({ origin: true }))
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

let port = process.env.PORT || 3000;
// const functions = require('firebase-functions');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://newtoneinstruments-default-rtdb.asia-southeast1.firebasedatabase.app"
});

app.get('/', (req, res) => { res.send("CLAIMS!") })

app.post("/setAdminClaim", (req, res) => {
  // Get the ID token passed.
  const idToken = req.body.idToken;
  // Verify the ID token and decode its payload.
  admin.auth()
    .verifyIdToken(idToken)
    .then((claims) => {
      // Verify user is eligible for additional privileges.
      if (
        typeof claims.email !== "undefined" &&
        typeof claims.email_verified !== "undefined" &&
        claims.email.endsWith("@gmail.com")
      ) {
        // Add custom claims for additional privileges.
        admin.auth()
          .setCustomUserClaims(claims.sub, {
            admin: true,
          })
          .then(function () {
            // Tell client to refresh token on user.
            res.end(
              JSON.stringify({
                status: "success",
              })
            );
          });
      } else {
        // Return nothing.
        res.end(JSON.stringify({ status: "ineligible" }));
      }
    });
});

app.post("/setUserData", (req, res) => {
  const user = req.body.user;

  auth()
    .updateUser(user.uid, {
      email: user.email,
      phoneNumber: user.phone,
      displayName: user.displayName,
      photoURL: user.photoURL,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully updated user', userRecord.toJSON());
    })
    .catch((error) => {
      console.log('Error updating user:', error);
    });
})


app.post("/deleteUser", (req, res) => {
  const user = req.body.user;
  auth()
    .deleteUser(user.uid)
    .then(() => {
      console.log('Successfully deleted user');
    })
    .catch((error) => {
      console.log('Error deleting user:', error);
    });
})

app.listen(port, () => console.log(`Server Connected on port ${port}`));
