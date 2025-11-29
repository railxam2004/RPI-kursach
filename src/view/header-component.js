import { AbstractComponent } from "../framework/view/abstract-component.js";

export default class HeaderComponent extends AbstractComponent {
  get template() {
    return `
      <header class="header">
        <h1>Мои привычки</h1>
        <div class="user-icon">
          <img src="https://placehold.co/40x40/E2E8F0/4A5568?text=U" alt="user icon">
        </div>
      </header>
    `;
  }
}
