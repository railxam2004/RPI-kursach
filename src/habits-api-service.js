// src/habits-api-service.js

import ApiService from './framework/view/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class HabitsApiService extends ApiService {
  // GET https://.../habits
  get habits() {
    return this._load({ url: 'habits', method: Method.GET })
      .then(ApiService.parseResponse);
  }

  // POST https://.../habits
  async addHabit(habit) {
    const response = await this._load({
      url: 'habits',
      method: Method.POST,
      body: JSON.stringify(habit),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });

    return ApiService.parseResponse(response);
  }

  // PUT https://.../habits/:id
  async updateHabit(habit) {
    const response = await this._load({
      url: `habits/${habit.id}`,
      method: Method.PUT,
      body: JSON.stringify(habit),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });

    return ApiService.parseResponse(response);
  }

  // DELETE https://.../habits/:id
  async deleteHabit(habitId) {
    await this._load({
      url: `habits/${habitId}`,
      method: Method.DELETE,
    });
  }
}
