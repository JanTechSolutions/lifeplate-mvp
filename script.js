// ===============================
// 🚀 LifePlate App – script.js (CLEAN MVP FINAL BUILD)
// ===============================

// ========== GLOBAL VARIABLES ========== //
let currentScreen = "";

// ========== UTILITIES ========== //
function $(id) {
  return document.getElementById(id);
}

function saveToLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocal(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// ========== MAIN APP SCREENS ========== //
function showHomeScreen() {
  currentScreen = "home";
  $("app").innerHTML = `
    <h1>Welcome to LifePlate 🍽️</h1>
    <button onclick="startOnboarding()">Start</button>
  `;
}

function showPromptScreen() {
  currentScreen = "prompt";
  $("app").innerHTML = `
    <h2>Prompt Time 💡</h2>
    <input type="text" id="newTask" placeholder="Enter a task" />
    <button onclick="addTask()">Add Task</button>
    <br><br>
    <button onclick="showTaskSuggestions()">Clear or Navigate Your Plate</button>
    <br><br>
    <button onclick="viewTasks()">View Your Plate</button>
  `;
}

function viewTasks() {
  currentScreen = "view";
  const tasks = loadFromLocal("tasks");
  if (!tasks.length) return showPromptScreen();
  let html = "<h2>Your Plate 🍽️</h2>";
  tasks.forEach((t, i) => {
    html += `<div>
      <strong>${t.title}</strong>
      <button onclick="editTask(${i})">✏️</button>
      <button onclick="deleteTask(${i})">🗑️</button>
    </div>`;
  });
  html += `<br><button onclick="showPromptScreen()">⬅ Back</button>`;
  $("app").innerHTML = html;
}

// ========== TASK MANAGEMENT ========== //
function addTask() {
  const task = $("newTask").value.trim();
  if (!task) return;
  const tasks = loadFromLocal("tasks");
  tasks.push({ title: task });
  saveToLocal("tasks", tasks);
  $("newTask").value = "";
  showPromptScreen();
}

function deleteTask(index) {
  const tasks = loadFromLocal("tasks");
  tasks.splice(index, 1);
  saveToLocal("tasks", tasks);
  viewTasks();
}

function editTask(index) {
  const tasks = loadFromLocal("tasks");
  const newTitle = prompt("Edit task:", tasks[index].title);
  if (newTitle !== null) {
    tasks[index].title = newTitle;
    saveToLocal("tasks", tasks);
    viewTasks();
  }
}

// ========== SUGGESTIONS & SUPPORT ========== //
function showTaskSuggestions() {
  const tasks = loadFromLocal("tasks");
  let html = `<h2>Suggested Tasks 🌟</h2>`;
  if (tasks.length === 0) {
    html += `<p>No tasks to suggest. Add some first!</p>`;
  } else {
    tasks.slice(0, 3).forEach(t => {
      html += `<p>• ${t.title}</p>`;
    });
  }
  html += `<br><button onclick="showPromptScreen()">⬅ Back</button>`;
  $("app").innerHTML = html;
}

// ========== INIT ========== //
document.addEventListener("DOMContentLoaded", showHomeScreen);

// ========== GLOBAL VARIABLES ========== //
let currentScreen = "";

// ========== UTILITIES ========== //
function $(id) {
  return document.getElementById(id);
}

function saveToLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocal(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// ========== MAIN APP SCREENS ========== //
function showHomeScreen() {
  currentScreen = "home";
  $("app").innerHTML = `
    <h1>Welcome to LifePlate 🍽️</h1>
    <button onclick="startOnboarding()">Start</button>
  `;
}

function showPromptScreen() {
  currentScreen = "prompt";
  $("app").innerHTML = `
    <h2>Add a Task 💡</h2>
    <input type="text" id="taskTitle" placeholder="Task title"/><br><br>
    <input type="number" id="taskDuration" placeholder="Duration (min)"/><br><br>
    <select id="taskEnergy">
      <option value="Low">Low Energy</option>
      <option value="Medium">Medium Energy</option>
      <option value="High">High Energy</option>
    </select><br><br>
    <input type="text" id="taskCategory" placeholder="Category (e.g. Work, Health)"/><br><br>
    <button onclick="addTask()">➕ Add Task</button>
    <hr>
    <button onclick="showTaskSuggestions()">⚡ Clear or Navigate Your Plate</button>
    <button onclick="viewTasks()">🍽️ View Your Plate</button>
  `;
}

function viewTasks() {
  currentScreen = "view";
  const tasks = loadFromLocal("tasks");
  if (!tasks.length) return showPromptScreen();
  let html = "<h2>Your Plate 🍽️</h2>";
  tasks.forEach((t, i) => {
    html += `<div>
      <strong>${t.title}</strong> – ${t.duration} min • ${t.energy} • ${t.category}
      <button onclick="editTask(${i})">✏️</button>
      <button onclick="deleteTask(${i})">🗑️</button>
    </div>`;
  });
  html += `<br><button onclick="showPromptScreen()">⬅ Back</button>`;
  $("app").innerHTML = html;
}

// ========== TASK MANAGEMENT ========== //
function addTask() {
  const title = $("taskTitle").value.trim();
  const duration = parseInt($("taskDuration").value);
  const energy = $("taskEnergy").value;
  const category = $("taskCategory").value.trim();
  if (!title || isNaN(duration)) return;
  const tasks = loadFromLocal("tasks");
  tasks.push({ title, duration, energy, category });
  saveToLocal("tasks", tasks);
  showPromptScreen();
}

function deleteTask(index) {
  const tasks = loadFromLocal("tasks");
  tasks.splice(index, 1);
  saveToLocal("tasks", tasks);
  viewTasks();
}

function editTask(index) {
  const tasks = loadFromLocal("tasks");
  const newTitle = prompt("Edit task:", tasks[index].title);
  if (newTitle !== null) {
    tasks[index].title = newTitle;
    saveToLocal("tasks", tasks);
    viewTasks();
  }
}

// ========== SUGGESTIONS & SUPPORT ========== //
function showTaskSuggestions() {
  const tasks = loadFromLocal("tasks");
  let html = `<h2>Suggested Tasks 🌟</h2>`;
  if (tasks.length === 0) {
    html += `<p>No tasks to suggest. Add some first!</p>`;
  } else {
    tasks.slice(0, 3).forEach(t => {
      html += `<p>• ${t.title} – ${t.duration} min • ${t.energy}</p>`;
    });
  }
  html += `<br><button onclick="showPromptScreen()">⬅ Back</button>`;
  $("app").innerHTML = html;
}

// ========== INIT ========== //
document.addEventListener("DOMContentLoaded", showHomeScreen);

// ========== GLOBAL VARIABLES ========== //
let currentScreen = "";

// ========== UTILITIES ========== //
function $(id) {
  return document.getElementById(id);
}

function saveToLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocal(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// ========== MAIN APP SCREENS ========== //
function showHomeScreen() {
  currentScreen = "home";
  $("app").innerHTML = `
    <h1>Welcome to LifePlate 🍽️</h1>
    <button onclick="startOnboarding()">Start</button>
  `;
}

function showPromptScreen() {
  currentScreen = "prompt";
  $("app").innerHTML = `
    <h2>Add a Task 💡</h2>
    <input type="text" id="taskTitle" placeholder="Task title"/><br><br>
    <input type="number" id="taskDuration" placeholder="Duration (min)"/><br><br>
    <select id="taskEnergy">
      <option value="Low">Low Energy</option>
      <option value="Medium">Medium Energy</option>
      <option value="High">High Energy</option>
    </select><br><br>
    <input type="text" id="taskCategory" placeholder="Category (e.g. Work, Health)"/><br><br>
    <input type="date" id="taskDueDate"/><br><br>
    <input type="text" id="taskTags" placeholder="Tags (comma separated)"/><br><br>
    <input type="text" id="taskLocation" placeholder="Location (e.g. Home, Gym, Library)"/><br><br>
    <textarea id="taskNotes" placeholder="Notes or links..."></textarea><br><br>
    <button onclick="addTask()">➕ Add Task</button>
    <hr>
    <button onclick="showTaskSuggestions()">⚡ Clear or Navigate Your Plate</button>
    <button onclick="viewTasks()">🍽️ View Your Plate</button>
  `;
}

function viewTasks() {
  currentScreen = "view";
  const tasks = loadFromLocal("tasks");
  if (!tasks.length) return showPromptScreen();
  let html = "<h2>Your Plate 🍽️</h2>";
  tasks.forEach((t, i) => {
    html += `<div style="border: 1px solid #ccc; padding: 8px; margin: 6px 0;">
      <strong>${t.title}</strong><br>
      ${t.duration} min • ${t.energy} • ${t.category}<br>
      Due: ${t.dueDate || "N/A"}<br>
      Tags: ${t.tags.join(", ")}<br>
      Location: ${t.location || "-"}<br>
      Notes: ${t.notes || "-"}<br>
      <button onclick="editTask(${i})">✏️</button>
      <button onclick="deleteTask(${i})">🗑️</button>
    </div>`;
  });
  html += `<br><button onclick="showPromptScreen()">⬅ Back</button>`;
  $("app").innerHTML = html;
}

// ========== TASK MANAGEMENT ========== //
function addTask() {
  const title = $("taskTitle").value.trim();
  const duration = parseInt($("taskDuration").value);
  const energy = $("taskEnergy").value;
  const category = $("taskCategory").value.trim();
  const dueDate = $("taskDueDate").value;
  const tags = $("taskTags").value.split(",").map(t => t.trim());
  const location = $("taskLocation").value.trim();
  const notes = $("taskNotes").value.trim();

  if (!title || isNaN(duration)) return;
  const tasks = loadFromLocal("tasks");
  tasks.push({ title, duration, energy, category, dueDate, tags, location, notes });
  saveToLocal("tasks", tasks);
  showPromptScreen();
}

function deleteTask(index) {
  const tasks = loadFromLocal("tasks");
  tasks.splice(index, 1);
  saveToLocal("tasks", tasks);
  viewTasks();
}

function editTask(index) {
  const tasks = loadFromLocal("tasks");
  const newTitle = prompt("Edit task:", tasks[index].title);
  if (newTitle !== null) {
    tasks[index].title = newTitle;
    saveToLocal("tasks", tasks);
    viewTasks();
  }
}

// ========== SUGGESTIONS & SUPPORT ========== //
function showTaskSuggestions() {
  const tasks = loadFromLocal("tasks");
  let html = `<h2>Suggested Tasks 🌟</h2>`;
  if (tasks.length === 0) {
    html += `<p>No tasks to suggest. Add some first!</p>`;
  } else {
    tasks.slice(0, 3).forEach(t => {
      html += `<p>• ${t.title} – ${t.duration} min • ${t.energy}</p>`;
    });
  }
  html += `<br><button onclick="showPromptScreen()">⬅ Back</button>`;
  $("app").innerHTML = html;
}

// ========== INIT ========== //
document.addEventListener("DOMContentLoaded", showHomeScreen);

// ========== VIEW TASKS + PIE CHART ==========
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
        backgroundColor: [
          '#6c63ff', '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'
        ]
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

// ========== VIEW SINGLE TASK ==========
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

// ========== DELETE TASK ==========
function deleteTask(index) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  viewTasks();
}

// ========== EDIT TASK ==========
function editTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];
  if (!task) return viewTasks();

  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const locations = JSON.parse(localStorage.getItem("locations")) || [];

  const categoryOptions = categories.map((c) => `<option value="${c}" ${task.category === c ? "selected" : ""}>${c}</option>`).join("");
  const locationOptions = locations.map((l) => `<option value="${l}" ${task.location === l ? "selected" : ""}>${l}</option>`).join("");

  document.getElementById("app").innerHTML = `
    <h2>Edit Task</h2>
    <input id="taskTitle" value="${task.title}" /><br><br>
    <label>Category:</label><select id="taskCategory">${categoryOptions}</select><br><br>
    <label>Energy:</label>
    <select id="taskEnergy">
      <option ${task.energy === "Low" ? "selected" : ""}>Low</option>
      <option ${task.energy === "Medium" ? "selected" : ""}>Medium</option>
      <option ${task.energy === "High" ? "selected" : ""}>High</option>
    </select><br><br>
    <label>Tags:</label><input id="taskTags" value="${task.tags.join(", ")}" /><br><br>
    <label>Duration (min):</label><input id="taskDuration" type="number" value="${task.duration}" /><br><br>
    <label>Due Date:</label><input id="taskDueDate" type="date" value="${task.dueDate}" /><br><br>
    <label>Location:</label><select id="taskLocation">${locationOptions}</select><br><br>
    <label>Notes:</label><textarea id="taskNotes">${task.notes || ""}</textarea><br><br>
    <button onclick="saveEditedTask(${index})">Save</button>
    <button onclick="viewSingleTask(${index})">⬅ Back</button>
  `;
}

function saveEditedTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];

  task.title = document.getElementById("taskTitle").value;
  task.category = document.getElementById("taskCategory").value;
  task.energy = document.getElementById("taskEnergy").value;
  task.tags = document.getElementById("taskTags").value.split(',').map(t => t.trim());
  task.duration = parseInt(document.getElementById("taskDuration").value);
  task.dueDate = document.getElementById("taskDueDate").value;
  task.location = document.getElementById("taskLocation").value;
  task.notes = document.getElementById("taskNotes").value;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  viewSingleTask(index);
}
// ========== GLOBAL MOOD AFFIRMATIONS ==========
const moodAffirmations = {
  Overwhelmed: "Breathe. It's okay to take things one step at a time.",
  Focused: "You're in the zone — let's channel it into meaningful progress.",
  Tired: "Rest is productive too. Here's something gentle to start with.",
  Energized: "You've got momentum! Let’s use it wisely.",
  Avoidant: "Avoidance is often wisdom in disguise. Let’s ease into one small win."
};

// ========== MOOD → ENERGY MAPPING ==========
function getEnergyFromMood(mood) {
  const mapping = {
    Overwhelmed: "Low",
    Tired: "Low",
    Avoidant: "Medium",
    Focused: "Medium",
    Energized: "High"
  };
  return mapping[mood] || "Medium"; // Fallback to Medium if undefined
}

