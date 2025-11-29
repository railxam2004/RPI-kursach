// Компонента графика прогресса

import { AbstractComponent } from "../framework/view/abstract-component.js";

export default class ProgressComponent extends AbstractComponent {
  get template() {
    return `
      <section class="progress">
        <h2>Прогресс за неделю</h2>
        <div class="graph">
          <div class="bar"><span>Пн</span></div>
          <div class="bar"><span>Вт</span></div>
          <div class="bar"><span>Ср</span></div>
          <div class="bar"><span>Чт</span></div>
          <div class="bar"><span>Пт</span></div>
          <div class="bar active" style="height: 0%">
            <span>Сб</span>
          </div>
          <div class="bar"><span>Вс</span></div>
        </div>
      </section>
    `;
  }
}
