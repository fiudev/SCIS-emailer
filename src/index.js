const dotENV = require("dotenv").config();
const Parser = require("rss-parser");
const mjml = require("mjml");
const nodemailer = require("nodemailer");
const moment = require("moment");

const express = require("express");
const app = express();
const fetch = require("node-fetch");

app.use(express.static("public"));
const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.set("view engine", "ejs");

const email = process.env.MAIL_EMAIL;
const password = process.env.MAIL_PASSWORD;
const jobsAPI = process.env.JOBS_API;
<<<<<<< HEAD
const scisAPI = process.env.SCIS_API;
=======
const scisAPI = process.env.SCIS_API
>>>>>>> 72c847fbe1fb49c8faa46244929055f9fb6d70b6

const parser = new Parser({
  customFields: {
    item: [
      [
        "media:content",
        "media:content",
        {
          keepArray: true
        }
      ]
    ]
  }
});

let SCIS = {
  emailTo: "test@fiu.edu",
  emailFrom: "test@fiu.edu",
  eventWeek: 14,
  saveDate: 30,
  title: "School of Computing and Information Sciences",
  cover: "https://www.cis.fiu.edu/wp-content/uploads/2019/10/scis-newsletter-cover-10242019.png",
  link: "https://www.cis.fiu.edu/events",
  calendar_url: "https://calendar.fiu.edu/department/computing_information_sciences/calendar/xml",
  date: moment().format("dddd, MMMM Do YYYY")
};

const CEC = {
  title: "College of Engineering",
  cover: "https://www.cis.fiu.edu/wp-content/uploads/2019/07/1-update-CEC-Email-Newsletter-header-min.jpg",
  link: "https://cec.fiu.edu/",
  calendar_url: "https://calendar.fiu.edu/department/cec/calendar/xml"
};

const Test = {
  title: "Test",
  cover: "http://news.fiu.edu/wp-content/uploads/FIU-campus-2016-000px.jpg",
  link: "https://fiu.edu",
  calendar_url: "https://calendar.fiu.edu/department/onestop/calendar/xml"
};

const calendar = SCIS;

/**
 *
 * @param {string} url
 */

async function parseURL(calendar) {
  const feed = await parser.parseURL(calendar.calendar_url);
  const {
    items: events
  } = feed;

  const date = new Date();
  const today = date.getDate();
  const nextweek = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 14
  );

  const promises = events.map(async event => {
    const {
      date,
      title,
      contentSnippet,
      link
    } = event;

    const datetime = new Date(date);
    const media = event["media:content"][0]["$"].url;

    // console.log("List Event for 2 weeks: " + event);

    let snippet = contentSnippet
      .replace(/(<([^>]+)>)/gi, "")
      .replace(/(\r\n|\n|\r)/gm, "")
      .substring(0, 200);

    return {
      date: datetime,
      title,
      snippet,
      link,
      media
    };
  });

  let results = await Promise.all(promises);

  // Remove duplicate objects from the array of post
  function getUnique(results, comp) {
    const unique = results
      .map(e => e[comp])
      // store the keys of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)
      // eliminate the dead keys & store unique objects
      .filter(e => results[e])
      .map(e => results[e]);

    return unique;
  }
  // Remove objects by date range
  index = results.filter(function (obj) {
    return obj.date <= nextweek;
  });

  // Save the Date: Remove objects by date range
  reindex = results.filter(function (obj) {
    return obj.date > nextweek;
  });

  //Console log the run date
  console.log("2week date: " + nextweek);

  // Return First Set of Events Before and all the rest after
  return {
    before: getUnique(index, "link"),
    after: getUnique(reindex, "link")
  };
}

// GET Career Path REST API
async function jobsData(jobsAPI) {
  let res = await fetch(jobsAPI);
  let data = await res.json();
  return data;
}

<<<<<<< HEAD
// Get SCIS Rest API
async function articleData(scisAPI) {
  let res = await fetch(scisAPI);
  let data = await res.json();
  return data;
}

