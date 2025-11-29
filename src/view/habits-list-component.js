// Компонента списка привычек ("Сегодня")

import { AbstractComponent } from "../framework/view/abstract-component.js";

export default class HabitsListComponent extends AbstractComponent {
  get template() {
    return `
      <section class="habits">
        <h2>Сегодня</h2>
        <div class="habits-container"></div>
      </section>
    `;
  }

  get listContainer() {
    return this.element.querySelector(".habits-container");
  }
}
