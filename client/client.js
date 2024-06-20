const ws = new WebSocket("ws://localhost:3009");
ws.binaryType = "blob";

ws.addEventListener("open", (event) => {
  console.log("Websocket connection opened");
});

ws.addEventListener("close", (event) => {
  console.log("Websocket connection closed");
});

ws.addEventListener("message", (event) => {
  console.log("Message from server: ", event.data);
});

ws.onmessage = function (message) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("recievemessage");
  if (message.data instanceof Blob) {
    reader = new FileReader();
    reader.onload = () => {
      msgDiv.innerHTML = reader.result;
      document.getElementById("messages").appendChild(msgDiv);
    };
    reader.readAsText(message.data);
  }
};

const inputmessage = document.getElementsByClassName("messageInput")[0];
inputmessage.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const message = inputmessage.value;
    ws.send(message);
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("sendmessage");
    msgDiv.innerHTML = message;
    document.getElementById("messages").appendChild(msgDiv);
    inputmessage.value = "";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadParties();
});

async function loadParties() {
  try {
    const response = await fetch("http://localhost:3009/partiesList");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    countParties();
    const parties = await response.json();
    const partiesList = document.getElementById("parties-list");
    partiesList.innerHTML = "";

    parties.forEach((partie) => {
      const li = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = partie.status === "completed";
      checkbox.onchange = () => completePartie(partie.id);

      const span = document.createElement("span");
      span.textContent = `${partie.name} `;
      if (partie.status === "completed") {
        span.style.textDecoration = "line-through";
        span.style.color = "#ccc";
      }

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete";
      deleteButton.textContent = "✖";
      deleteButton.onclick = () => deletePartie(partie.id);

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteButton);

      partiesList.appendChild(li);
    });
  } catch (error) {
    console.error("Failed to load parties:", error);
  }
}

async function createPartie() {
  try {
    const name = document.getElementById("partie-name").value;
    if (name) {
      const response = await fetch("http://localhost:3009/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      document.getElementById("partie-name").value = "";
      loadParties();
    }
  } catch (error) {
    console.error("Failed to create partie:", error);
  }
}

async function completePartie(id) {
  try {
    const response = await fetch(
      `http://localhost:3009/parties/${id}/complete`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    loadParties();
  } catch (error) {
    console.error("Failed to complete partie:", error);
  }
}

async function deletePartie(id) {
  try {
    const response = await fetch(`http://localhost:3009/parties/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    loadParties();
  } catch (error) {
    console.error("Failed to delete partie:", error);
  }
}

async function countParties() {
  try {
    const activePartiesCountResponse = await fetch(
      "http://localhost:3009/activePartiesCount"
    );
    if (!activePartiesCountResponse.ok) {
      throw new Error("Failed to fetch active parties count");
    }
    const { activePartiesCount } = await activePartiesCountResponse.json();
    const activePartiesCountElement = document.getElementById(
      "active-parties-count"
    );
    activePartiesCountElement.textContent = `${activePartiesCount}`;
  } catch (error) {
    console.error("Failed to count not finishied parties:", error);
  }
}
