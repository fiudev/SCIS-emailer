const express = require("express");
const app = express();

app.use(express.static("public"));
const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.set("view engine", "ejs");

// Dashboard Begins

/* Getting initial landing page*/
app.get("/", function (req, res) {
  res.render("index");
});
app.post("/logout", function (req, res) {
  res.redirect("/");
});

/* Getting Admin page */
app.get("/mainpage", function (req, res) {
  res.render("mainpage", {
    emailTo: SCIS.emailTo,
    emailFrom: SCIS.emailFrom,
    title: SCIS.title,
    link: SCIS.link,
    calendar_url: SCIS.calendar_url,
    cover: SCIS.cover,
    eventWeek: SCIS.eventWeek,
    saveTheDate: SCIS.saveDate
  });
});

/* Getting Admin page */
app.get("/specialevents", function (req, res) {
  res.render("specialevents");
});

/**Controls change for Calander */
app.post("/submitChanges", function (req, res) {
  for (let prop in req.body) {
    if (req.body[prop] != "") {
      if (prop === "eventWeek" || prop === "saveDate") {
        SCIS[prop] = Number(req.body[prop]);
      } else {
        SCIS[prop] = req.body[prop];
      }
    }
  }
  res.redirect("/mainpage");
});

/** Controls add special event */
app.post("/specialEvent", function (req, res) {
  console.dir(req.body);
  res.redirect("/specialevents");
});

/* Redirecting to admin page */
app.post("/", function (req, res) {
  console.log(req.body.email);
  console.log(req.body.password);
  //res.render('index');
  res.redirect("/mainpage");
});

/* Listening to port */
app.listen(3000, function () {
  console.log("Example app listening on port 3000");
});