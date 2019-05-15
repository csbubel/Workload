class ElementBase {
  constructor(type) {
    this.element = document.createElement(type);
    this.children = [];
  }

  addChild (child) {
    this.children.push(child);
    this.element.appendChild(child.element);
  }

  removeChild (child) {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] === child) {
        this.children.splice(i, 1);
      }
    }
  }

  addClass (className) {
    this.element.classList.add(className);
  }

  removeClass (className) {
    this.element.classList.remove(className);
  }

  destroy () {
    for (let child of this.children) {
      child.destroy();
    }

    if (this.removeEventListeners) {
      this.removeEventListeners();
    }
    this.element.remove();
    this.element = null;
  }
}

class Button extends ElementBase {
  constructor(title, eventHandler) {
    super("button");

    this.element.innerText = title;
    this.eventHandler = eventHandler;
    this.element.addEventListener("click", this.eventHandler);
  }

  removeEventListeners () {
    this.element.removeEventListener("click", this.eventHandler);
  }
}

class Task extends ElementBase {
  constructor(task) {
    super("label");
    this.element.innerText = task.title;
  }

  updateTask (text) {
    this.element.innerText = text;
  }
}

class TextInput extends ElementBase {
  constructor(value, eventHandler, placeholder = "") {
    super("input");
    this.element.type = "text";
    this.element.value = value;
    this.eventHandler = eventHandler;
    this.element.placeholder = placeholder;
    this.element.addEventListener("keyup", this.eventHandler);
  }

  removeEventListeners () {
    this.element.removeEventListener("keyup", this.eventHandler);
  }
}

class Checkbox extends ElementBase {
  constructor(eventHandler) {
    super("input");
    this.element.type = "checkbox";
    this.eventHandler = eventHandler;
    this.element.addEventListener("change", this.eventHandler);
  }

  setChecked (checked) {
    this.element.checked = checked;
  }

  removeEventListener () {
    this.element.removeEventListener("change", this.eventHandler);
  }
}

// Contains the TaskContainer and root delete button
class TaskRootContainer extends ElementBase {
  constructor(task) {
    super("div");
    this.task = task;
    this.element.className = "task-root-container";
    this.handleInitiateAdd = this.handleInitiateAdd.bind(this);
    this.handleCancelAdd = this.handleCancelAdd.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCheckToggle = this.handleCheckToggle.bind(this);

    this.checkbox = new Checkbox(this.handleCheckToggle);
    this.addChild(this.checkbox);
    this.addChild(new TaskContainer(task));
    this.addButton = new Button("+", this.handleInitiateAdd);
    this.addChild(this.addButton);
    this.addChild(new Button("−", this.handleDelete));

    this.subTasks = [];
    for (let subTask of task.subTasks) {
      const subTaskContainer = new TaskRootContainer(subTask);
      this.addChild(subTaskContainer);
      this.subTasks.push(subTaskContainer);
    }

    this.toggleComplete(this.task.complete);
  }

  handleCheckToggle (e) {
    const isComplete = e.target.checked;
    taskService.toggleComplete(this.task.id, isComplete);

    this.toggleComplete(isComplete);
  }

  toggleComplete (isComplete) {
    if (isComplete) {
      this.addClass("complete");
    } else {
      this.removeClass("complete");
    }

    this.checkbox.setChecked(isComplete);

    for (let subTaskContainer of this.subTasks) {
      subTaskContainer.toggleComplete(isComplete);
    }
  }

  handleDelete () {
    taskService.deleteTask(this.task.id);
    this.subTasks.length = 0;
    this.destroy();
  }

  handleInitiateAdd () {
    this.addButton.addClass("hidden");

    this.addInput = new TextInput("", this.handleAdd, "New subtask");
    this.addInput.addClass("add-input");
    this.addChild(this.addInput);

    this.cancelAdd = new Button("Cancel", this.handleCancelAdd);
    this.addChild(this.cancelAdd);
  }

  handleAdd (e) {
    if (e.keyCode !== 13) {
      return;
    }

    const title = e.target.value;
    const subTask = taskService.addSubTask(this.task.id, title);

    if (subTask) {
      const subTaskContainer = new TaskRootContainer(subTask);
      this.addChild(subTaskContainer);
      this.subTasks.push(subTaskContainer);

    } else {
      alert("Something went wrong!");
    }

    this.destroyAddComponents();
    this.addButton.removeClass("hidden");
  }

  handleCancelAdd () {
    this.destroyAddComponents();
    this.addButton.removeClass("hidden");
  }

