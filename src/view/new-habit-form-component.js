// Компонента формы добавления привычки

import { AbstractComponent } from "../framework/view/abstract-component.js";

export default class NewHabitFormComponent extends AbstractComponent {
  get template() {
    return `
      <section class="new-habit">
        <h2>Добавить привычку</h2>
        <form>
          <label for="habit-name">Название</label>
          <input
            type="text"
            id="habit-name"
            placeholder="Например, Медитировать 10 минут"
          >
          <button type="button">Добавить</button>
        </form>
      </section>
    `;
  }
}
