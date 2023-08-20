const train = () => {
    const file = document.querySelector("input[name='file']").files[0];
    const fileName = file.name;

    const request = new Request(`http://localhost:8000/train/gpt/pdf`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            file: fileName,
        }),
    });

    fetch(request).then((response) => {
        if (response.ok) {
            console.log("Successfully trained the model");
        } else {
            console.log("Error training the model");
        }
    });
};

const msgerForm = document.querySelector(".msger-inputarea");
const msgerInput = document.querySelector(".msger-input");
const msgerChat = document.querySelector(".msger-chat");
const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "GPT";
const PERSON_NAME = "You";
msgerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const msgText = msgerInput.value;
    if (!msgText) return;

    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
    msgerInput.value = "";

    askGPT(msgText);
});

function appendMessage(name, img, side, text) {
    //   Simple solution for small apps
    const msgHTML = `
      <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})"></div>
  
        <div class="msg-bubble">
          <div class="msg-info">
            <div class="msg-info-name">${name}</div>
          </div>
  
          <div class="msg-text">${text}</div>
        </div>
      </div>
    `;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;
}

function askGPT(question) {
    const request = new Request("http://localhost:8000/ask/gpt/pdf", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            question: question,
        }),
    });

    fetch(request)
        .then((response) => response.json())
        .then((data) => {
            const responseText = data.message.text; // Access the "text" property
            appendMessage(BOT_NAME, BOT_IMG, "left", responseText);
        })
        .catch((error) => {
            console.error("Error asking GPT:", error);
        });
}
