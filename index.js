const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

var admin = require("firebase-admin");
var serviceAccount = require("./shorten-53485-firebase-adminsdk-j86d2-96db561ffd.json");
const { response } = require("express");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const static = express.static("public");

const urlsdb = admin.firestore().collection("urlsdb");
const usersdb = admin.firestore().collection("usersdb");

app.use(static);
app.use(bodyParser.json());

// app.use((req, res, next) => {
//     console.log("We intercepted the req");
//     next();
// })

app.get("/:short", (req, res) => {
    console.log(req.params);
    const short = req.params.short;

    const doc = urlsdb.doc(short);

    doc.get().then(response => {
        const data = response.data();
        if(data && data.url){
            res.redirect(301, data.url);
        } else {
            res.redirect(301, "https://codeforcause.org");
        }
    })

    // res.send("We will redirect you to " + short)
});

app.post("/admin/urls/", (req, res) => {
    const {email, password, short, url} = req.body;

    usersdb.doc(email).get().then(response=>{
        const user = response.data();
        // console.log(user);

        if(user && (user.email == email) && (user.password == password)){
            const doc = urlsdb.doc(short);
            doc.set({url});
            res.send("Done")
        } else {
            res.send(403, "Not possible")
        }
    })
  
//   res.send("Hello from another!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});