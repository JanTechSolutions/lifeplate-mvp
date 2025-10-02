// ===============================
// 🚀 LifePlate App – script.js (CLEAN SINGLE VERSION)
// ===============================

// ---------- GLOBAL ----------
var currentScreen = ""; // use var to avoid redeclare errors

// ---------- UTILITIES ----------
function $(id) { return document.getElementById(id); }
function saveToLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function loadFromLocal(key) { return JSON.parse(localStorage.getItem(key)) || []; }

// ----- Onboarding data -----
let quizData = [];
let currentQuestionIndex = 0;
let promptScores = {};
let promptLibrary = [];

// Load quiz + prompts
fetch("lifeplate_onboarding_quiz.json")
  .then(r => r.ok ? r.json() : { questions: [] })
  .then(data => { quizData = data.questions || []; })
  .catch(() => { quizData = []; });

fetch("promptLibrary.json")
  .then(r => r.ok ? r.json() : [])
  .then(data => { promptLibrary = data || []; })
  .catch(() => { promptLibrary = []; });

// Helpers for prompts
function getTopPromptTags(scores, topN = 3) {
  return Object.entries(scores || {})
    .sort((a,b) => b[1]-a[1])
    .slice(0, topN)
    .map(([tag]) => tag);
}
function getPromptsByTags(tags) {
  return (promptLibrary || []).filter(p => p.tags?.some(t => tags.includes(t)));
}

// ---------- HOME ----------
function showHomeScreen() {
  currentScreen = "home";
  $("app").innerHTML = `
    <h1>Welcome to LifePlate 🍽️</h1>
    <button onclick="startOnboarding()">Start</button>
  `;
}
function startOnboarding() {
  // If already onboarded, skip straight to the app hub
  if (localStorage.getItem("onboarded") === "true") {
    showPromptScreen();
    return;
  }
  // Otherwise Persona → Quiz
  showPersonaOptions();
}

// ---------- PROMPT / HUB ----------
function showPromptScreen() {
  currentScreen = "prompt";
  $("app").innerHTML = `
    <h2>Welcome back!</h2>
    <p>What would you like to do?</p>
    <button onclick="showAddTask()">➕ Add New Task</button>
    <button onclick="showTaskSuggestions()">⚡ Clear or Navigate Your Plate</button>
    <button onclick="viewTasks()">🍽️ View Your Plate</button>
    <button onclick="startQuiz()">🎯 Retake Onboarding Quiz</button>
  `;
}
const profiles = listProfiles();
const activeId = getActiveProfileId();
const active = profiles.find(p => p.id === activeId) || { name: "My Plate" };
let plateUI = `<div style="margin:8px 0; padding:8px; border:1px solid #ddd;">
  <strong>Plate:</strong> ${active.name}
  <details style="margin-top:6px;">
    <summary>Switch / Create</summary>
    ${profiles.map(p => `
      <div>
        <button onclick="switchProfile('${p.id}')">${p.name}</button>
      </div>`).join("")}
    <div style="margin-top:6px;">
      <button onclick="(function(){const n=prompt('Name this plate (e.g., Work, Home)'); if(n) createProfile(n);})()">➕ New Plate</button>
    </div>
  </details>
</div>`;
$("app").innerHTML = plateUI + `
  <!-- your existing prompt buttons go here -->
`;

// ---------- ADD TASK (SCREEN) ----------
function showAddTask() {
  currentScreen = "add";
  $("app").innerHTML = `
    <h2>Add a New Task</h2>
    <input type="text" id="taskTitle" placeholder="Task title"/><br><br>

    <input type="number" id="taskDuration" placeholder="Duration (min)"/><br><br>

    <label>Energy level</label>
    <p style="font-size:0.9em;color:#666;margin:4px 0 0;">
      Will this task take a lot or a little? Think about your energy.
    </p>
    <select id="taskEnergy">
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select><br><br>

    <input type="text" id="taskCategory" placeholder="Category (e.g. Work, Health)"/><br><br>
    <input type="date" id="taskDueDate"/><br><br>
    <input type="text" id="taskTags" placeholder="Tags (comma separated)"/><br><br>
    <input type="text" id="taskLocation" placeholder="Location (e.g. Home, Gym, Library)"/><br><br>
    <textarea id="taskNotes" placeholder="Notes or links..."></textarea><br><br>

    <button onclick="addTask()">➕ Add Task</button>
    <br><br>
    <button onclick="showPromptScreen()">⬅ Back</button>
  `;
}

