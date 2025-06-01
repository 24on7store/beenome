let currentUser = { name: "", gender: "" };
let currentSelection = null;
let questions = [];

const maleQuestions = [
  "Even numbers for men",
  "I chase intensity, even when it hurts a little.",
  "Clean starts speak louder than perfect plans.",
  "I tend to stand taller when the light finds me.",
  "Change doesn't scare me when it comes in soft colors.",
  "I bloom where I am least expected.",
  "There’s beauty in being more than what meets the eye.",
  "I often speak in colors, not in noise.",
  "Joy should be loud and bold.",
  "I thrive when the days grow shorter.",
  "You won’t notice me first, but you’ll remember me last."
];

const femaleQuestions = [
  "Odd for women.",
  "Some things are worth holding, even if they come with a sting.",
  "I find strength in stillness and softness.",
  "Joy feels like something I naturally lean toward.",
  "My heart opens in seasons, never all at once.",
  "I like the little things that smile back at you.",
  "My peace often comes in silence.",
  "If I could bottle calmly, I’d wear it every day.",
  "Soft doesn't mean simple.",
  "I’d rather whisper than echo.",
  "Quiet presence is still presence.",
  "Elegance, to me, is how you carry silence.",
  "Strength wrapped in calm is still strength.",
  "I live like summer never ends.",
  "I prefer moments that sizzle, not simmer.",
  "I open up when the world begins to close.",
  "Every beginning has its own courage.",
  "I like being first — not for glory, but for hope.",
  "My impact lingers even when I’ve left."
];

function startQuestions() {
  const gender = document.getElementById("genderSelect").value;
  const name = document.getElementById("nameInput").value.trim();

  if (!gender || !name) {
    alert("Please select your gender and enter your name.");
    return;
  }

  currentUser.gender = gender;
  currentUser.name = name;
  questions = gender === "male" ? maleQuestions : femaleQuestions;

  const list = document.getElementById("questionList");
  list.innerHTML = "";

  questions.forEach((q, i) => {
    const li = document.createElement("li");
    li.textContent = q;
    li.dataset.index = i;
    li.addEventListener("click", selectQuestion);
    list.appendChild(li);
  });

  document.getElementById("introContainer").classList.add("hidden");
  document.getElementById("questionContainer").classList.remove("hidden");
}

function selectQuestion(event) {
  if (currentSelection) currentSelection.classList.remove("selected");
  currentSelection = event.currentTarget;
  currentSelection.classList.add("selected");
}

function submitAnswer() {
  if (!currentSelection) {
    alert("Please select a sentence before submitting.");
    return;
  }

  const index = parseInt(currentSelection.dataset.index);
  const answerText = questions[index];

  const response = {
    name: currentUser.name,
    gender: currentUser.gender,
    answerIndex: index,
    answerText: answerText,
    timestamp: new Date().toISOString()
  };

  try {
    if (window.db && firebase?.firestore) {
      db.collection("responses").add(response)
        .then(() => {
          console.log("Saved to Firebase.");
          saveAsTextFile(response);
          afterSubmit();
        })
        .catch(err => {
          console.warn("Firebase error. Saving locally and as file.", err);
          saveLocally(response);
          saveAsTextFile(response);
          afterSubmit();
        });
    } else {
      saveLocally(response);
      saveAsTextFile(response);
      afterSubmit();
    }
  } catch (e) {
    console.error("Unexpected error", e);
    saveLocally(response);
    saveAsTextFile(response);
    afterSubmit();
  }
}

function afterSubmit() {
  document.querySelectorAll('#questionList li').forEach(li => {
    li.classList.add("disabled");
    li.removeEventListener("click", selectQuestion);
  });

  document.getElementById("questionContainer").classList.add("hidden");
  document.getElementById("resultContainer").classList.remove("hidden");
}

function saveLocally(response) {
  const existing = JSON.parse(localStorage.getItem("responses") || "[]");
  existing.push(response);
  localStorage.setItem("responses", JSON.stringify(existing));
}

function saveAsTextFile(response) {
  const content = `
Name: ${response.name}
Gender: ${response.gender}
Answer Index: ${response.answerIndex}
Answer: ${response.answerText}
Time: ${response.timestamp}
-------------------------------
`;

  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${response.name.replace(/\s+/g, '_')}_response.txt`;
  a.click();
}
