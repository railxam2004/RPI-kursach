// src/model/habits-model.js

import Observable from '../framework/observable.js';
import { UpdateType, UserAction } from '../const.js';

export default class HabitsModel extends Observable {
  #habitsApiService = null;
  #habits = [];

  constructor({ habitsApiService }) {
    super();
    this.#habitsApiService = habitsApiService;
  }

  get items() {
    return this.#habits;
  }

  // Инициализация: загрузка с mockapi
  async init() {
    try {
      const habits = await this.#habitsApiService.habits;
      this.#habits = habits;
    } catch (err) {
      console.error('Не удалось загрузить привычки с сервера:', err);
      this.#habits = [];
    }

    // данные готовы
    this._notify(UpdateType.INIT, null);
  }

  // ---------------------- ADD (POST) ----------------------

  async addHabit(title, color) {
    const newHabit = {
      title,
      color,
      completed: false,
    };

    try {
      const createdHabit = await this.#habitsApiService.addHabit(newHabit);
      this.#habits.push(createdHabit);

      this._notify(UpdateType.MINOR, {
        action: UserAction.ADD_HABIT,
        habit: createdHabit,
      });

      return createdHabit;
    } catch (err) {
      console.error('Ошибка при добавлении привычки на сервер:', err);
      throw err;
    }
  }

  // ---------------------- TOGGLE (PUT) ----------------------

  async toggleHabit(id) {
    const habit = this.#habits.find((h) => h.id === id);
    if (!habit) {
      return;
    }

    const previousCompleted = habit.completed;
    habit.completed = !habit.completed;

    try {
      const updatedHabit = await this.#habitsApiService.updateHabit(habit);
      Object.assign(habit, updatedHabit);

      this._notify(UpdateType.PATCH, {
        action: UserAction.UPDATE_HABIT,
        habit,
      });
    } catch (err) {
      console.error('Ошибка при обновлении привычки на сервере:', err);
      // откат
      habit.completed = previousCompleted;
      throw err;
    }
  }

  // ---------------------- EDIT TITLE (PUT) ----------------------

  async editHabit(id, newTitle) {
    const habit = this.#habits.find((h) => h.id === id);
    if (!habit) {
      return;
    }

    const previousTitle = habit.title;
    habit.title = newTitle;

    try {
      const updatedHabit = await this.#habitsApiService.updateHabit(habit);
      Object.assign(habit, updatedHabit);

      this._notify(UpdateType.PATCH, {
        action: UserAction.UPDATE_HABIT,
        habit,
      });
    } catch (err) {
      console.error('Ошибка при обновлении названия привычки на сервере:', err);
      habit.title = previousTitle;
      throw err;
    }
  }

  // ---------------------- DELETE (DELETE) ----------------------

  async deleteHabit(id) {
    const index = this.#habits.findIndex((h) => h.id === id);
    if (index === -1) {
      return;
    }

    const backup = this.#habits[index];

    // оптимистичное удаление
    this.#habits.splice(index, 1);

    try {
      await this.#habitsApiService.deleteHabit(id);

      this._notify(UpdateType.MINOR, {
        action: UserAction.DELETE_HABIT,
        id,
      });
    } catch (err) {
      console.error('Ошибка при удалении привычки на сервере:', err);
      // откат
      this.#habits.splice(index, 0, backup);
      throw err;
    }
  }
}
