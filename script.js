// ===============================
// 🚀 LifePlate App – script.js (CLEAN SINGLE VERSION)
// ===============================

// ---------- GLOBAL ----------
var currentScreen = ""; // use var to avoid redeclare errors

// ---------- UTILITIES ----------
function $(id) { return document.getElementById(id); }
function saveToLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function loadFromLocal(key) { return JSON.parse(localStorage.getItem(key)) || []; }

// ---------- PRESET CATEGORIES BY PERSONA ----------
const CATEGORIES_BY_PERSONA = {
  Student: [
    "Academics", "Extracurriculars", "Social", "Self-Care",
    "Health & Wellness", "Family & Home", "Professional Development", "Finances"
  ],
  Caregiver: [
    "Family & Childcare", "Work", "Health & Wellness", "Self-Care",
    "Social", "Travel", "Finances", "Household"
  ],
  Professional: [
    "Career", "Professional Development", "Hobbies",
    "Health & Wellness", "Social", "Travel", "Finances", "Family & Relationships"
  ],
  Blank: ["Personal", "Work", "Health", "Errands", "Finances"]
};

// Safe getter: if nothing saved, fall back to a simple default
function getCategories() {
  try {
    const cats = JSON.parse(localStorage.getItem("categories") || "[]");
    return Array.isArray(cats) && cats.length ? cats : CATEGORIES_BY_PERSONA.Blank;
  } catch {
    return CATEGORIES_BY_PERSONA.Blank;
  }
}

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
  if (localStorage.getItem("onboarded") === "true") {
    showPromptScreen();
    return;
  }
  showPersonaOptions();
}


// ---------- PROMPT / HUB ----------
function showPromptScreen() {
  currentScreen = "prompt";

  // 🧠 Build the Plate Switcher UI first
  const profiles = listProfiles ? listProfiles() : [];
  const activeId = getActiveProfileId ? getActiveProfileId() : null;
  const active = profiles.find(p => p.id === activeId) || { name: "My Plate" };

  const plateUI = `
    <div style="margin:8px 0; padding:8px; border:1px solid #ddd;">
      <strong>Plate:</strong> ${active.name}
      <details style="margin-top:6px;">
        <summary>Switch / Create</summary>
        ${profiles.map(p => `
          <div><button onclick="switchProfile('${p.id}')">${p.name}</button></div>
        `).join("")}
        <div style="margin-top:6px;">
          <button onclick="(function(){
            const n = prompt('Name this plate (e.g., Work, Home)');
            if(n) createProfile(n);
          })()">➕ New Plate</button>
        </div>
      </details>
    </div>
  `;

  // 🎨 Now render the prompt screen
  $("app").innerHTML = plateUI + `
    <h2>Welcome back!</h2>
    <p>What would you like to do?</p>
    <button onclick="showAddTask()">➕ Add New Task</button>
    <button onclick="showTaskSuggestions()">⚡ Clear or Navigate Your Plate</button>
    <button onclick="viewTasks()">🍽️ View Your Plate</button>
    <button onclick="startQuiz()">🎯 Retake Onboarding Quiz</button>
  `;
}

// ---------- ADD TASK (SCREEN) ----------
function showAddTask() {
  currentScreen = "add";

  // Build category <option>s from persona presets in localStorage
  const cats = (typeof getCategories === "function") ? getCategories() : [];
  const categoryOptions = cats.map(c => `<option value="${c}">${c}</option>`).join("");

  $("app").innerHTML = `
    <h2>Add a New Task</h2>

    <label>Title</label><br>
    <input type="text" id="taskTitle" placeholder="Task title"/><br><br>

    <label>Duration (min)</label><br>
    <input type="number" id="taskDuration" placeholder="Duration (min)"/><br><br>

    <label>Energy level</label>
    <p style="font-size:0.9em;color:#666;margin:4px 0 8px;">
      Will this task take a lot or a little? Think about your energy.
    </p>
    <select id="taskEnergy">
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select><br><br>

    <label>Category</label><br>
    <select id="taskCategory" onchange="toggleOtherCategory()">
      ${categoryOptions}
      <option value="__OTHER__">Other…</option>
    </select>
    <div id="otherCategoryRow" style="display:none; margin-top:6px;">
      <input id="taskCategoryOther" placeholder="Type a category"/>
    </div>
    <br>

    <label>Due date</label><br>
    <input type="date" id="taskDueDate"/><br><br>

    <label>Tags (comma separated)</label><br>
    <input type="text" id="taskTags" placeholder="e.g., deep work, emails"/><br><br>

    <label>Location</label><br>
    <input type="text" id="taskLocation" placeholder="Home, Gym, Library"/><br><br>

    <label>Notes</label><br>
    <textarea id="taskNotes" placeholder="Notes or links..."></textarea><br><br>

    <button onclick="addTask()">➕ Add Task</button>
    <br><br>
    <button onclick="showPromptScreen()">⬅ Back</button>
  `;
}

