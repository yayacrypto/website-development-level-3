const STORAGE_KEY = "level3-study-tracker";

const form = document.querySelector("#add-form");
const input = document.querySelector("#new-task");
const list = document.querySelector("#task-list");
const summary = document.querySelector("#summary");
const filterButtons = document.querySelectorAll("[data-filter]");
const tip = document.querySelector("#tip");

let tasks = loadTasks();
let filter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function visibleTasks() {
  if (filter === "active") return tasks.filter((task) => !task.done);
  if (filter === "done") return tasks.filter((task) => task.done);
  return tasks;
}

function render() {
  list.replaceChildren();

  for (const task of visibleTasks()) {
    const item = document.createElement("li");
    item.className = task.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark done: " + task.text);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      render();
    });

    // textContent keeps user text as plain text, never as HTML.
    const label = document.createElement("span");
    label.textContent = task.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", "Remove: " + task.text);
    remove.addEventListener("click", () => {
      tasks = tasks.filter((other) => other.id !== task.id);
      saveTasks();
      render();
    });

    item.append(checkbox, label, remove);
    list.append(item);
  }

  const doneCount = tasks.filter((task) => task.done).length;
  summary.textContent = tasks.length === 0
    ? "No tasks yet. Add your first one."
    : doneCount + " of " + tasks.length + " done.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") return;

  tasks.push({ id: Date.now() + Math.random(), text, done: false });
  saveTasks();
  input.value = "";
  render();
});

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    for (const other of filterButtons) {
      other.setAttribute("aria-pressed", String(other === button));
    }
    render();
  });
}

async function loadTip() {
  try {
    const response = await fetch("data/tips.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    const tips = await response.json();
    tip.textContent = tips[Math.floor(Math.random() * tips.length)];
  } catch (error) {
    // fetch is blocked when you open index.html directly from disk.
    tip.textContent = "Tip: run a local server to load tips from data/tips.json.";
  }
}

render();
loadTip();