// Using MJML to format HTML Email
function formatHTML(events, calendar, articles, jobs) {
  const { html } = mjml(
=======
// GET SCIS REST API
async function scisData(scisAPI) {
  let res = await fetch(scisAPI);
  let post = await res.json();
  return post;
}

// Using MJML to format HTML Email
function formatHTML(events, jobs, calendar, posts) {
  const {
    html
  } = mjml(
>>>>>>> 72c847fbe1fb49c8faa46244929055f9fb6d70b6
    `
  <mjml>
    <mj-body width="700px">
       
        <mj-section padding="0px" margin="0px" >
          <mj-column width="100%">
            <mj-image src=${
              calendar.cover
            } alt="header image" fluid-on-mobile="true" padding="0px"></mj-image>
          </mj-column>
        </mj-section>

        <mj-section background-color='#fff'>
	  <mj-column>
	    <mj-text align="center" font-size="21px" font-weight="500" color="#030303" padding="0 15px">${
        calendar.date
      }</mj-text>
	  </mj-column>
        </mj-section>

        <mj-section background-color="#fafafa"> 
          <mj-column width="600px" background-color="#FFF">
            
            ${events.before.map(
              event =>
                `
              <mj-section>
                <mj-raw>
                  <!-- Left image -->
                </mj-raw>
                <mj-column align="center">
                  <mj-image width="200px" src=${event.media} align="center" fluid-on-mobile="true"></mj-image>
                </mj-column>
                <mj-raw>
                  <!-- right paragraph -->
                </mj-raw>
                <mj-column>
                  <mj-text font-size="20px" font-weight="500" font-family="Helvetica Neue" color="#081D3F">
                    ${event.title}
                  </mj-text>
                  <mj-text font-family="Helvetica Neue" color="#626262" font-size="14px" >${event.snippet}...</mj-text>
                  <mj-text color="#081D3F"><a href=${event.link}>
                  Read more..</a></mj-text>
              <mj-spacer height="0px" />
                </mj-column>
              </mj-section>
              <mj-divider border-color="#081E3F" border-style="solid" border-width="1px" padding-left="100px" padding-right="100px" padding-bottom="5px" padding-top="5px"></mj-divider>
              `
            )}
		
	    <mj-section background-color="#081D3F">
            <mj-text font-size="22px" font-weight="500" color="#fff" align="center">
                  News Highlights
              </mj-text>
            </mj-section>


        <mj-section background-color="#fafafa">
          <mj-column width="600px" background-color="#FFF">

            ${articles.map(
              article =>
                `
              <mj-section>
                <mj-raw>
                  <!-- Left image -->
                </mj-raw>
                <mj-column align="center">
                  <mj-image width="200px" src=${article.featured_image_urls.medium} align="center" fluid-on-mobile="true"></mj-image>
                </mj-column>
                <mj-raw>
                  <!-- right paragraph -->
                </mj-raw>
                <mj-column>
                  <mj-text font-size="20px" font-weight="500" font-family="Helvetica Neue" color="#081D3F">
                    ${article.title.rendered}
                  </mj-text>
                  <mj-text font-family="Helvetica Neue" color="#626262" font-size="14px" >${article.excerpt.rendered}...</mj-text>
                  <mj-text color="#081D3F"><a href=${article.link}>
                  Read more..</a></mj-text>
              <mj-spacer height="0px" />
                </mj-column>
              </mj-section>
              <mj-divider border-color="#081E3F" border-style="solid" border-width="1px" padding-left="100px" padding-right="100px" padding-bottom="5px" padding-top="5px"></mj-divider>
              `
            )}


	

            <mj-section background-color="#081D3F">
            <mj-text font-size="22px" font-weight="500" color="#fff" align="center">
                  News Highlights
              </mj-text>
            </mj-section>

            <mj-section background-color="#fafafa"> 
            <mj-column width="600px" background-color="#FFF">
              
              ${posts.map(
                post =>
                  `
                <mj-section>
                  <mj-raw>
                    <!-- Left image -->
                  </mj-raw>
                  <mj-column align="center">
                    <mj-image width="200px" src=${post.featured_image_urls.medium} align="center" fluid-on-mobile="true"></mj-image>
                  </mj-column>
                  <mj-raw>
                    <!-- right paragraph -->
                  </mj-raw>
                  <mj-column>
                    <mj-text font-size="20px" font-weight="500" font-family="Helvetica Neue" color="#081D3F">
                      ${post.title.rendered}
                    </mj-text>
                    <mj-text font-family="Helvetica Neue" color="#626262" font-size="14px" >${post.excerpt.rendered}...</mj-text>
                    <mj-text color="#081D3F"><a href=${post.link}>
                    Read more..</a></mj-text>
                <mj-spacer height="0px" />
                  </mj-column>
                </mj-section>
                <mj-divider border-color="#081E3F" border-style="solid" border-width="1px" padding-left="100px" padding-right="100px" padding-bottom="5px" padding-top="5px"></mj-divider>
                `
              )}

            <mj-section background-color="#081D3F">
            <mj-text font-size="22px" font-weight="500" color="#fff" align="center">
                  Save the Date
              </mj-text>
            </mj-section>
 
	          <mj-raw>
              <ul>
            </mj-raw>
            ${events.after.map(
              event =>
                `
             <mj-text align="center" font-size="15px" font-weight="500" font-family="Helvetica Neue" color="#081D3F">
               <li> <a href=${event.link}> ${event.title} </a></li>
             </mj-text>
	          <mj-spacer height="2px" />  
            `
            )}
	    <mj-raw>
	      </ul>
	    </mj-raw> 

	<mj-section background-color="#081D3F">
	  <mj-text font-size="22px" font-weight="500" color="#fff" align="center">
                Career Path
          </mj-text>
	</mj-section>
    
    <mj-section>
      <mj-column width="600px" background-color="#FFF">
      ${jobs.map(
        job => `
        <mj-text font-size="15px" font-weight="600" color="#000" align="center">
          <a href="${job.link}">${job.title.rendered}</a>
        </mj-text>
        <mj-text font-size="14px" color="#000">
          ${job.content.rendered}
        </mj-text>
        <mj-text>
          <a href="${job.link}">Learn More...</a>
        </mj-text>
          <mj-spacer height="2px" />
        <mj-divider border-color="#F8C93E"></mj-divider>
        `
      )}
      </mj-column>
    </mj-section>

           <mj-section background-color="#fff">
              <mj-text align="center" font-size="15px" font-weight="300" font-family="Helvetica Neue" color="#000">
               Do you want to add your events and activities to this newsletter? <a href="http://bit.ly/FIU-Create-Event">Click here </a>to submit now!
              </mj-text>
            </mj-section>

              <!-- Copy Right -->
              <mj-section background-color="#fff"> 
                 <mj-text font-size="12px" font-weight="200" color="#000" align="center">
                   Copyright © 2019, FIU School of Computing and Information Sciences, All rights reserved.
                 </mj-text>
               </mj-section>

	<mj-raw>
	<!-- Google Analytics  -->
	  <img src="https://www.google-analytics.com/collect?v=1&tid=UA-72593959-1&cid=555&aip=1&t=event&ec=email&ea=open&dp=%2Femail%2Fnewsletter&dt=fiuwsn10242019">
	</mj-raw>

    </mj-body>
  </mjml>
`, {
      beautify: true
    }
  );

  return html;
}

async function mail(html) {
  //Local Server
  const transporter = nodemailer.createTransport({
    host: "smtp.cs.fiu.edu",
    port: 25
  });

  // Gmail Version
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: email,
  //     pass: password
  //   }
  // });

  await transporter.sendMail({
    from: email,
    to: process.env.TO_EMAIL,
    subject: "FIUSCIS Events Newsletter",
    html
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });
}

async function main() {
  const events = await parseURL(calendar).catch(console.error);
  const jobs = await jobsData(jobsAPI).catch(console.error);
<<<<<<< HEAD
  const articles = await articleData(scisAPI).catch(console.error);

=======
  const posts = await scisData(scisAPI).catch(console.error);
>>>>>>> 72c847fbe1fb49c8faa46244929055f9fb6d70b6

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
  // Dashboard End

<<<<<<< HEAD
  const html = formatHTML(events, jobs, articles,  calendar);
=======
  const html = formatHTML(events, jobs, calendar, posts);
>>>>>>> 72c847fbe1fb49c8faa46244929055f9fb6d70b6
  //console.log(html);

  await mail(html).catch(console.error);
}

main();
