async function displayUI() {
  await signIn();

  // Display info from user profile
  const user = await getUser();

  // console.log(user);
  var userName = document.getElementById("userName");
  userName.innerText = user.displayName;

  // Hide login button and initial UI
  var signInButton = document.getElementById("signin");
  signInButton.style = "display: none";

  const button = document.getElementById("button");

  button.classList.toggle("button-hidden");

  var content = document.getElementById("content");
  content.style = "display: block";
}



const messageDataDiv = document.getElementById("mailData");

const showAllButton = document.getElementById("showAllButton");

messageDataDiv.style = "display: block";

async function retrieveTLFs() {
  const tlfArray = await getTopLevelFolders();

  console.log(tlfArray);

  return tlfArray;
}

async function retrieveTempFolders(tlfArray) {
  let targetFolders = new Array(0);

  let tempFolderArray = new Array(0);

  async function buildTempFolderArray() {
    tlfArray.forEach(async function (tlf) {
      const tempArray = await getTempFolders(tlf);

      console.log(tempArray.value);

      tempArray.value.forEach(function (el) {
        tempFolderArray.push(el);
      });
    });

    return tempFolderArray;
  }

  async function buildTargetFolderArray() {
    const tempFolderArray = await buildTempFolderArray();

    tempFolderArray.forEach((el) => {
      targetFolders.push(el);
    });

    const RMUTRFolder = await graphClient
      .api("/me/mailFolders/")
      .filter("displayName eq 'RMUTR'")
      .select("displayName")
      .get();
    RMUTRFolder = RMUTRFolder.value[0];

    targetFolders.push(RMUTRFolder);

    console.log(chulaFolder.value[0]);

    // console.log(targetFolders.length)

    return targetFolders;
  }

  // const targetFolderArray = await buildTargetFolderArray();

  // return targetFolderArray

  return await buildTargetFolderArray();
}

async function retrieveTargetFolders() {
  const tlfArray = await retrieveTLFs();

  //   console.log(tlfArray);

  // const targetArray = await retrieveTempFolders(tlfArray);

  // console.log(targetArray);

  const limitedTarget0 = await getTempFolders(tlfArray[0]);

  // console.log(limitedTarget0.value);

  const limitedTarget1 = await getTempFolders(tlfArray[1]);

  // console.log(limitedTarget1.value);

  // const limitedTarget2 = await getTempFolders(tlfArray[2]);

  // console.log(limitedTarget2.value);

  const combinedTargets = [
    ...limitedTarget0.value,
    ...limitedTarget1.value,
    // ...limitedTarget2.value,
  ];

  const RMUTRFolder = await graphClient
    .api("/me/mailFolders/")
    .filter("displayName eq 'RMUTR'")
    .select("displayName")
    .get();
  const RMUTRFolderId = RMUTRFolder.value[0];

  combinedTargets.push(RMUTRFolderId);

  // const chulaFolder = await graphClient
  //   .api("/me/mailFolders/")
  //   .filter("displayName eq 'Chula'")
  //   .select("displayName")
  //     .get();

  // console.log(chulaFolder)

  combinedTargets.push(chulaFolder.value[0]);

  console.log(combinedTargets);

  return combinedTargets;
}

// async function retrieveMessages() {
//   console.log("Start");
async function retrieveTargetFolderList() {
  const targetFolderArray = await retrieveTargetFolders();

  return targetFolderArray;
}



async function buildHTMLMessageDivsInputArray() {
  const targetFolderArray = await retrieveTargetFolderList();

  // console.log(targetFolderArray.length);

  let allMessagesArray = new Array(0);

  let count = 0;

  console.log(count);

  targetFolderArray.forEach(async function (fldr) {
    console.log(count);

    let msgObj = {};
    let thisFolderMessages = await getMessages(fldr);

    console.log(fldr.displayName);

    if (thisFolderMessages.value.length > -1) {

      let tempMessagesArray = new Array(thisFolderMessages.value.length);

      console.log(tempMessagesArray);

      thisFolderMessages.value.forEach(function showMessageInfo(mail, index) {

        tempMessagesArray[index] = {}

        console.log(
          mail.subject,
          mail.sender.emailAddress.name,
          mail.receivedDateTime,
          mail.webLink
        );

        let recdDateTime = new Date(mail.receivedDateTime);

        let minutes = recdDateTime.getMinutes()
        if (minutes < 10) { minutes = `0${minutes}`}

        let recdDateTimeStr = `${recdDateTime.getDate()}/${
          recdDateTime.getMonth() + 1
        }/${recdDateTime.getFullYear()} ${recdDateTime.getHours()}:${minutes} `;
        // msgObj.subject = mail.subject;
        // msgObj.sender = mail.sender.emailAddress.name;
        // msgObj.receivedDateTime = recdDateTimeStr;
        // msgObj.webLink = mail.webLink;

        tempMessagesArray[index].subject = mail.subject;
        tempMessagesArray[index].sender = mail.sender.emailAddress.name;
        tempMessagesArray[index].receivedDateTime = recdDateTimeStr;
        tempMessagesArray[index].webLink = mail.webLink;

        console.log(tempMessagesArray[index]);

        allMessagesArray.push(tempMessagesArray[index]);


      });
      count = count + 1;
    }

    console.log(count);

    if (count === targetFolderArray.length) {
      buildHTMLMessageDivs(allMessagesArray);
    }
  });
}

let messageHTML = "";

function buildHTMLMessageDivs(finalMessagesArray) {
  console.log("Showing Message Data");

  console.log(finalMessagesArray);

  finalMessagesArray.forEach(function (message) {
    console.log(`MESSAGE: ${message.subject}`);

    messageHTML =
      messageHTML +
      `<div class="message" data-webLink=${message.webLink}>
          <div class="messageTitle">${message.subject}</div>
          <div class="messageDetails">
            <div class="messageSender">${message.sender}</div>
            <div class="messageReceivedDateTime">${message.receivedDateTime}</div>
          </div>
        </div>`;
  });

  console.log(messageHTML);

  button.classList.toggle("button-hidden");

  messageDataDiv.innerHTML = messageHTML;

  const messagesColl = document.getElementsByClassName("message")

  const messages = Array.from(messagesColl)

  messages.forEach(function (el) {

    console.log(el)
    el.addEventListener("click", function (e) {
      
      console.log(e.target.closest(".message").dataset.weblink)
      
      const messagePage = e.target.closest(".message").dataset.weblink;

      window.open(messagePage, '_blank').focus();
    
    })
  })

  showAllButton.addEventListener("click", openAllMessages())

  showAllButton.classList.toggle("button-hidden");
}

function openAllMessages() {
 
  const messagesColl = document.getElementsByClassName("message");

  const messages = Array.from(messagesColl);

  messages.forEach(function (msg) {
    
    const messagePage = msg.dataset.weblink;
    
    console.log(messagePage)

      window.open(messagePage, "_blank")
    });
  }



