const todayDate = document.getElementById("today-date");
const todayBody = document.getElementById("today-body");
const todayPreview = document.querySelector("#today-preview");
const messageTodo = document.querySelector(".messageTodo");
const messageShop = document.querySelector(".messageShop");
const messageDate = document.querySelector(".messageDate");
const messageSaved = document.querySelector(".messageSaved");
const main = document.querySelector(".mainContainer");
const taskList = document.getElementById("date-tasks");
const savedList = document.getElementById("saved-tasks");
const generalTask = document.getElementById("general-tasks");
const dateTodo = document.getElementById("dateTodo-input");
const dateTask = document.getElementById("today-tasks");
const shopList = document.getElementById("shopItems");
const shopItem = document.getElementById("shopping-input");
const generalTodo = document.getElementById("general-input");
const dateTasks = document.querySelectorAll("#date-tasks li");
// Format Date for Task Class
let date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");
const actDate = `${year}-${month}-${day}`;

let generalTasks = [];
let shopItems = [];
let savedTasks = [];
let tasks = [];
/////////////////////////////////////////// General Funktions ////////////
//////////////// Info Box
document.querySelector(".appName").addEventListener("click", () => {
  const info = document.querySelector(".infoText");
  document.querySelector(".info").classList.remove("hidden");
  setTimeout(() => {
    info.scrollTop = 0;
  }, 50);
});
document.querySelector(".info").addEventListener("click", (e) => {
  const btn = e.target.closest(".close");
  if (!btn) return;
  document.querySelector(".info").classList.add("hidden");
});
/////////// Info Box End //////
// Display Date for Today Above
const formatDate = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const today = new Date();
  const dayOfWeek = days[today.getDay()];
  const day = today.getDate();
  const month = months[today.getMonth()];
  const year = today.getFullYear().toString().slice(-2);
  return `TODAY | ${dayOfWeek} ${day} ${month} ${year}`;
};
todayDate.innerHTML = formatDate();

// Toggle Today Section
const toggleTodayDiv = () => {
  const hasTodayTask = tasks.some((task) => task.date === actDate);
  if (hasTodayTask) {
    todayBody.classList.toggle("hidden");
    !todayBody.classList.contains("hidden")
      ? main.classList.add("hidden")
      : main.classList.remove("hidden");
  }
};

// Navigation
const toggleSection = (button) => {
  // Hide all sections
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => (section.style.display = "none"));
  // Render section that belongs to data-target of btn
  const targetSectionId = button.dataset.target;
  const sectionToShow = document.getElementById(targetSectionId);
  sectionToShow.style.display = "block";
  todayBody.classList.add("hidden");
  main.classList.remove("hidden");
};
// progress border style
const interpolateColor = (color1, color2, factor) => {
  const r = Math.round(color1[0] + factor * (color2[0] - color1[0]));
  const g = Math.round(color1[1] + factor * (color2[1] - color1[1]));
  const b = Math.round(color1[2] + factor * (color2[2] - color1[2]));
  return `${r}, ${g}, ${b}`;
};
const calculateProgress = (section) => {
  const tasksCalc = document.querySelectorAll(`
    #${section} li input[type="checkbox"]`);
  let todaysTasks;
  // progress for general and today
  if (section === "general-tasks" || section === "today-tasks") {
    const sectionProgress = document.getElementById(
      `${section === "general-tasks" ? "general-progress" : "today-progress"}`
    );
    const total = tasksCalc.length;
    const completed = Array.from(tasksCalc).filter(
      (task) => task.checked
    ).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    sectionProgress.innerText = `${percent}%`;
    total === 0
      ? (sectionProgress.style.opacity = 0.4)
      : (sectionProgress.style.opacity = 1);
    // progress border style
    const colors = [
      [255, 158, 74],
      [255, 107, 107],
      [199, 77, 206],
      [87, 193, 232],
      [110, 210, 122],
    ];
    sectionProgress.style.borderColor =
      percent <= 0
        ? `rgb(${colors[0].join(",")})`
        : percent < 25
        ? `rgb(${interpolateColor(colors[0], colors[1], percent / 25)})`
        : percent < 50
        ? `rgb(${interpolateColor(colors[1], colors[2], (percent - 25) / 25)})`
        : percent < 75
        ? `rgb(${interpolateColor(colors[2], colors[3], (percent - 50) / 25)})`
        : percent < 100
        ? `rgb(${interpolateColor(colors[3], colors[4], (percent - 75) / 25)})`
        : `rgb(${colors[4].join(",")})`;
    saveAppState();
  }
  // checked-status
  tasksCalc.forEach((checkbox, index) => {
    const checkedYes = checkbox.checked;
    if (section === "general-tasks" && generalTasks[index]) {
      generalTasks[index].isChecked = checkedYes;
    }
    if (section === "shopItems" && shopItems[index]) {
      shopItems[index].isChecked = checkedYes;
    }
    if (section === "today-tasks") {
      const taskText = checkbox.previousElementSibling.textContent;
      todaysTasks = taskText;
      tasks.forEach((taskSection) => {
        if (taskSection.date === actDate)
          taskSection.text.forEach((t) => {
            if (t.name === todaysTasks) t.isChecked = checkedYes;
          });
      });
    }

    saveAppState();
  });
};