function addTask() {
  const title = $("taskTitle").value.trim();
  const duration = parseInt($("taskDuration").value);
  const energy = $("taskEnergy").value;
  const category = $("taskCategory").value.trim();
  const dueDate = $("taskDueDate").value;
  const tags = $("taskTags").value.split(",").map(t => t.trim()).filter(Boolean);
  const location = $("taskLocation").value.trim();
  const notes = $("taskNotes").value.trim();

  if (!title || isNaN(duration)) {
    alert("Please enter a task title and duration.");
    return;
  }

  const tasks = loadFromLocal("tasks");
  tasks.push({ title, duration, energy, category, dueDate, tags, location, notes });
  saveToLocal("tasks", tasks);
  showPromptScreen();
}

// ---------- VIEW TASKS (LIST) ----------
function viewTasks() {
  currentScreen = "view";
  const tasks = loadFromLocal("tasks");

  if (!tasks.length) {
    $("app").innerHTML = `
      <h2>Your Plate 🍽️</h2>
      <p>No tasks yet. Add one to get started.</p>
      <button onclick="showAddTask()">➕ Add New Task</button>
      <br><br><button onclick="showPromptScreen()">⬅ Back</button>
    `;
    return;
  }

  let html = "<h2>Your Plate 🍽️</h2>";
  tasks.forEach((t, i) => {
    html += `
      <div style="border:1px solid #ccc; padding:8px; margin:6px 0;">
        <strong>${t.title}</strong><br>
        ${t.duration || "-"} min • ${t.energy || "-"} • ${t.category || "-"}<br>
        Due: ${t.dueDate || "N/A"}<br>
        Tags: ${(t.tags && t.tags.length) ? t.tags.join(", ") : "-"}<br>
        Location: ${t.location || "-"}<br>
        Notes: ${t.notes || "-"}<br>
        <button onclick="editTask(${i})">✏️ Edit</button>
        <button onclick="deleteTask(${i})">🗑️ Delete</button>
      </div>
    `;
  });
  html += `<br><button onclick="showPromptScreen()">⬅ Back</button>`;
  $("app").innerHTML = html;
}

// ---------- EDIT / DELETE ----------
function editTask(index) {
  const tasks = loadFromLocal("tasks");
  const t = tasks[index];
  if (!t) return viewTasks();

  $("app").innerHTML = `
    <h2>Edit Task</h2>
    <input id="taskTitle" value="${t.title || ""}"/><br><br>
    <input id="taskDuration" type="number" value="${t.duration || 0}"/><br><br>
    <select id="taskEnergy">
      <option value="Low" ${t.energy==="Low"?"selected":""}>Low</option>
      <option value="Medium" ${t.energy==="Medium"?"selected":""}>Medium</option>
      <option value="High" ${t.energy==="High"?"selected":""}>High</option>
    </select><br><br>
    <input id="taskCategory" value="${t.category || ""}"/><br><br>
    <input id="taskDueDate" type="date" value="${t.dueDate || ""}"/><br><br>
    <input id="taskTags" value="${(t.tags||[]).join(", ")}"/><br><br>
    <input id="taskLocation" value="${t.location || ""}"/><br><br>
    <textarea id="taskNotes">${t.notes || ""}</textarea><br><br>

    <button onclick="saveEditedTask(${index})">💾 Save</button>
    <button onclick="viewTasks()">⬅ Cancel</button>
  `;
}
function saveEditedTask(index) {
  const tasks = loadFromLocal("tasks");
  if (!tasks[index]) return viewTasks();

  tasks[index] = {
    title: $("taskTitle").value.trim(),
    duration: parseInt($("taskDuration").value),
    energy: $("taskEnergy").value,
    category: $("taskCategory").value.trim(),
    dueDate: $("taskDueDate").value,
    tags: $("taskTags").value.split(",").map(t => t.trim()).filter(Boolean),
    location: $("taskLocation").value.trim(),
    notes: $("taskNotes").value.trim()
  };
  saveToLocal("tasks", tasks);
  viewTasks();
}
function deleteTask(index) {
  const tasks = loadFromLocal("tasks");
  if (!confirm("Delete this task?")) return;
  tasks.splice(index, 1);
  saveToLocal("tasks", tasks);
  viewTasks();
}
function showPersonaOptions() {
  document.getElementById("app").innerHTML = `
    <h2>Select your Plate Persona</h2>
    <p style="color:#666;margin-top:-6px;">(This helps tailor prompts later. You can change it anytime.)</p>
    <button onclick="selectPersona('Student')">Student</button>
    <button onclick="selectPersona('Caregiver')">Caregiver</button>
    <button onclick="selectPersona('Professional')">Professional</button>
    <button onclick="selectPersona('Blank')">Blank Plate</button>
    <br><br>
    <button onclick="startQuiz()">Skip</button>
    <button onclick="showHomeScreen()">⬅ Back</button>
  `;
}
function selectPersona(persona) {
  localStorage.setItem("persona", persona);
  startQuiz();
}
function startQuiz() {
  currentQuestionIndex = 0;
  promptScores = {};
  if (!quizData || quizData.length === 0) {
    // If the JSON didn’t load for any reason, skip gracefully
    showQuizResults(); // will just show an empty set but proceed
    return;
  }
  showNextQuizQuestion();
}

