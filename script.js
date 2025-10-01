// ===============================
// 🚀 LifePlate App – script.js (CLEAN SINGLE VERSION)
// ===============================

// ---------- GLOBAL ----------
var currentScreen = ""; // use var to avoid redeclare errors

// ---------- UTILITIES ----------
function $(id) { return document.getElementById(id); }
function saveToLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function loadFromLocal(key) { return JSON.parse(localStorage.getItem(key)) || []; }

// ---------- HOME ----------
function showHomeScreen() {
  currentScreen = "home";
  $("app").innerHTML = `
    <h1>Welcome to LifePlate 🍽️</h1>
    <button onclick="startOnboarding()">Start</button>
  `;
}
function startOnboarding() {
  showPromptScreen();
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
  `;
}

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