const liToggle = (li, btn) => {
  li.addEventListener("click", (e) => {
    const check = li.querySelector('input[type="checkbox"]');
    if (
      e.target.tagName.toLowerCase() === "input" ||
      e.target.classList.contains("delete-button")
    ) {
      return;
    }

    if (btn.style.display === "none") {
      btn.style.display = "block";
      check.style.display = "none";
    } else {
      btn.style.display = "none";
      check.style.display = "block";
    }
  });
};

const deleteTask = (
  e,
  list,
  calculateProgressFunction,
  previewElement = null,
  emptyMessage = "No tasks left, you did 100% today!"
) => {
  e.stopPropagation();
  const li = e.target.closest("li");
  // find value to be deleted
  const deleteTaskText = li.textContent.slice(0, -1);
  li.remove();

  // find index of the value to be deleted
  const taskIndex = list.findIndex((task) => task.name === deleteTaskText);

  // delete task from array/list
  if (taskIndex !== -1) {
    list.splice(taskIndex, 1);
  }

  // render previewMessage of today-div
  if (list.length === 0 && previewElement) {
    previewElement.textContent = emptyMessage;
    todayBody.style.display = "none";
    main.classList.remove("hidden");
    tasks.forEach((todaysTasks, i) => {
      if (todaysTasks.date === actDate) tasks.splice(i, 1);
    });
  } else if (previewElement) {
    previewElement.textContent = list[0].name;
  }
  if (calculateProgressFunction) {
    calculateProgressFunction();
  }
  saveAppState();
};

const renderMessage = (messageBox, array) => {
  array.length === 0
    ? messageBox.classList.remove("hidden")
    : messageBox.classList.add("hidden");
};

// ask to delete checked tasks
const deleteCheckedTasks = (tsk) => {
  const checkedOnes = tsk.filter((t) => t.isChecked).length;
  if (checkedOnes > 4) {
    document.querySelector(
      ".confirmMsg p"
    ).textContent = `You have more than ${checkedOnes} checked ${
      tsk === generalTasks ? "tasks or notes" : "shop items"
    }. Do you want to delete them?`;
    document.querySelector(".confirm").classList.remove("hidden");

    const yesBtn = document.querySelector(".yesBtn");
    const noBtn = document.querySelector(".noBtn");

    const handleYesClick = () => {
      for (let i = tsk.length - 1; i >= 0; i--) {
        if (tsk[i].isChecked) {
          tsk.splice(i, 1);
          document.querySelector(".confirm").classList.add("hidden");
          saveAppState();
          location.reload(); // true
        }
      }
    };

    const handleNoClick = () => {
      document.querySelector(".confirm").classList.add("hidden");
    };

    yesBtn.removeEventListener("click", handleYesClick);
    noBtn.removeEventListener("click", handleNoClick);

    yesBtn.addEventListener("click", handleYesClick);
    noBtn.addEventListener("click", handleNoClick);
  }
};

///////////////////////////////////////////////// General App Funktions End //////////////////////

////////////////////////////////Funktions for Tasks Sections //////////////////
// Class for Todays Tasks
class Task {
  constructor(text, date) {
    this.text = text;
    this.date = date;
  }
}

// create Task Class for Todays Tasks
const addTask = (text, date) => {
  const newTask = new Task(text, date);
  tasks.push(newTask);
  savedList.innerHTML = "";
  taskList.innerHTML = "";
  saveAppState();
};