function showNextQuizQuestion() {
  if (currentQuestionIndex >= quizData.length) {
    showQuizResults();
    return;
  }
  const q = quizData[currentQuestionIndex];
  let html = `<h2>${q.question}</h2>`;
  q.answers.forEach((a, i) => {
    html += `<button onclick="selectAnswer(${i})">${a.text}</button><br><br>`;
  });
  html += `<button onclick="skipQuestion()">Skip →</button><br><br>`;
  html += `<button onclick="showHomeScreen()">⬅ Cancel</button>`;
  document.getElementById("app").innerHTML = html;
}

function selectAnswer(index) {
  const q = quizData[currentQuestionIndex];
  const answer = q.answers[index];
  for (const tag in answer.weights) {
    if (!promptScores[tag]) promptScores[tag] = 0;
    promptScores[tag] += answer.weights[tag];
  }
  currentQuestionIndex++;
  showNextQuizQuestion();
}

function skipQuestion() {
  currentQuestionIndex++;
  showNextQuizQuestion();
}

function showQuizResults() {
  const topTags = getTopPromptTags(promptScores);
  const matchedPrompts = getPromptsByTags(topTags);

  let html = `<h2>Your Prompt Profile</h2>`;
  const persona = localStorage.getItem("persona");
  if (persona) html += `<p><strong>Persona:</strong> ${persona}</p>`;
  if (topTags.length) html += `<p><strong>Top needs:</strong> ${topTags.join(", ")}</p>`;
  if (matchedPrompts.length) {
    html += `<h3>Suggestions</h3><ul>`;
    matchedPrompts.slice(0,5).forEach(p => { html += `<li>${p.text}</li>`; });
    html += `</ul>`;
  } else {
    html += `<p style="color:#666;">We’ll learn your preferences as you use LifePlate.</p>`;
  }

  html += `
    <br>
    <button onclick="finishOnboarding()">Continue to LifePlate →</button>
    <br><br>
    <button onclick="startQuiz()">Retake Quiz</button>
    <button onclick="showHomeScreen()">⬅ Home</button>
  `;

  // Persist
  localStorage.setItem("quizScores", JSON.stringify(promptScores));
  document.getElementById("app").innerHTML = html;
}

function finishOnboarding() {
  localStorage.setItem("onboarded", "true");
  showPromptScreen();
}

// ---------- SUGGESTIONS ----------
const moodAffirmations = {
  Overwhelmed: "Breathe. One step at a time.",
  Focused: "You’re in the zone — let’s use it.",
  Tired: "Gentle progress counts.",
  Energized: "Ride the wave — move one big thing.",
  Avoidant: "Start tiny. Momentum will follow."
};
function getEnergyFromMood(mood) {
  const map = { Overwhelmed:"Low", Tired:"Low", Avoidant:"Medium", Focused:"Medium", Energized:"High" };
  return map[mood] || "Medium";
}

function showTaskSuggestions() {
  currentScreen = "suggest";
  $("app").innerHTML = `
    <h2>Let’s Clear Your Plate</h2>

    <label>How are you feeling right now?</label><br>
    <select id="moodCheck">
      <option value="Overwhelmed">😩 Overwhelmed</option>
      <option value="Focused">🎯 Focused</option>
      <option value="Tired">😴 Tired</option>
      <option value="Energized">⚡ Energized</option>
      <option value="Avoidant">🫣 Avoidant</option>
    </select><br><br>

    <label>How much time do you have? (in minutes)</label><br>
    <input id="availableTime" type="number" /><br><br>

    <p><strong>Energy Matching:</strong> Will this task take a lot or a little?</p>

    <button onclick="suggestTasks()">Show Me Tasks</button>
    <button onclick="showPromptScreen()">⬅ Back</button>
  `;
}

