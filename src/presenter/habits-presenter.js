import { render } from "../framework/render.js";
import { UpdateType } from "../const.js";

import HabitsListComponent from "../view/habits-list-component.js";
import HabitComponent from "../view/habit-component.js";
import ProgressComponent from "../view/progress-component.js";
import NewHabitFormComponent from "../view/new-habit-form-component.js";
import AddButtonComponent from "../view/add-button-component.js";

export default class HabitsPresenter {
  #container;
  #model;         // HabitsModel
  #historyModel;  // HistoryModel

  #listComponent = null;
  #progressComponent = null;
  #formComponent = null;
  #addButtonComponent = null;

  #colorClasses = ["blue", "green", "purple"];
  #colorIndex = 0;

  constructor(container, habitsModel, historyModel) {
    this.#container = container;
    this.#model = habitsModel;
    this.#historyModel = historyModel;
  }

  async init() {
    // 1. Рендерим основные компоненты
    this.#listComponent = new HabitsListComponent();
    this.#progressComponent = new ProgressComponent();
    this.#formComponent = new NewHabitFormComponent();
    this.#addButtonComponent = new AddButtonComponent();

    render(this.#listComponent, this.#container);
    render(this.#progressComponent, this.#container);
    render(this.#formComponent, this.#container);
    render(this.#addButtonComponent, this.#container);

    // Заглушка, пока грузятся данные
    this.#listComponent.listContainer.textContent = "Загрузка...";

    // 2. Подписываемся на модель привычек
    this.#model.addObserver(this.#handleModelEvent);

    // 3. Параллельно загружаем:
    //  - историю дней
    //  - привычки
await this.#historyModel.init();
await this.#model.init();
    // После init() модель привычек сама дернет _notify(UpdateType.INIT)
  }

  // ---------------------------------------------------
  // Обработка событий модели привычек
  // ---------------------------------------------------

  #handleModelEvent = (updateType, payload) => {
    switch (updateType) {
      case UpdateType.INIT:
        this.#renderAllHabits();
        this.#attachFormHandlers();
        this.#attachFloatingButtonHandler();
        this.#recalcAll();
        break;

      case UpdateType.MINOR:
      case UpdateType.MAJOR:
      case UpdateType.PATCH:
        this.#renderAllHabits();
        this.#recalcAll();
        break;

      default:
        break;
    }
  };

  // ---------------------------------------------------
  // Рендер списка привычек
  // ---------------------------------------------------

  #renderAllHabits() {
    const listContainer = this.#listComponent.listContainer;
    listContainer.innerHTML = "";

    this.#model.items.forEach((habit) => {
      const habitView = new HabitComponent(habit);
      render(habitView, listContainer);
      this.#attachHabitHandlers(habitView.element, habit.id);
    });
  }

  #attachHabitHandlers(habitElement, habitId) {
    const checkbox = habitElement.querySelector("input[type='checkbox']");
    const deleteBtn = habitElement.querySelector(".delete-btn");
    const editBtn = habitElement.querySelector(".edit-btn");

    if (checkbox) {
      checkbox.addEventListener("change", async () => {
        try {
          await this.#model.toggleHabit(habitId);
          // UI обновится через _notify -> #handleModelEvent
        } catch (err) {
          console.error("Ошибка при переключении привычки:", err);
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        try {
          await this.#model.deleteHabit(habitId);
        } catch (err) {
          console.error("Ошибка при удалении привычки:", err);
        }
      });
    }

    if (editBtn) {
      editBtn.addEventListener("click", async () => {
        const habit = this.#model.items.find((h) => h.id === habitId);
        if (!habit) return;

        const currentTitle = habit.title;
        const newTitle = prompt("Новое название привычки:", currentTitle);

        if (newTitle !== null) {
          const trimmed = newTitle.trim();
          if (trimmed) {
            try {
              await this.#model.editHabit(habitId, trimmed);
            } catch (err) {
              console.error("Ошибка при редактировании привычки:", err);
            }
          }
        }
      });
    }
  }