//
const renderList = function (toDo, section, actualTask, deleteFunc) {
  let input;
  if (toDo) {
    input = toDo.value;
    toDo.value = "";
  }
  if (input === null) {
    input = actualTask.name;
  }
  const ul = section;
  const li = document.createElement("li");
  li.classList.add("task-item");
  li.innerHTML = `<span>${input}</span>`;
  const deleteButton = document.createElement("div");
  deleteButton.innerHTML = "&times;";
  deleteButton.classList.add("delete-button");
  deleteButton.style.display = "none";

  if (section === generalTask) {
    li.innerHTML = `<span>${
      input ? input : actualTask.name
    }</span><input type="checkbox" ${
      input
        ? input.isChecked
          ? "checked"
          : ""
        : actualTask.isChecked
        ? "checked"
        : ""
    } onclick="calculateProgress('general-tasks')">`;
  }

  if (section === dateTask) {
    li.innerHTML = `<span>${actualTask.name}</span><input type="checkbox" ${
      actualTask.isChecked ? "checked" : ""
    } onclick="calculateProgress('today-tasks')">`;
  }

  if (section === shopList) {
    li.innerHTML = `<span>${
      input ? input : actualTask.name
    }</span><input type="checkbox" ${
      input
        ? input.isChecked
          ? "checked"
          : ""
        : actualTask.isChecked
        ? "checked"
        : ""
    } onclick="calculateProgress('shopItems')">`;
  }

  if (section === savedList) {
    li.innerHTML = `<span> ${actualTask.date} : ${actualTask.name}</span>`;
    actualTask.date === actDate ? (li.style.color = "#81c792") : "";
    actualTask.date < actDate
      ? (li.style.color = "rgb(126, 133, 139, 0.5)")
      : "";
    deleteButton.style.display = "block";
  } else if (
    section === dateTask ||
    section === shopList ||
    section === generalTask
  ) {
    liToggle(li, deleteButton);
  } else {
    li.innerHTML = `<span>${input}</span>`;
    deleteButton.style.display = "block";
  }

  ul.appendChild(li);
  li.appendChild(deleteButton);

  deleteButton.addEventListener("click", (e) => deleteFunc(e));
  calculateProgress("general-tasks"), calculateProgress("shopItems");
  calculateProgress("today-tasks"), saveAppState();
};

// Listing the tasks bevor saving the date
const renderTasks = () => {
  const input = dateTodo.value;
  if (input) {
    renderList(dateTodo, taskList, null, (e) => {
      e.target.closest("li").remove();
      renderMessage(messageDate, dateTasks);
    });
    messageDate.classList.add("hidden");
  }
};

const renderAllSavedTasks = () => {
  savedTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  // delete last past 4th task
  const pastDates = savedTasks.filter((t) => t.date < actDate);
  if (pastDates.length > 3) {
    savedTasks.splice(0, 1);
    saveAppState();
  }
  savedTasks.forEach((t) => {
    renderList(null, savedList, t, (e) => {
      const deleteTaskText = e.target
        .closest("li")
        .textContent.slice(0, -1)
        .split(" : ")[1];
      const deleteDate = e.target.closest("li").textContent.split(" : ")[0];
      e.target.closest("li").remove();

      // find index of the value to be deleted
      const taskIndex = savedTasks.findIndex(
        (task) => task.name === deleteTaskText
      );
      tasks.forEach((task, i) =>
        task.date === deleteDate.trim() ? tasks.splice(i, 1) : ""
      );

      if (taskIndex !== -1) {
        savedTasks.splice(taskIndex, 1);
      }

      renderMessage(messageSaved, savedTasks);
      saveAppState();
    });
  });
};