function suggestTasks() {
  const time = parseInt($("availableTime").value);
  const mood = $("moodCheck").value;
  const inferredEnergy = getEnergyFromMood(mood);

  const tasks = loadFromLocal("tasks");
  const energyRank = { Low:1, Medium:2, High:3 };

  const affirmation = moodAffirmations[mood] || "Let's get started.";
  const filtered = tasks.filter(t =>
    (!isNaN(time) && t.duration <= time) &&
    energyRank[(t.energy||"Medium")] <= energyRank[inferredEnergy]
  );
  const ranked = filtered.sort((a,b) =>
    (energyRank[a.energy]-energyRank[b.energy]) || (a.duration-b.duration)
  ).slice(0,3);

  let html = `<h2>Your Plate Picks</h2>`;
  html += `<p><em>${affirmation}</em></p>`;
  html += `<p>Mood: <strong>${mood}</strong> → Energy Level: <strong>${inferredEnergy}</strong></p>`;

  if (ranked.length === 0) {
    html += `<p>No tasks matched your current time and energy level.</p>`;
  } else {
    ranked.forEach((t, i) => {
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
          <strong>${i+1}. ${t.title}</strong><br>
          ${t.duration} min • ${t.energy} • ${t.category || "-"}
        </div>
      `;
    });
  }

  html += `<br><button onclick="showTaskSuggestions()">⬅ Back</button>
           <button onclick="showPromptScreen()">🏠 Main</button>`;
  $("app").innerHTML = html;

  // mood history
  localStorage.setItem("mood", mood);
  const history = loadFromLocal("moodHistory");
  history.push({ mood, timestamp: new Date().toISOString() });
  saveToLocal("moodHistory", history);
}

// ---------- SUPPORT / REFLECT ----------
function showSupportScreen() {
  const moodHistory = loadFromLocal("moodHistory");
  const lastMood = moodHistory.length ? moodHistory[moodHistory.length-1].mood : null;
  const affirmation = lastMood ? moodAffirmations[lastMood] : "Reflect on what worked today.";

  let html = `<h2>Reflect & Support</h2>`;
  html += `<p><strong>Last Mood:</strong> ${lastMood || "N/A"}</p>`;
  html += `<p><em>${affirmation}</em></p>`;

  html += `<h3>📊 Mood History</h3>`;
  if (!moodHistory.length) {
    html += `<p>No moods logged yet.</p>`;
  } else {
    html += `<ul>`;
    moodHistory.slice(-10).reverse().forEach(e => {
      html += `<li>${new Date(e.timestamp).toLocaleString()}: <strong>${e.mood}</strong></li>`;
    });
    html += `</ul>`;
  }

  html += `<br>
    <button onclick="showHomeScreen()">🏠 Home</button>
    <button onclick="showPromptScreen()">⬅ Back to Prompt</button>`;
  $("app").innerHTML = html;
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", showHomeScreen);
// ----- Plate Profiles (local only) -----
function listProfiles() {
  return JSON.parse(localStorage.getItem("lp_profiles") || "[]");
}
function setActiveProfileId(id) {
  localStorage.setItem("lp_activeProfileId", id);
}
function getActiveProfileId() {
  let id = localStorage.getItem("lp_activeProfileId");
  if (!id) {
    id = "default";
    ensureProfile(id, "My Plate");
    setActiveProfileId(id);
  }
  return id;
}
function ensureProfile(id, name) {
  const profiles = listProfiles();
  if (!profiles.find(p => p.id === id)) {
    profiles.push({ id, name });
    localStorage.setItem("lp_profiles", JSON.stringify(profiles));
    localStorage.setItem("lp_data_" + id, JSON.stringify({ tasks: [], categories: [] }));
  }
}
function loadData() {
  const id = getActiveProfileId();
  return JSON.parse(localStorage.getItem("lp_data_" + id) || '{"tasks":[],"categories":[]}');
}
function saveData(data) {
  const id = getActiveProfileId();
  localStorage.setItem("lp_data_" + id, JSON.stringify(data));
}
function getTasks() {
  const d = loadData();
  return d.tasks || [];
}
function saveTasks(tasks) {
  const d = loadData();
  d.tasks = tasks;
  saveData(d);
}
function createProfile(name) {
  const id = "p_" + Date.now().toString(36);
  ensureProfile(id, name || "New Plate");
  setActiveProfileId(id);
  showPromptScreen();
}
function switchProfile(id) {
  setActiveProfileId(id);
  showPromptScreen();
}
