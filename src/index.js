const dotENV = require('dotenv').config();
const Parser = require("rss-parser");
const mjml = require("mjml");
const nodemailer = require("nodemailer");
const moment = require("moment");

const email = process.env.MAIL_EMAIL;
const password = process.env.MAIL_PASSWORD;

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content", {
        keepArray: true
      }]
    ]
  }
});

const SCIS = {
  title: "School of Computing and Information Sciences",
  cover: "https://www.cis.fiu.edu/wp-content/uploads/2019/10/scis-newsletter-cover-10242019.png",
  link: "https://www.cis.fiu.edu/events",
  calendar_url: "https://calendar.fiu.edu/department/computing_information_sciences/calendar/xml",
  date: moment().format('dddd, MMMM Do YYYY')
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
      .filter(e => results[e]).map(e => results[e]);

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

  // console.log("2week date: " + nextweek);
  //console.log("Index: " + index);
  // console.log("Save the Date results: " + reindex);

  //console.log(getUnique(results, 'link'));
  //return getUnique(index, 'link')
  return {
    before: getUnique(index, 'link'),
    after: getUnique(reindex, 'link')
  }
}

// Using MJML to format HTML Email
function formatHTML(events, calendar) {
  const {
    html
  } = mjml(
    `
  <mjml>
    <mj-body width="700px">
       
        <mj-section>
          <mj-column width="100%">
            <mj-image src=${calendar.cover} alt="header image" fluid-on-mobile="true" padding="0px"></mj-image>
          </mj-column>
        </mj-section>

        <mj-section background-color='#fff'>
	  <mj-column>
	    <mj-text align="center" font-size="21px" font-weight="500" color="#030303" padding="0 15px">${calendar.date}</mj-text>
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
                  <mj-image width="200px" src=${
                    event.media
                  } align="center" fluid-on-mobile="true"></mj-image>
                </mj-column>
                <mj-raw>
                  <!-- right paragraph -->
                </mj-raw>
                <mj-column>
                  <mj-text font-size="20px" font-weight="500" font-family="Helvetica Neue" color="#081D3F">
                    ${event.title}
                  </mj-text>
                  <mj-text font-family="Helvetica Neue" color="#626262" font-size="14px" >${
                    event.snippet
                  }...</mj-text>
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

                <mj-text font-size="15px" font-weight="600" color="#000" align="center">
                        <a href="https://careerpath.cis.fiu.edu/job/center-for-advancing-education-and-studies-on-critical-infrastructures-resilience-caescir-fiu-mmc-28-caescir-hs-stem-fellow/">CAESCIR HS-STEM Fellow</a>
                </mj-text>
                <mj-text font-size="14px" color="#000">
                    Florida International University’s Center for Advancing Education and Studies on Critical Infrastructures Resilience (CAESCIR) is funded by a Scientific Leadership Award granted by the United States Department of Homeland Security. CAESCIR aims to improve our nation’s critical infrastructures security and resilience via an integrated research and education framework that covers Homeland Security Science, Technology, Engineering, and Mathematics (HS- STEM) areas of interest in computer science, information technology, and cybersecurity.
                </mj-text>
                <mj-text>
                        <a href="https://careerpath.cis.fiu.edu/job/center-for-advancing-education-and-studies-on-critical-infrastructures-resilience-caescir-fiu-mmc-28-caescir-hs-stem-fellow/">Learn More...</a>
                </mj-text>
                        <mj-spacer height="2px" />
                <mj-divider border-color="#F8C93E"></mj-divider>

                <mj-text font-size="15px" font-weight="600" color="#000" align="center">
                        <a href="https://careerpath.cis.fiu.edu/job/amepower-solutions-in-power-electronics-doral-florida-6-entry-level-computer-science-mobile-app-developer-co-op-fall2019-spring-2020/">Entry Level – Computer Science – Mobile App Developer CO-OP (Fall2019/Spring 2020)</a>
                </mj-text>
                <mj-text font-size="14px" color="#000">
                    AmePower CO-OP program cultivates technical problem-solving skills by developing different engineering projects driven by real AmePower business priorities. Experience and training combined with mentoring and guidance from assignment managers, prepare members with the technical skills and values needed to achieve a successful entry-level engineering career. Participants will have the opportunity to interact with different departments to learn towards engineering and other real-world closely related roles such as; Design, Quality, Production, Reliability, Customer Support, among other areas.
                </mj-text>
                <mj-text>
                        <a href="https://careerpath.cis.fiu.edu/job/amepower-solutions-in-power-electronics-doral-florida-6-entry-level-computer-science-mobile-app-developer-co-op-fall2019-spring-2020/">Learn More...</a>
                </mj-text>
                        <mj-spacer height="2px" />
                <mj-divider border-color="#F8C93E"></mj-divider>

                <mj-text font-size="15px" font-weight="600" color="#000" align="center">
                        <a href="https://careerpath.cis.fiu.edu/job/lc-neighborhood-it-miami-fl-5-computer-consultant/">Computer Consultant</a>
                </mj-text>
                <mj-text font-size="14px" color="#000">
                    LcNeighborhood-IT was founded with the intent of adding those with the need of computer repair services. Neighborhood-IT was founded in 2005 by  Mr. Leslie Calvo.

                    LcNeighborhood-IT has now grown to expand the service not only to the computer repair but as well to Data Recovery & Management, Implementation of private & public networks, Server installation & Web Design.
                </mj-text>
                <mj-text>
                        <a href="https://careerpath.cis.fiu.edu/job/lc-neighborhood-it-miami-fl-5-computer-consultant/">Learn More...</a>
                </mj-text>
                        <mj-spacer height="2px" />
                <mj-divider border-color="#F8C93E"></mj-divider>

                <mj-text font-size="15px" font-weight="600" color="#000" align="center">
                        <a href="https://careerpath.cis.fiu.edu/job/sharp-marketing-work-from-home-5-part-time-web-app-developer/">Part Time Web App Developer</a>
                </mj-text>
                <mj-text font-size="14px" color="#000">
                  Sharp Marketing is seeking a skilled Web Developer who will be responsible for the creation of a Software-as-a-Service (SAAS) solution that will be used for companies in our industry. The software is meant for a B2B audience and is related to the collection and management of tax certificates.

                  To succeed in this role, you will need to be proficient in HTML 5, CSS, WordPress, Database Management and have solid knowledge in programming applications. You will also need to be able to meet strict milestone deliverables that will be mutually agreed upon the beginning of the project.
                </mj-text>
                <mj-text>
                        <a href="https://careerpath.cis.fiu.edu/job/sharp-marketing-work-from-home-5-part-time-web-app-developer/">Learn More...</a>
                </mj-text>
			<mj-spacer height="2px" />
                <mj-divider border-color="#F8C93E"></mj-divider>

             
               <mj-text font-size="15px" font-weight="600" color="#000" align="center">
                  <a href="https://careerpath.cis.fiu.edu/job/american-express-company-phoenix-az-ft-lauderdale-fl-and-new-york-ny-6-campus-undergraduate-2020-technology-software-engineering-internship/">Campus Undergraduate – 2020 Technology Software Engineering Internship</a>
                </mj-text>
                <mj-text font-size="14px" color="#000">
                        Join our 10 week paid summer internship program where you will have opportunities for development, networking and also engage with our Executives. A summer internship at American Express will give you the chance to influence and strengthen the core businesses across the organization.

                        Interns are a member of a product engineering or delivery and integration team. We will place you on a scrum team where you will collaborate with colleagues and our business partners. So if you are dedicated to the newest technology and motivating others, start your career here.
                </mj-text>
                <mj-text>
                <mj-text>
                    <a href="https://careerpath.cis.fiu.edu/job/american-express-company-phoenix-az-ft-lauderdale-fl-and-new-york-ny-6-campus-undergraduate-2020-technology-software-engineering-internship/">Learn More...</a>
                </mj-text>  

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
  const transporter = nodemailer.createTransport({
    host: "smtp.cs.fiu.edu",
    port: 25,
  });

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

  const html = formatHTML(events, calendar);
  await mail(html).catch(console.error);
}

main();
