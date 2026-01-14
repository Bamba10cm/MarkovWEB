

const employees = [
  {
    id: 1,
    name: "Иван Петров",
    role: "Разработчик",
    tasks: [
      { id: 1, title: "Модуль авторизации", progress: 100 },
      { id: 2, title: "Интеграция API", progress: 60 },
      { id: 3, title: "Написание тестов", progress: 20 }
    ]
  },
  {
    id: 2,
    name: "Анна Смирнова",
    role: "Дизайнер",
    tasks: [
      { id: 1, title: "UI макеты", progress: 80 },
      { id: 2, title: "Стиль-гайд", progress: 40 }
    ]
  },
  {
    id: 3,
    name: "Павел Кузнецов",
    role: "Аналитик",
    tasks: [
      { id: 1, title: "Сбор требований", progress: 100 },
      { id: 2, title: "Диаграммы процессов", progress: 50 },
      { id: 3, title: "Отчет для руководства", progress: 10 }
    ]
  }
];


const chatMessages = [
  {
    id: 1,
    senderId: 1,
    text: "Доброе утро! Я закончил модуль авторизации.",
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    senderId: 2,
    text: "Круто, я обновлю макеты с учетом новых полей.",
    timestamp: new Date().toISOString()
  }
];


let currentEmployeeId = employees[0]?.id || null;



function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function calcEmployeeAvgProgress(employee) {
  if (!employee.tasks.length) return 0;
  const sum = employee.tasks.reduce((acc, t) => acc + t.progress, 0);
  return Math.round(sum / employee.tasks.length);
}

function progressToStatus(progress) {
  if (progress >= 100) return "done";
  if (progress > 0) return "in-progress";
  return "not-started";
}


const employeeListEl = document.getElementById("employeeList");
const employeeNameTitleEl = document.getElementById("employeeNameTitle");
const taskListEl = document.getElementById("taskList");
const chatWindowEl = document.getElementById("chatWindow");
const chatMessageInputEl = document.getElementById("chatMessageInput");
const sendMessageBtnEl = document.getElementById("sendMessageBtn");
const managerEmployeeSelectEl = document.getElementById("managerEmployeeSelect");

function renderEmployeeList() {
  employeeListEl.innerHTML = "";

  employees.forEach((emp) => {
    const li = document.createElement("li");
    li.dataset.id = emp.id;

    const avg = calcEmployeeAvgProgress(emp);

    li.innerHTML = `
      <span class="name">${emp.name}</span>
      <span class="progress">${avg}%</span>
    `;

    if (emp.id === currentEmployeeId) {
      li.classList.add("active");
    }

    li.addEventListener("click", () => {
      currentEmployeeId = emp.id;
      updateEmployeeView();
      renderEmployeeList();
    });

    employeeListEl.appendChild(li);
  });
}

function renderTasks() {
  const employee = employees.find((e) => e.id === currentEmployeeId);
  if (!employee) return;

  employeeNameTitleEl.textContent = `Задания: ${employee.name}`;

  taskListEl.innerHTML = "";
  employee.tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const statusClass = progressToStatus(task.progress);
    let statusLabel = "";
    if (statusClass === "done") statusLabel = "Выполнено";
    else if (statusClass === "in-progress") statusLabel = "В работе";
    else statusLabel = "Не начато";

    li.innerHTML = `
      <div class="task-header">
        <span>${task.title}</span>
        <span class="task-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${task.progress}%;"></div>
      </div>
    `;

    taskListEl.appendChild(li);
  });
}


function renderChat() {
  chatWindowEl.innerHTML = "";


  chatMessages.forEach((msg) => {
    const sender = employees.find((e) => e.id === msg.senderId);
    const div = document.createElement("div");
    div.className = "chat-message";

    div.innerHTML = `
      <div class="chat-message-header">
        <span>${sender ? sender.name : "Сотрудник"}</span>
        <span>${formatTime(msg.timestamp)}</span>
      </div>
      <div class="chat-message-text">${msg.text}</div>
    `;
    chatWindowEl.appendChild(div);
  });

  chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
}

function handleSendMessage() {
  const text = chatMessageInputEl.value.trim();
  if (!text) return;

 
  chatMessages.push({
    id: chatMessages.length + 1,
    senderId: currentEmployeeId,
    text,
    timestamp: new Date().toISOString()
  });

  chatMessageInputEl.value = "";
  renderChat();
}

sendMessageBtnEl.addEventListener("click", handleSendMessage);
chatMessageInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSendMessage();
  }
});



const tabButtons = document.querySelectorAll(".tab-btn");
const views = document.querySelectorAll(".view");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetViewId = btn.dataset.view;

    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    views.forEach((v) => {
      v.classList.toggle("active", v.id === targetViewId);
    });
  });
});



let overallProgressChart;
let employeeTasksChart;

function initManagerEmployeeSelect() {
  managerEmployeeSelectEl.innerHTML = "";
  employees.forEach((emp) => {
    const option = document.createElement("option");
    option.value = emp.id;
    option.textContent = emp.name;
    managerEmployeeSelectEl.appendChild(option);
  });
  managerEmployeeSelectEl.value = String(currentEmployeeId);
}

function renderOverallProgressChart() {
  const ctx = document.getElementById("overallProgressChart").getContext("2d");

  const labels = employees.map((e) => e.name);
  const data = employees.map((e) => calcEmployeeAvgProgress(e));

  if (overallProgressChart) {
    overallProgressChart.destroy();
  }

  overallProgressChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Средний прогресс, %",
          data
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

function renderEmployeeTasksChart() {
  const ctx = document.getElementById("employeeTasksChart").getContext("2d");
  const employeeId = Number(managerEmployeeSelectEl.value);
  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) return;

  const labels = employee.tasks.map((t) => t.title);
  const data = employee.tasks.map((t) => t.progress);

  if (employeeTasksChart) {
    employeeTasksChart.destroy();
  }

  employeeTasksChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: `Прогресс задач: ${employee.name}`,
          data
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

managerEmployeeSelectEl.addEventListener("change", () => {
  renderEmployeeTasksChart();
});

// ====== ОБНОВЛЕНИЕ ВИДОВ ======

function updateEmployeeView() {
  renderTasks();
  renderChat();
}

function init() {
  renderEmployeeList();
  updateEmployeeView();

  // Руководитель
  initManagerEmployeeSelect();
  renderOverallProgressChart();
  renderEmployeeTasksChart();
}

document.addEventListener("DOMContentLoaded", init);
