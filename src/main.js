import { render } from "./framework/render.js";

import HeaderComponent from "./view/header-component.js";
import HabitsModel from "./model/habits-model.js";
import HabitsPresenter from "./presenter/habits-presenter.js";
import HabitsApiService from "./habits-api-service.js";
import HistoryApiService from "./history-api-service.js";
import HistoryModel from "./model/history-model.js";

const END_POINT = "https://692b54917615a15ff24f5125.mockapi.io";

const container = document.querySelector(".container");

// Шапка
render(new HeaderComponent(), container);

// Модель истории
const historyModel = new HistoryModel({
  historyApiService: new HistoryApiService(END_POINT),
});

// Модель привычек
const habitsModel = new HabitsModel({
  habitsApiService: new HabitsApiService(END_POINT),
});

// Презентер теперь получает и привычки, и историю
const habitsPresenter = new HabitsPresenter(container, habitsModel, historyModel);
habitsPresenter.init();
