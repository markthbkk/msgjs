let last24Hours = new Date(new Date().setHours(new Date().getHours() - 24));


let year = last24Hours.getUTCFullYear();
let month = last24Hours.getUTCMonth() + 1;
let date = last24Hours.getUTCDate();
let hours = last24Hours.getUTCHours();
let minutes = last24Hours.getUTCMinutes();
let seconds = last24Hours.getUTCSeconds();

date < 10 ? (date = "0" + date) : (date = date);
month < 10 ? (month = "0" + month) : (month = month);
hours < 10 ? (hours = "0" + hours) : (hours = hours);
minutes < 10 ? (minutes = "0" + minutes) : (minutes = minutes);
seconds < 10 ? (seconds = "0" + seconds) : (seconds = seconds);

last24HoursTimeStamp = `${year}-${month}-${date}T${hours}:${minutes}:${seconds}Z`


// const yyyy = last24Hours.getFullYear();
// let mm = last24Hours.getMonth() + 1;
// let dd = last24Hours.getDate();

// if (dd < 10) { dd = "0" + dd}
// if (mm < 10) { mm = "0" + mm }

// const formattedLast24Hours = yyyy + "-" + mm + "-" + dd;

// const oneDayAgo = new Date().getTime() - (1 * 24 * 60 * 60 * 1000)

// const oneDayAgoDateTime = new Date(oneDayAgo)

let chulaFolder

// Create an authentication provider
const authProvider = {
  getAccessToken: async () => {
    // Call getToken in auth.js
    return await getToken();
  },
};
// Initialize the Graph client
const graphClient = MicrosoftGraph.Client.initWithMiddleware({ authProvider });
//Get user info from Graph
async function getUser() {
  ensureScope("user.read");
  return await graphClient.api("/me").select("id,displayName").get();
}

let messagesTotal = new Array(0);

let topLevelFolders = new Array(0);

let RMUTRFolderId;



async function getTopLevelFolders() {
  ensureScope("mail.read");
  const healthCheckFolder = await graphClient
    .api("/me/mailFolders/")
    .filter("displayName eq 'Health Checks'")
    .select("displayName")
    .get();

  const healthCheckFolderId = healthCheckFolder.value[0].id;

    async function getChulaFolder() {
     
return await graphClient
  .api(`/me/mailFolders/${healthCheckFolderId}/childFolders`)
  .filter("displayName eq 'Chula'")
  .select("displayName")
  .get();

        

 }

  chulaFolder = await getChulaFolder()

  //   console.log(`RMUTR: ${RMUTRFolderId}`);

  const healthCheckSubFolders = await graphClient
    .api(`/me/mailFolders/${healthCheckFolderId}/childFolders`)
    .select("displayName")
    .get();

console.log(healthCheckSubFolders.value);
  healthCheckSubFolders.value.forEach((el) => topLevelFolders.push(el.id));

  return topLevelFolders;
}



    async function getTempFolders (fldr) {
       
        if (fldr) {
            // console.log(fldr);
            return await graphClient
              .api(`/me/mailFolders/${fldr}/childFolders?$top=100`)
              .select("displayName")
                .get()
            
           

        }
    }

async function getMessages(mailFldr) {

  console.log(last24HoursTimeStamp);
    
            return await graphClient
              .api(`/me/mailFolders/${mailFldr.id}/messages?$top=5`)
              .filter(`receivedDateTime ge ${last24HoursTimeStamp}`)
              .select("sender,subject,weblink,receivedDateTime")
              .get();
    
   
        
}

//   messagesTemp.value.forEach((msg) => {
//     console.log(msg);

//     messagesTotal.push(msg);
//   });
// });

// return messagesTotal;


// }

    
