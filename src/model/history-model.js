// Модель для истории по дням: данные хранятся на MockAPI (/history)

export default class HistoryModel {
  #historyApiService = null;
  #history = [];

  constructor({ historyApiService }) {
    this.#historyApiService = historyApiService;
  }

  // Все записи истории (как есть)
  get items() {
    return this.#history;
  }

  // Последние 7 дней, отсортированные по дате
  getLast7Days() {
    const sorted = [...this.#history].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-7);
  }

  // Инициализация: получить историю с сервера
  async init() {
    try {
      const records = await this.#historyApiService.history;
      this.#history = Array.isArray(records) ? records : [];
    } catch (err) {
      console.error('Не удалось загрузить историю с сервера:', err);
      this.#history = [];
    }
  }

  // Обновляет или создаёт запись за конкретный день
  // date: 'YYYY-MM-DD', total: number, completed: number
  setDay(date, total, completed) {
    let record = this.#history.find((item) => item.date === date);

    if (!record) {
      // Локально создаём новую запись
      const newRecord = { date, total, completed };
      this.#history.push(newRecord);

      // Параллельно отправляем на сервер
      this.#historyApiService.addRecord(newRecord)
        .then((created) => {
          Object.assign(newRecord, created); // прилетит id
        })
        .catch((err) => {
          console.error('Ошибка при создании записи истории на сервере:', err);
        });

      return;
    }

    // Обновляем существующую запись локально
    const prev = { total: record.total, completed: record.completed };
    record.total = total;
    record.completed = completed;

    // Если id ещё нет (на всякий случай)
    if (!record.id) {
      this.#historyApiService.addRecord({
        date: record.date,
        total: record.total,
        completed: record.completed,
      })
        .then((created) => {
          Object.assign(record, created);
        })
        .catch((err) => {
          console.error('Ошибка при создании записи истории на сервере:', err);
          record.total = prev.total;
          record.completed = prev.completed;
        });

      return;
    }

    // Если id есть — обновляем на сервере
    this.#historyApiService.updateRecord(record)
      .then((updated) => {
        Object.assign(record, updated);
      })
      .catch((err) => {
        console.error('Ошибка при обновлении записи истории на сервере:', err);
        record.total = prev.total;
        record.completed = prev.completed;
      });
  }
}
