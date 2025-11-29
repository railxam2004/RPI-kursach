// Компонента одной привычки (карточка)

import { AbstractComponent } from "../framework/view/abstract-component.js";

export default class HabitComponent extends AbstractComponent {
  #habit;

  constructor(habit) {
    super();
    this.#habit = habit;
  }

  get template() {
    const { id, title, color, completed } = this.#habit;

    return `
      <div class="habit ${completed ? "completed" : ""}" data-id="${id}">
        <div class="habit-info">
          <div class="habit-icon ${color}"></div>
          <span>${title}</span>
        </div>
        <div class="habit-actions">
          <button class="habit-btn edit-btn" title="Редактировать">
            ✏
          </button>
          <button class="habit-btn delete-btn" title="Удалить">
            🗑
          </button>
          <input type="checkbox" ${completed ? "checked" : ""}>
        </div>
      </div>
    `;
  }
}