// ========== SUGGEST TASKS ==========
function suggestTasks() {
  const time = parseInt(document.getElementById("availableTime").value);
  const mood = document.getElementById("moodCheck").value;
  const inferredEnergy = getEnergyFromMood(mood);

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const energyRank = { Low: 1, Medium: 2, High: 3 };

  // Affirmation from mood
  const affirmation = moodAffirmations[mood] || "Let's get started.";

  // Quiz prompt suggestion
  const quizScores = JSON.parse(localStorage.getItem("quizScores")) || {};
  const topTags = getTopPromptTags(quizScores);
  const promptSuggestions = getPromptsByTags(topTags);
  const randomPrompt = promptSuggestions.length > 0
    ? promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)].text
    : null;

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
  if (randomPrompt) {
    html += `<p><strong>Try this:</strong> ${randomPrompt}</p>`;
  }
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

  // Save mood to history
  localStorage.setItem("mood", mood);
  let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
  history.push({ mood, timestamp: new Date().toISOString() });
  localStorage.setItem("moodHistory", JSON.stringify(history));
}

// ========== SHOW TASK SUGGESTION INPUT ==========
function showTaskSuggestions() {
  document.getElementById("app").innerHTML = `
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

    <button onclick="suggestTasks()">Show Me Tasks</button>
    <button onclick="showPromptScreen()">⬅ Back</button>
    <button onclick="showSupportScreen()">Reflect & Support</button>
  `;
}
// ========== PHASE 6: Support & Reflect Screen ==========
function showSupportScreen() {
  const moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];
  const lastMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1].mood : null;
  const affirmation = lastMood ? moodAffirmations[lastMood] : "Reflect on what’s worked for you today.";

  let html = `<h2>Reflect & Support</h2>`;
  html += `<p><strong>Last Mood:</strong> ${lastMood || "N/A"}</p>`;
  html += `<p><em>“${affirmation}”</em></p>`;

  // Show mood history
  html += `<h3>📊 Mood History</h3>`;
  if (moodHistory.length === 0) {
    html += `<p>No moods logged yet.</p>`;
  } else {
    html += `<ul>`;
    moodHistory.slice(-5).reverse().forEach(entry => {
      const date = new Date(entry.timestamp);
      html += `<li>${date.toLocaleString()}: <strong>${entry.mood}</strong></li>`;
    });
    html += `</ul>`;
  }

  html += `
    <br>
    <button onclick="showEngageScreen()">🏠 Home</button>
    <button onclick="showPromptScreen()">⬅ Back to Prompt</button>
    <button onclick="resetApp()">🧼 Reset App</button>
  `;

  document.getElementById("app").innerHTML = html;
}
