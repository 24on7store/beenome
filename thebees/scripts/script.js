const questions = [
  "1- Some things are worth holding, even if they come with a sting.",
  "1- Already Chosen",
  "2- Clean starts speak louder than perfect plans.",
  "2- I find strength in stillness and softness.",
  "3- I tend to stand taller when the light finds me.",
  "3- Joy feels like something I naturally lean toward.",
  "4- Change doesn't scare me when it comes in soft colors.",
  "4- My heart opens in seasons, never all at once.",
  "5- I like the little things that smile back at you.",
  "5-I’m happiest when the world feels light and playful.",
  "6- My peace often comes in silence.",
  "6- If I could bottle calm, I’d wear it every day.",
  "7- Already Chosen.",
  "7- Already Chosen.",
  "8- There’s beauty in being more than what meets the eye.",
  "8- Soft doesn't mean simple.",
  "9- I often speak in colors, not in noise.",
  "8- Messages feel better when they’re subtle but sure.",
  "10- My warmth doesn't wait for an invitation.",
  "10- Joy should be loud and bold.",
  "11- I protect my softness like a secret.",
  "11- Gentle doesn’t mean fragile.",
  "12- I’d rather whisper than echo.",
  "12- Quiet presence is still presence.",
  "13- Elegance, to me, is how you carry silence.",
  "13- Strength wrapped in calm is still strength.",
  "14- I live like summer never ends.",
  "14- I prefer moments that sizzle, not simmer.",
  "15- I open up when the world begins to close.",
  "15- I thrive when the days grow shorter.",
  "16- Every beginning has its own courage.",
  "6- I like being first — not for glory, but for hope.",
  "17- Already Chosen.",
  "17- My impact lingers even when I’ve left."
];

let chosenAnswers = new Set();
let currentSelection = null;
let currentUser = {};

document.getElementById('gender').addEventListener('change', function () {
  if (this.value) {
    document.getElementById('nameInput').style.display = 'block';
  }
});

function startQuestions() {
  const gender = document.getElementById('gender').value;
  const name = document.getElementById('name').value.trim();

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  currentUser = { name, gender };
  document.getElementById('form').style.display = 'none';
  document.getElementById('questionContainer').style.display = 'block';

  loadQuestions(gender);
}

function loadQuestions(gender) {
  const list = document.getElementById('questionList');
  list.innerHTML = "";

  const isMale = gender === 'male';

  questions.forEach((text, index) => {
    const questionNumber = index + 1;
    const isEligible = isMale ? questionNumber % 2 === 0 : questionNumber % 2 !== 0;

    if (isEligible) {
      const li = document.createElement('li');
      li.textContent = text;
      li.dataset.index = index;

      if (chosenAnswers.has(index)) {
        li.classList.add('disabled');
      } else {
        li.addEventListener('click', () => selectQuestion(li));
      }

      list.appendChild(li);
    }
  });
}

function selectQuestion(li) {
  if (li.classList.contains('disabled')) return;

  if (currentSelection) {
    currentSelection.classList.remove('selected');
  }

  li.classList.add('selected');
  currentSelection = li;
}

function submitAnswer() {
  if (!currentSelection) {
    alert("Please select a sentence before submitting.");
    return;
  }

  const index = parseInt(currentSelection.dataset.index);
  chosenAnswers.add(index);

  const answerText = questions[index];
  const timestamp = new Date().toLocaleString();

  // Google Sheets endpoint (replace with yours)
  const sheetURL = 'https://script.google.com/macros/s/AKfycbxk4k7yQQXEJO80pPK7RK9wbo32q1qs-wwylmmK_b7yZXKtu00wbMmPBsqby1tq2lMI/exec';

  // Save to Google Sheet
  fetch(sheetURL, {
    method: 'POST',
    body: JSON.stringify({
      name: currentUser.name,
      gender: currentUser.gender,
      index: index,
      answer: answerText,
      time: timestamp
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log("Data saved to Google Sheet:", data);
  })
  .catch(error => {
    console.error("Error saving to Google Sheet:", error);
  });

  // Disable UI
  document.querySelectorAll('#questionList li').forEach(li => {
    li.classList.add('disabled');
    li.removeEventListener('click', selectQuestion);
  });

  document.getElementById('questionContainer').style.display = 'none';
  document.getElementById('resultContainer').style.display = 'block';
}


function submitAnswer() {
  if (!currentSelection) {
    alert("Please select a sentence before submitting.");
    return;
  }

  const index = parseInt(currentSelection.dataset.index);
  chosenAnswers.add(index);

  const answerText = questions[index];
  const timestamp = new Date().toLocaleString();

  // ✅ Send data to Google Sheet via Apps Script Web App
  fetch('https://script.google.com/macros/s/AKfycbxk4k7yQQXEJO80pPK7RK9wbo32q1qs-wwylmmK_b7yZXKtu00wbMmPBsqby1tq2lMI/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: currentUser.name,
      gender: currentUser.gender,
      answer: answerText,
      index: index,
      time: timestamp
    })
  });

  console.log(`Saved: ${currentUser.name} (${currentUser.gender}) → "${answerText}"`);

  // Disable all options and end session
  document.querySelectorAll('#questionList li').forEach(li => {
    li.classList.add('disabled');
    li.removeEventListener('click', selectQuestion);
  });

  document.getElementById('questionContainer').style.display = 'none';
  document.getElementById('resultContainer').style.display = 'block';
}
