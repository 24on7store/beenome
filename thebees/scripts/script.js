const questions = [
  "1- Already Chosen.",
  "1- Already Chosen",
  "2- Already Chosen.",
  "2- Already Chosen.",
  "3- Already Chosen.",
  "3- Already Chosen.",
  "4- Already Chosen.",
  "4- Already Chosen.",
  "5- Already Chosen.",
  "5- Already Chosen.",
  "6- Already Chosen.",
  "6- Already Chosen.",
  "7- Already Chosen.",
  "7- Soft doesn't mean simple.",
  "8- Already Chosen.",
  "8- Already Chosen.",
  "9- I often speak in colors, not in noise.",
  "9- Messages feel better when they’re subtle but sure.",
  "10- Already Chosen.",
  "10- Already Chosen.",
  "11- Already Chosen.",
  "11- Already Chosen.",
  "12- Already Chosen.",
  "12- Already Chosen.",
  "13- Already Chosen.",
  "13- Already Chosen.",
  "14- Already Chosen.",
  "14- Already Chosen.",
  "15- Already Chosen.",
  "15- I thrive when the days grow shorter.",
  "16- Already Chosen.",
  "16- Already Chosen.",
  "17- Already Chosen.",
  "17- Already Chosen."
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