function addTask() {
  const title = $("taskTitle").value.trim();
  const duration = parseInt($("taskDuration").value, 10);
  const energy = $("taskEnergy").value;

  // ---- category logic ----
  let category = $("taskCategory").value;
  if (category === "__OTHER__") {
    category = ($("taskCategoryOther").value || "").trim() || "Other";
    // Optional: remember the new category so it appears next time
    if (typeof getCategories === "function") {
      const cats = getCategories();
      if (!cats.includes(category)) {
        try {
          localStorage.setItem("categories", JSON.stringify([...cats, category]));
        } catch (e) {}
      }
    }
  }

  const dueDate = $("taskDueDate").value;
  const tags = ($("taskTags").value || "").split(",").map(t => t.trim()).filter(Boolean);
  const location = ($("taskLocation").value || "").trim();
  const notes = ($("taskNotes").value || "").trim();

  if (!title || isNaN(duration)) return;

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

  let html = `
    <h2>Your Plate 🍽️</h2>
    <button onclick="viewTasksChart()">📊 View as Chart</button>
    <br><br>
  `;

  tasks.forEach((t, i) => {
    html += `
      <div style="border:1px solid #ccc; padding:8px; margin:6px 0; border-radius:8px;">
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

function viewTasksChart() {
  currentScreen = "view_chart";
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  // Merge preset categories (if available) + any categories found on tasks
  const baseCats = (typeof getCategories === "function") ? getCategories() : [];
  const counts = {};
  baseCats.forEach(cat => counts[cat] = 0);
  tasks.forEach(t => {
    const cat = (t.category || "Uncategorized");
    if (!(cat in counts)) counts[cat] = 0;
    counts[cat]++;
  });

  const labels = Object.keys(counts).filter(cat => counts[cat] > 0);
  const data = labels.map(cat => counts[cat]);

  $("app").innerHTML = `
    <h2>Your Plate — Chart 📊</h2>
    <canvas id="taskChart" width="340" height="340"></canvas>
    <div style="margin-top:12px;">
      <button onclick="viewTasks()">📋 View as List</button>
      <button onclick="showPromptScreen()">⬅ Back</button>
    </div>
  `;

  const ctx = document.getElementById("taskChart").getContext("2d");
  // Create the chart
  new Chart(ctx, {
    type: "pie",
    data: { labels, datasets: [{ data }] },
    options: {
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Tasks by Category" }
      },
      onClick: (evt, elements) => {
        if (elements && elements.length) {
          const i = elements[0].index;
          const clickedCategory = labels[i];
          // drill down to tasks of that category
          if (typeof showTasksByCategory === "function") {
            showTasksByCategory(clickedCategory);
          } else {
            showTasksByCategoryFallback(clickedCategory);
          }
        }
      }
    }
  });
}

function showTasksByCategoryFallback(category) {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const filtered = tasks.filter(t => (t.category || "Uncategorized") === category);

  let html = `<h2>${category} Tasks</h2>`;
  if (!filtered.length) {
    html += `<p>No tasks found in this category.</p>`;
  } else {
    filtered.forEach((t, i) => {
      const idx = tasks.indexOf(t); // original index in full list
      html += `
        <div style="border:1px solid #ccc; padding:8px; margin:6px 0; border-radius:8px;">
          <strong>${t.title}</strong><br>
          ${t.duration || "-"} min • ${t.energy || "-"} • ${t.category || "-"}<br>
          Due: ${t.dueDate || "N/A"}<br>
          <button onclick="editTask(${idx})">✏️ Edit</button>
          <button onclick="deleteTask(${idx})">🗑️ Delete</button>
        </div>
      `;
    });
  }
  html += `<br><button onclick="viewTasksChart()">⬅ Back to Chart</button>`;
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
    <p style="color:#666;margin-top:-6px;">This helps tailor suggestions. You can change it later.</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button onclick="selectPersona('Student')">Student</button>
      <button onclick="selectPersona('Caregiver')">Caregiver</button>
      <button onclick="selectPersona('Professional')">Professional</button>
      <button onclick="selectPersona('Blank')">Blank Plate</button>
    </div>
    <br>
    <button onclick="startQuiz()">Skip</button>
    <button onclick="showHomeScreen()">⬅ Home</button>
  `;
}

function selectPersona(persona) {
  try {
    localStorage.setItem("persona", persona);
    const preset = CATEGORIES_BY_PERSONA[persona] || CATEGORIES_BY_PERSONA.Blank;
    localStorage.setItem("categories", JSON.stringify(preset));
  } catch (e) {
    console.warn("Could not persist persona/categories", e);
  }
  startQuiz(); // or wherever you navigate next
}

function toggleOtherCategory() {
  const sel = document.getElementById("taskCategory");
  const row = document.getElementById("otherCategoryRow");
  if (!sel || !row) return;
  row.style.display = sel.value === "__OTHER__" ? "block" : "none";
}

function startQuiz() {
  currentQuestionIndex = 0;
  promptScores = {};

  // 🔑 Make sure quizData is fresh
  if (!quizData || quizData.length === 0) {
    fetch("lifeplate_onboarding_quiz.json")
      .then((res) => res.json())
      .then((data) => {
        quizData = data.questions;
        showNextQuizQuestion();
      });
  } else {
    showNextQuizQuestion();
  }
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
    <button onclick="restartQuiz()">🔁 Retake Quiz</button>
    <button onclick="showHomeScreen()">⬅ Home</button>
  `;

  // Persist
  localStorage.setItem("quizScores", JSON.stringify(promptScores));
  document.getElementById("app").innerHTML = html;
}
function restartQuiz() {
  // wipe prior quiz result so suggestions re-learn
  try { localStorage.removeItem("quizScores"); } catch (e) {}

  // hard reset quiz state
  currentQuestionIndex = 0;
  promptScores = {};

  // ensure quiz questions exist, fetch if needed
  if (!quizData || quizData.length === 0) {
    fetch("lifeplate_onboarding_quiz.json")
      .then(res => res.ok ? res.json() : { questions: [] })
      .then(data => {
        quizData = (data && data.questions) ? data.questions : [];
        showNextQuizQuestion();
      })
      .catch(() => {
        quizData = [];
        showNextQuizQuestion(); // will fall through to results gracefully
      });
  } else {
    showNextQuizQuestion();
  }
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
  // 1) Read inputs
  const time = parseInt(document.getElementById("availableTime").value);
  const mood = document.getElementById("moodCheck").value;

  // 2) Infer energy from mood
  const energyRank = { Low: 1, Medium: 2, High: 3 };
  const inferredEnergy = getEnergyFromMood(mood);

  // 3) Pull tasks
  const tasks = loadFromLocal("tasks");

  // 4) Prompt suggestion with fallback
  const quizScores = JSON.parse(localStorage.getItem("quizScores")) || {};
  const topTags = getTopPromptTags(quizScores);
  const promptSuggestions = getPromptsByTags(topTags);
  const randomPrompt = promptSuggestions.length > 0
    ? promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)].text
    : "Take a breath — even one small step is progress.";

  // 5) Filter + rank tasks
  const filtered = tasks.filter(t =>
    (!isNaN(time) && t.duration <= time) &&
    energyRank[(t.energy || "Medium")] <= energyRank[inferredEnergy]
  );

  const ranked = filtered.sort((a, b) => {
    const e = energyRank[(a.energy || "Medium")] - energyRank[(b.energy || "Medium")];
    if (e !== 0) return e;
    return (a.duration || 0) - (b.duration || 0);
  }).slice(0, 3);

  // 6) Build HTML
  let html = `<h2>Your Plate Picks</h2>`;
  html += `<p><em>${randomPrompt}</em></p>`;
  html += `<p>Mood: <strong>${mood}</strong> → Energy Level: <strong>${inferredEnergy}</strong></p>`;

  if (ranked.length === 0) {
    html += `<p>No tasks matched your current time and energy level.</p>`;
  } else {
    ranked.forEach((t, i) => {
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
          <strong>${i + 1}. ${t.title}</strong><br>
          ${(t.duration || 0)} min • ${(t.energy || "Medium")} • ${(t.category || "-")}
        </div>
      `;
    });
  }

  html += `<br><button onclick="showTaskSuggestions()">⬅ Back</button>
           <button onclick="showPromptScreen()">🏠 Main</button>`;

  // 7) Render
  document.getElementById("app").innerHTML = html;

  // 8) Save mood history (AFTER rendering so UI doesn't block)
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
// ---------- EXPOSE HANDLERS TO WINDOW (for inline onclick) ----------
(function exposeHandlers() {
  // screens
  if (typeof showHomeScreen === "function") window.showHomeScreen = showHomeScreen;
  if (typeof showPromptScreen === "function") window.showPromptScreen = showPromptScreen;
  if (typeof show === "function") window.show = show;
  if (typeof viewTasks === "function") window.viewTasks = viewTasks;
  if (typeof showTaskSuggestions === "function") window.showTaskSuggestions = showTaskSuggestions;
  if (typeof showSupportScreen === "function") window.showSupportScreen = showSupportScreen;

  // onboarding / persona / quiz
  if (typeof startOnboarding === "function") window.startOnboarding = startOnboarding;
  if (typeof showPersonaOptions === "function") window.showPersonaOptions = showPersonaOptions;
  if (typeof selectPersona === "function") window.selectPersona = selectPersona;
  if (typeof startQuiz === "function") window.startQuiz = startQuiz;
  if (typeof restartQuiz === "function") window.restartQuiz = restartQuiz;
  if (typeof showNextQuizQuestion === "function") window.showNextQuizQuestion = showNextQuizQuestion;
  if (typeof selectAnswer === "function") window.selectAnswer = selectAnswer;
  if (typeof skipQuestion === "function") window.skipQuestion = skipQuestion;
  if (typeof showQuizResults === "function") window.showQuizResults = showQuizResults;
  if (typeof finishOnboarding === "function") window.finishOnboarding = finishOnboarding;

  // tasks
  if (typeof addTask === "function") window.addTask = addTask;
  if (typeof editTask === "function") window.editTask = editTask;
  if (typeof saveEditedTask === "function") window.saveEditedTask = saveEditedTask;
  if (typeof deleteTask === "function") window.deleteTask = deleteTask;

  // suggest flow
  if (typeof suggestTasks === "function") window.suggestTasks = suggestTasks;
})();
