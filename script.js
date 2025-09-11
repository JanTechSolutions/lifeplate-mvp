
// ===============================
// 🚀 LifePlate App – script.js (FULL CLEAN MVP BUILD – Phases 1–6)
// ===============================

// ========== PHASE 1: Engage Screen ==========
function showEngageScreen() {
  document.getElementById('app').innerHTML = \`
    <h1>Welcome to LifePlate</h1>
    <p>Ditch the to-do lists. Clear your plate.</p>
    <button onclick="showPersonaOptions()">Start</button>
    <br><br>
    <button onclick="resetApp()">🧼 Reset App</button>
  \`;
}
showEngageScreen();

function resetApp() {
  localStorage.clear();
  location.reload();
}

// ========== PHASE 2: Persona Selection + Quiz ==========
function showPersonaOptions() {
  document.getElementById('app').innerHTML = \`
    <h2>Select your Plate Persona</h2>
    <button onclick="selectPersona('Student')">Student</button>
    <button onclick="selectPersona('Caregiver')">Caregiver</button>
    <button onclick="selectPersona('Professional')">Professional</button>
    <button onclick="selectPersona('Blank')">Blank Plate</button>
    <br><br><button onclick="showEngageScreen()">⬅ Back</button>
  \`;
}

function selectPersona(persona) {
  localStorage.setItem('persona', persona);

  const locationsByPersona = {
    Student: ["Home", "Campus", "Library", "Dorm"],
    Caregiver: ["Home", "Work", "Grocery Store", "School Pickup"],
    Professional: ["Home", "Office", "Coffee Shop", "Co-Working Space"],
    Blank: ["Anywhere"]
  };

  const categoriesByPersona = {
    Student: ["Academics", "Extracurriculars", "Social Life", "Self-Care", "Health & Wellness", "Family & Home", "Professional Development", "Finances"],
    Caregiver: ["Family & Childcare", "Work", "Health & Wellness", "Self-Care", "Social Life", "Travel", "Finances", "Household Management"],
    Professional: ["Career", "Professional Development", "Hobbies", "Health & Wellness", "Social Life", "Travel", "Finances", "Family & Relationships"],
    Blank: []
  };

  localStorage.setItem('locations', JSON.stringify(locationsByPersona[persona] || []));
  localStorage.setItem('categories', JSON.stringify(categoriesByPersona[persona] || []));
  startQuiz();
}

let quizData = [];
let currentQuestionIndex = 0;
let promptScores = {};

fetch("lifeplate_onboarding_quiz.json")
  .then((res) => res.json())
  .then((data) => {
    quizData = data.questions;
  });

function startQuiz() {
  currentQuestionIndex = 0;
  promptScores = {};
  showNextQuizQuestion();
}

function showNextQuizQuestion() {
  if (currentQuestionIndex >= quizData.length) return showQuizResults();
  const q = quizData[currentQuestionIndex];
  let html = \`<h2>\${q.question}</h2>\`;
  q.answers.forEach((a, i) => {
    html += \`<button onclick="selectAnswer(\${i})">\${a.text}</button><br><br>\`;
  });
  document.getElementById("app").innerHTML = html;
}

function selectAnswer(index) {
  const answer = quizData[currentQuestionIndex].answers[index];
  for (const tag in answer.weights) {
    if (!promptScores[tag]) promptScores[tag] = 0;
    promptScores[tag] += answer.weights[tag];
  }
  currentQuestionIndex++;
  showNextQuizQuestion();
}

function getTopPromptTags(scores, topN = 3) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([tag]) => tag);
}

// ========== PHASE 3: Prompt Suggestions ==========
let promptLibrary = [];
fetch("promptLibrary.json")
  .then((res) => res.json())
  .then((data) => {
    promptLibrary = data;
  });

function getPromptsByTags(tags) {
  return promptLibrary.filter((p) => p.tags.some((tag) => tags.includes(tag)));
}

function showQuizResults() {
  const topTags = getTopPromptTags(promptScores);
  const matchedPrompts = getPromptsByTags(topTags);

  let html = \`<h2>Your Prompt Profile</h2>\`;
  html += \`<p>Your top needs: \${topTags.join(", ")}</p>\`;
  html += \`<h3>Support Suggestions:</h3><ul>\`;
  matchedPrompts.forEach((p) => {
    html += \`<li>\${p.text}</li>\`;
  });
  html += \`</ul>\`;
  html += \`<br><button onclick="showPromptScreen()">Continue to LifePlate</button>\`;
  html += \`<br><br><button onclick="startQuiz()">🔁 Retake Quiz</button>\`;
  document.getElementById('app').innerHTML = html;

  localStorage.setItem("quizScores", JSON.stringify(promptScores));
}

// === CONTINUED IN NEXT PART ===



// ===============================
// 🚀 LifePlate App – script.js (Phases 4–6)
// ===============================

// ========== PHASE 4: View Tasks + Pie Chart ==========
function viewTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const categories = JSON.parse(localStorage.getItem("categories")) || [];

  const counts = {};
  categories.forEach((cat) => (counts[cat] = 0));
  tasks.forEach((task) => {
    if (counts[task.category] !== undefined) counts[task.category]++;
  });

  const labels = Object.keys(counts).filter((cat) => counts[cat] > 0);
  const data = labels.map((cat) => counts[cat]);

  document.getElementById("app").innerHTML = `
    <h2>Your Plate</h2>
    <canvas id="taskChart" width="300" height="300"></canvas>
    <br><button onclick="showPromptScreen()">⬅ Back</button>
  `;

  const ctx = document.getElementById("taskChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#6c63ff', '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff']
      }]
    },
    options: {
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const clickedIndex = elements[0].index;
          const clickedCategory = labels[clickedIndex];
          showTasksByCategory(clickedCategory);
        }
      },
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Tasks by Category" }
      }
    }
  });
}

// ========== TASKS BY CATEGORY ==========
function showTasksByCategory(category) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const filtered = tasks.filter((t) => t.category === category);

  let html = `<h2>${category} Tasks</h2>`;
  if (filtered.length === 0) {
    html += `<p>No tasks found in this category.</p>`;
  } else {
    filtered.forEach((t, i) => {
      html += `<div onclick="viewSingleTask(${i})" style="border:1px solid #ccc; padding:10px; margin:10px 0; cursor:pointer;">
        <strong>${t.title}</strong><br>
        ${t.duration} min • ${t.energy} • Due: ${t.dueDate || "N/A"}
      </div>`;
    });
  }

  html += `<br><button onclick="viewTasks()">⬅ Back to Plate</button>`;
  document.getElementById("app").innerHTML = html;
}

// ========== VIEW/EDIT/DELETE TASK ==========
function viewSingleTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];
  if (!task) return viewTasks();

  let html = `<h2>${task.title}</h2>`;
  html += `<p><strong>Category:</strong> ${task.category}</p>`;
  html += `<p><strong>Duration:</strong> ${task.duration} min</p>`;
  html += `<p><strong>Energy:</strong> ${task.energy}</p>`;
  html += `<p><strong>Tags:</strong> ${task.tags.join(", ")}</p>`;
  html += `<p><strong>Due Date:</strong> ${task.dueDate || "N/A"}</p>`;
  html += `<p><strong>Location:</strong> ${task.location}</p>`;
  html += `<p><strong>Notes:</strong><br>${task.notes || "None"}</p>`;
  html += `
    <br>
    <button onclick="editTask(${index})">✏️ Edit</button>
    <button onclick="deleteTask(${index})">🗑️ Delete</button>
    <br><br>
    <button onclick="viewTasks()">⬅ Back to Plate</button>
  `;

  document.getElementById("app").innerHTML = html;
}

function deleteTask(index) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  viewTasks();
}

// ========== PHASE 5: Mood-Based Suggestions + Affirmations ==========
const moodAffirmations = {
  Overwhelmed: "Breathe. It's okay to take things one step at a time.",
  Focused: "You're in the zone — let's channel it into meaningful progress.",
  Tired: "Rest is productive too. Here's something gentle to start with.",
  Energized: "You've got momentum! Let’s use it wisely.",
  Avoidant: "Avoidance is often wisdom in disguise. Let’s ease into one small win."
};

function getEnergyFromMood(mood) {
  const mapping = {
    Overwhelmed: "Low",
    Tired: "Low",
    Avoidant: "Medium",
    Focused: "Medium",
    Energized: "High"
  };
  return mapping[mood] || "Medium";
}

// ========== PHASE 6: Show Suggestions + Save Mood History ==========
function suggestTasks() {
  const time = parseInt(document.getElementById("availableTime").value);
  const mood = document.getElementById("moodCheck").value;
  const inferredEnergy = getEnergyFromMood(mood);

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const energyRank = { Low: 1, Medium: 2, High: 3 };

  const affirmation = moodAffirmations[mood] || "Let's get started.";
  const quizScores = JSON.parse(localStorage.getItem("quizScores")) || {};
  const topTags = getTopPromptTags(quizScores);
  const promptSuggestions = getPromptsByTags(topTags);
  const randomPrompt = promptSuggestions.length > 0 ? promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)].text : null;

  const filtered = tasks.filter(t =>
    (!isNaN(time) && t.duration <= time) &&
    energyRank[t.energy] <= energyRank[inferredEnergy]
  );

  const ranked = filtered.sort((a, b) => {
    const energyDiff = energyRank[a.energy] - energyRank[b.energy];
    const timeDiff = a.duration - b.duration;
    return energyDiff !== 0 ? energyDiff : timeDiff;
  });

  const topTasks = ranked.slice(0, 3);

  let html = `<h2>Your Plate Picks</h2>`;
  html += `<p><em>${affirmation}</em></p>`;
  if (randomPrompt) html += `<p><strong>Try this:</strong> ${randomPrompt}</p>`;
  html += `<p>Mood: <strong>${mood}</strong> → Energy Level: <strong>${inferredEnergy}</strong></p>`;

  if (topTasks.length === 0) {
    html += `<p>No tasks matched your current time and energy level.</p>`;
  } else {
    topTasks.forEach((t, i) => {
      html += `
        <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
          <strong>${i + 1}. ${t.title}</strong><br>
          ${t.duration} min • ${t.energy} • ${t.category}
        </div>
      `;
    });
  }

  html += `<br><button onclick="showPromptScreen()">⬅ Back</button>`;
  document.getElementById("app").innerHTML = html;

  localStorage.setItem("mood", mood);
  let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
  history.push({ mood, timestamp: new Date().toISOString() });
  localStorage.setItem("moodHistory", JSON.stringify(history));
}
