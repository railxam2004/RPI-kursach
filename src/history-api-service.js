import ApiService from './framework/view/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class HistoryApiService extends ApiService {
  // Получить всю историю: GET /history
  get history() {
    return this._load({ url: 'history', method: Method.GET })
      .then(ApiService.parseResponse);
  }

  // Создать запись дня: POST /history
  async addRecord(record) {
    const response = await this._load({
      url: 'history',
      method: Method.POST,
      body: JSON.stringify(record),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });

    return ApiService.parseResponse(response);
  }

  // Обновить запись дня: PUT /history/:id
  async updateRecord(record) {
    const response = await this._load({
      url: `history/${record.id}`,
      method: Method.PUT,
      body: JSON.stringify(record),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });

    return ApiService.parseResponse(response);
  }
}
