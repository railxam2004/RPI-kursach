// Компонента плавающей кнопки "+"

import { AbstractComponent } from "../framework/view/abstract-component.js";

export default class AddButtonComponent extends AbstractComponent {
  get template() {
    return `<button class="add-btn">+</button>`;
  }
}