// Save Button
const saveDate = () => {
  let aTasks = [];
  const selectedDate = document.getElementById("datePicker").value;
  const dateTasks = document.querySelectorAll("#date-tasks li");
  dateTasks.forEach((l) => {
    aTasks.push({
      name: l.textContent.slice(0, -1),
      isChecked: false,
    });
  });

  if (
    (selectedDate > actDate || selectedDate === actDate) &&
    aTasks.length !== 0
  ) {
    addTask(aTasks, selectedDate); // Save Task and Date in Class

    savedTasks.push({
      name: aTasks.map((t) => t.name).join(" - "),
      date: selectedDate,
    });
    document.getElementById("datePicker").value = ""; // clear Date setting
    messageDate.textContent = "Add Tasks / Notes For Later 📆";
    messageSaved.classList.add("hidden");
    messageDate.classList.remove("hidden"); // Remove old Tasks
    // clear list to prevent double copies

    dateTask.innerHTML = "";

    compareDatesForToday();
    renderAllSavedTasks();
    // Render Todays Tasks if Date is Today
  } else {
    messageDate.classList.remove("hidden");
    messageDate.textContent = "Choose A future Date & Write your Tasks!";
  }
  if (selectedDate === actDate) {
    savedList.innerHTML = "";
    renderAllSavedTasks();
  }
};

// Compare Saved Dates with Todays Date if true: List Tasks on Today-Div
const compareDatesForToday = () => {
  tasks.forEach((task, taskIndex) => {
    if (task.date < actDate) {
      tasks.splice(tasks[taskIndex], 1);
    }
    if (task.date === actDate) {
      todayPreview.style.backgroundColor = "rgb(224, 255, 189, 0.5)";

      // const taskClass = tasks[taskIndex] - the tasks-array is: tasks[tasksIndex].text
      // Render List for each task
      task.text.forEach((taskText) => {
        renderList(null, dateTask, taskText, (e) => {
          deleteTask(
            e,
            tasks[taskIndex].text,
            () => calculateProgress("today-tasks"),
            todayPreview,
            "No tasks left, you did 100% today!"
          );
        });
        todayPreview.innerHTML = task.text[0].name;
        calculateProgress("today-tasks");
        saveAppState();
      });
    } else {
      const now = new Date();
      const msToMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
      setTimeout(compareDatesForToday, msToMidnight);
    }
  });
};

const addGeneralTodo = () => {
  const input = generalTodo.value;
  if (input) {
    messageTodo.classList.add("hidden");
    generalTasks.push({ name: input, isChecked: false });
    renderList(generalTodo, generalTask, null, (e) => {
      deleteTask(e, generalTasks, () => {
        calculateProgress("general-tasks");
        renderMessage(messageTodo, generalTasks);
      });
      renderMessage(messageTodo, generalTasks);
    });
    calculateProgress("general");
  }
};

const addShopItem = () => {
  const input = shopItem.value;
  if (input) {
    shopItems.push({ name: input, isChecked: false });
    messageShop.classList.add("hidden");
    renderList(shopItem, shopList, null, (e) => {
      deleteTask(e, shopItems, () => {
        calculateProgress("shopItems");
        renderMessage(messageShop, shopItems);
      });
      renderMessage(messageShop, shopItems);
    });
  }
};

//////////////////////////////////////////////////////////////Functions for Tasks Sections end ///////

// Save all relevant data to localStorage
const saveAppState = () => {
  localStorage.setItem("generalTasks", JSON.stringify(generalTasks));
  localStorage.setItem("shopItems", JSON.stringify(shopItems));
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
};
const loadAppState = () => {
  generalTasks = JSON.parse(localStorage.getItem("generalTasks")) || [];
  shopItems = JSON.parse(localStorage.getItem("shopItems")) || [];
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks = JSON.parse(localStorage.getItem("savedTasks")) || [];
  generalTask.innerHTML = "";
  shopList.innerHTML = "";
  dateTask.innerHTML = "";
  savedList.innerHTML = "";
  // todays tasks
  compareDatesForToday();
  //savedTasks
  renderAllSavedTasks();
  // general Tasks
  generalTasks.forEach((task) => {
    renderList(null, generalTask, task, (e) => {
      deleteTask(e, generalTasks, () => {
        calculateProgress("general-tasks");
        renderMessage(messageTodo, generalTasks);
      });
    });
  });
  // shopitems
  shopItems.forEach((item) => {
    renderList(null, shopList, item, (e) => {
      deleteTask(e, shopItems);
      renderMessage(messageShop, shopItems);
    });
  });
  renderMessage(messageTodo, generalTasks);
  renderMessage(messageShop, shopItems);
  renderMessage(messageDate, dateTasks);
  renderMessage(messageSaved, savedTasks);

  deleteCheckedTasks(generalTasks);
  deleteCheckedTasks(shopItems);
};

loadAppState();
