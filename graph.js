let last24Hours = new Date(new Date().setHours(new Date().getHours() - 31));

const yyyy = last24Hours.getFullYear();
let mm = last24Hours.getMonth() + 1;
let dd = last24Hours.getDate();

if (dd < 10) dd = "0" + dd;
if (mm < 10) mm = "0" + mm;

const formattedLast24Hours = yyyy + "-" + mm + "-" + dd;

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

    
            return await graphClient
            .api(`/me/mailFolders/${mailFldr.id}/messages?$top=1`)
            .filter(`receivedDateTime ge ${formattedLast24Hours}`)
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

    
