
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const taskCount = document.querySelector("#taskCount");
const emptyState = document.querySelector("#emptyState");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = loadTasks();
let currentFilter = "all";
let editingTaskId = null;

renderTasks();

taskForm.addEventListener("submit", (event) => {
   event.preventDefault();

   const text = taskInput.value.trim();

   if (!text) {
      taskInput.focus();
      return;
   }

   if (editingTaskId) {
      const task = tasks.find((item) => item.id === editingTaskId);

      if (task) {
         task.text = text;
      }

      editingTaskId = null;
      taskForm.querySelector("button[type='submit']").textContent = "Add task";
   } else {
      tasks.push({
         id: `${Date.now()}-${Math.random()}`,
         text,
         completed: false
      });
   }

   saveTasks();
   renderTasks();
   taskForm.reset();
   taskInput.focus();
});

filterButtons.forEach((button) => {
   button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;

      filterButtons.forEach((filterButton) => {
         const isActive = filterButton === button;

         filterButton.classList.toggle("active", isActive);
         filterButton.setAttribute("aria-pressed", String(isActive));
      });

      renderTasks();
   });
});

taskList.addEventListener("change", (event) => {
   if (!event.target.matches(".task-checkbox")) {
      return;
   }

   const task = tasks.find((item) => item.id === event.target.dataset.id);

   if (!task) {
      return;
   }

   task.completed = event.target.checked;

   saveTasks();
   renderTasks();
});

taskList.addEventListener("click", (event) => {
   const button = event.target.closest("button[data-action]");

   if (!button) {
      return;
   }

   const task = tasks.find((item) => item.id === button.dataset.id);

   if (!task) {
      return;
   }

   if (button.dataset.action === "edit") {
      editingTaskId = task.id;
      taskInput.value = task.text;
      taskForm.querySelector("button[type='submit']").textContent = "Save changes";
      taskInput.focus();
   } else if (button.dataset.action === "delete") {
      tasks = tasks.filter((item) => item.id !== task.id);

      if (editingTaskId === task.id) {
         editingTaskId = null;
         taskForm.reset();
         taskForm.querySelector("button[type='submit']").textContent = "Add task";
      }

      saveTasks();
      renderTasks();
   }
});

function loadTasks() {
   try {
      const savedTasks = JSON.parse(
         window.localStorage.getItem("todoTasks")
      );

      if (!Array.isArray(savedTasks)) {
         return [];
      }

      return savedTasks.filter((task) => (
         task &&
         typeof task.id === "string" &&
         typeof task.text === "string" &&
         typeof task.completed === "boolean"
      ));
   } catch {
      return [];
   }
}

function saveTasks() {
   try {
      window.localStorage.setItem("todoTasks", JSON.stringify(tasks));
   } catch {
      alert("Tasks could not be saved in this browser.");
   }
}

function renderTasks() {
   const filteredTasks = tasks.filter((task) => {
      if (currentFilter === "active") {
         return !task.completed;
      }

      if (currentFilter === "completed") {
         return task.completed;
      }

      return true;
   });

   taskList.innerHTML = filteredTasks.map((task) => `
      <li class="task-item ${task.completed ? "completed" : ""}">
         <input
            class="task-checkbox"
            type="checkbox"
            data-id="${task.id}"
            aria-label="Mark task as ${task.completed ? "active" : "completed"}"
            ${task.completed ? "checked" : ""}
         >

         <span class="task-text">${escapeHTML(task.text)}</span>

         <div class="task-actions">
            <button
               class="task-action"
               type="button"
               data-action="edit"
               data-id="${task.id}"
            >Edit</button>

            <button
               class="task-action delete-button"
               type="button"
               data-action="delete"
               data-id="${task.id}"
            >Delete</button>
         </div>
      </li>
   `).join("");

   taskCount.textContent = tasks.length;
   emptyState.hidden = filteredTasks.length > 0;

   if (tasks.length === 0) {
      emptyState.textContent = "No tasks yet. Add your first task above.";
   } else if (filteredTasks.length === 0) {
      emptyState.textContent = "No tasks match this filter.";
   }
}

function escapeHTML(text) {
   return text.replace(/[&<>"']/g, (character) => {
      const characters = {
         "&": "&amp;",
         "<": "&lt;",
         ">": "&gt;",
         '"': "&quot;",
         "'": "&#39;"
      };

      return characters[character];
   });
}
