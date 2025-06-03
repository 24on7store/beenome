const questions = [
  "1- Some things are worth holding, even if they come with a sting.",
  "1- I chase intensity, even when it hurts a little.",
  "2- Clean starts speak louder than perfect plans.",
  // ... (add the rest of your questions)
];

let chosenAnswers = new Set();
let currentSelection = null;
let currentUser = {};
let usedIndexes = new Set();

document.getElementById('gender').addEventListener('change', function () {
  document.getElementById('nameInput').style.display = this.value ? 'block' : 'none';
});

document.getElementById('startBtn').addEventListener('click', startQuestions);

async function fetchUsedIndexes() {
  const snapshot = await window.getDocs(window.collection(window.db, "answers"));
  snapshot.forEach(doc => usedIndexes.add(doc.data().index));
}

async function startQuestions() {
  const gender = document.getElementById('gender').value;
  const name = document.getElementById('name').value.trim();

  if (!name || !gender) {
    alert("Please enter your name and select a gender.");
    return;
  }

  currentUser = { name, gender };

  await fetchUsedIndexes(); // load used indexes before filtering

  document.getElementById('form').style.display = 'none';
  document.getElementById('questionContainer').style.display = 'block';

  loadQuestions(gender);
}

function loadQuestions(gender) {
  const list = document.getElementById('questionList');
  list.innerHTML = "";

  const isMale = gender === 'male';

  questions.forEach((text, index) => {
    const isEligible = isMale ? index % 2 === 1 : index % 2 === 0;

    if (!usedIndexes.has(index) && isEligible) {
      const li = document.createElement('li');
      li.textContent = text;
      li.dataset.index = index;

      li.addEventListener('click', () => selectQuestion(li));
      list.appendChild(li);
    }
  });
}

function selectQuestion(li) {
  if (currentSelection) {
    currentSelection.classList.remove('selected');
  }
  li.classList.add('selected');
  currentSelection = li;
}

async function submitAnswer() {
  if (!currentSelection) {
    alert("Please select a sentence before submitting.");
    return;
  }

  const index = parseInt(currentSelection.dataset.index);
  const answerText = questions[index];
  const timestamp = new Date().toLocaleString();

  // Save to Firebase Firestore
  await window.addDoc(window.collection(window.db, "answers"), {
    name: currentUser.name,
    gender: currentUser.gender,
    index: index,
    answer: answerText,
    time: timestamp
  });

  // Mark question as used and remove from UI
  usedIndexes.add(index);
  document.querySelectorAll('#questionList li').forEach(li => {
    li.classList.add('disabled');
    li.removeEventListener('click', selectQuestion);
  });

  document.getElementById('questionContainer').style.display = 'none';
  document.getElementById('resultContainer').style.display = 'block';
}