  destroyAddComponents () {
    this.removeChild(this.addInput);
    this.addInput.destroy();
    this.addInput = null;

    this.removeChild(this.cancelAdd);
    this.cancelAdd.destroy();
    this.cancelAdd = null;
  }
}

// Contains the task element and edit components
class TaskContainer extends ElementBase {
  constructor(task) {
    super("div");
    this.addClass("task-container");
    this.task = task;
    this.taskElement = new Task(task);

    this.handleInitiateEdit = this.handleInitiateEdit.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);

    this.addChild(this.taskElement);
    this.handleEdit = this.handleEdit.bind(this);

    this.editButton = new Button("Edit", this.handleInitiateEdit);
    this.addChild(this.editButton);
  }

  handleInitiateEdit () {
    this.taskElement.updateTask("");
    this.editButton.addClass("hidden");

    this.editInput = new TextInput(this.task.title, this.handleEdit);
    this.addChild(this.editInput);

    this.cancelEdit = new Button("Cancel", this.handleCancelEdit);
    this.addChild(this.cancelEdit);
  }

  handleCancelEdit () {
    this.taskElement.updateTask(this.task.title);
    this.destroyEditComponents();
    this.editButton.removeClass("hidden");
  }

  handleEdit (e) {
    if (e.keyCode !== 13) {
      return;
    }

    this.task.title = e.target.value;
    this.taskElement.updateTask(this.task.title);
    this.destroyEditComponents();
    this.editButton.removeClass("hidden");
  }

  destroyEditComponents () {
    this.removeChild(this.editInput);
    this.editInput.destroy();
    this.editInput = null;

    this.removeChild(this.cancelEdit);
    this.cancelEdit.destroy();
    this.cancelEdit = null;
  }
}

class TaskService {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("workload-tasks")) || [];
  }

  deleteTask (id) {
    const fn = function (tasks, id) {
      let foundTask = null;

      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
          foundTask = tasks.splice(i, 1);
          break;
        }

        if (tasks[i].subTasks.length > 0) {
          foundTask = fn(tasks[i].subTasks, id);

          if (foundTask) {
            break;
          }
        }
      }

      return foundTask;
    };

    fn(this.tasks, id);
    this.persistTasks();
  }

  persistTasks () {
    localStorage.setItem("workload-tasks", JSON.stringify(this.tasks));
  }

  incrementId () {
    let id = (parseInt(localStorage.getItem("workload-task-id")) || -1) + 1;
    localStorage.setItem("workload-task-id", id);
    return id;
  }

  createTask (title) {
    return {
      id: this.incrementId(),
      title: title,
      complete: false,
      subTasks: []
    }
  }

  addTask (title) {
    const task = this.createTask(title);
    this.tasks.push(task);
    this.persistTasks();

    return task;
  }

  toggleComplete (id, isComplete) {
    const fn = function (tasks, id) {
      let foundTask = null;

      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
          foundTask = tasks[i]
          break;
        }

        if (tasks[i].subTasks.length > 0) {
          foundTask = fn(tasks[i].subTasks, id);

          if (foundTask) {
            break;
          }
        }
      }

      return foundTask;
    };

    const task = fn(this.tasks, id);

    if (task) {
      TaskService.toggleAllComplete(task, isComplete);
      this.persistTasks();
    }
  }

  static toggleAllComplete (task, isComplete) {
    task.complete = isComplete;
    for (let subTask of task.subTasks) {
      TaskService.toggleAllComplete(subTask, isComplete);
    }
  }

  addSubTask (parentId, title) {
    const task = this.createTask(title);
    const fn = function (tasks, id) {
      let foundTask = null;

      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
          foundTask = tasks[i]
          break;
        }

        if (tasks[i].subTasks.length > 0) {
          foundTask = fn(tasks[i].subTasks, id);

          if (foundTask) {
            break;
          }
        }
      }

      return foundTask;
    };

    const parentTask = fn(this.tasks, parentId);

    if (parentTask) {
      parentTask.subTasks.push(task);
      this.persistTasks();

      return task;
    }

    return null;
  }
}

function handleTaskAdd (e) {
  if (e.keyCode !== 13) {
    return;
  }

  const task = taskService.addTask(e.target.value);
  const taskRoot = new TaskRootContainer(task);
  tasksContainer.appendChild(taskRoot.element);

  e.target.value = "";
}

const taskService = new TaskService();
const tasksContainer = document.getElementById("tasks-container");
document.getElementById("task-input").addEventListener("keyup", handleTaskAdd);

for (let task of taskService.tasks) {
  const taskRoot = new TaskRootContainer(task);
  tasksContainer.appendChild(taskRoot.element);
}