  // ---------------------------------------------------
  // Форма добавления привычки
  // ---------------------------------------------------

  #attachFormHandlers() {
    const formElement = this.#formComponent.element;
    const input = formElement.querySelector("#habit-name");
    const addButton = formElement.querySelector("button");

    const handleAddHabit = async () => {
      const name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }

      const color = this.#getNextColorClass();

      try {
        await this.#model.addHabit(name, color);
        input.value = "";
      } catch (err) {
        console.error("Ошибка при добавлении привычки:", err);
      }
    };

    addButton.addEventListener("click", handleAddHabit);

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddHabit();
      }
    });
  }

  #attachFloatingButtonHandler() {
    const input = this.#formComponent.element.querySelector("#habit-name");
    this.#addButtonComponent.element.addEventListener("click", () => {
      input.focus();
    });
  }

  // ---------------------------------------------------
  // Пересчёт: заголовок + история + график
  // ---------------------------------------------------

  #recalcAll() {
    this.#updateHistoryForToday();
    this.#updateTodayTitle();
    this.#renderGraph();
  }

  #updateTodayTitle() {
    const titleElement = this.#listComponent.element.querySelector("h2");
    const total = this.#model.items.length;
    titleElement.textContent = `Сегодня (${total})`;
  }

  // ---------------------- История 7 дней ----------------------

  #updateHistoryForToday() {
    const todayKey = this.#getTodayKey();
    const total = this.#model.items.length;
    const completed = this.#model.items.filter((habit) => habit.completed).length;

    // Обновляем модель истории (она сама синхронизируется с сервером)
    this.#historyModel.setDay(todayKey, total, completed);
  }

#getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // месяцы с 0
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // локальная дата YYYY-MM-DD
}


  #formatDayLabel(dateString) {
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const names = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return names[dayIndex] ?? "";
  }

  // ---------------------- График ----------------------

  #renderGraph() {
    const graphElement = this.#progressComponent.element.querySelector(".graph");
    graphElement.innerHTML = "";

    const days = this.#historyModel.getLast7Days();
    if (days.length === 0) {
      return;
    }

    const lastIndex = days.length - 1;

    days.forEach((day, index) => {
      const percent =
        day.total === 0 ? 0 : (day.completed / day.total) * 100;

      const bar = document.createElement("div");
      bar.classList.add("bar");
      if (index === lastIndex) {
        bar.classList.add("active");
      }
      bar.style.height = `${percent}%`;

      const label = document.createElement("span");
      label.textContent = this.#formatDayLabel(day.date);
      bar.appendChild(label);

      // Для текущего дня рисуем сегменты по выполненным привычкам
if (index === lastIndex) {
  // Текущий день: сегменты по цветам выполненных привычек
  const completedHabits = this.#model.items.filter(
    (habit) => habit.completed
  );

  completedHabits.forEach((habit) => {
    const segment = document.createElement("div");
    segment.classList.add("bar-segment");
    segment.style.backgroundColor = this.#colorToCSS(habit.color);
    bar.insertBefore(segment, label);
  });
} else {
  // Прошлые дни: один нейтральный сегмент, если прогресс > 0
  if (percent > 0) {
    const segment = document.createElement("div");
    segment.classList.add("bar-segment");
    // любой спокойный цвет
    segment.style.backgroundColor = "#dbeafe";
    bar.insertBefore(segment, label);
  }
}


      graphElement.appendChild(bar);
    });
  }

  #colorToCSS(colorClass) {
    const map = {
      blue: "#dbeafe",
      green: "#d1fae5",
      purple: "#e9d5ff",
    };
    return map[colorClass] || "#e5e7eb";
  }

  // ---------------------- Цвета ----------------------

  #getNextColorClass() {
    const cls = this.#colorClasses[this.#colorIndex];
    this.#colorIndex = (this.#colorIndex + 1) % this.#colorClasses.length;
    return cls;
  }
}
