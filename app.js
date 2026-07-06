const STORAGE_KEY = "yasasi_sugi_kakeibo_v1";
const MONTH_KEY_PREFIX = "month:";
const DEFAULT_CATEGORY_COLORS = ["#f7ca54", "#ffb36a", "#f59aa0", "#9dd9f3", "#b8e28f", "#d1b4ff"];
const RECENT_MESSAGES = [
  "邵ｺ繧・ｽ顔ｸｺ蠕娯・邵ｺ繝ｻ鬟ｭ",
  "闔蛾大ｾ狗ｹｧ繧・斡郢ｧ蟲ｨ・槭・繝ｻ,
  "邵ｺ蜷ｶ・・ｸｺ荳奇ｽ・ｸｺ霈費ｼ邵ｺ繝ｻ・ｨ蛟ｬ鮖ｸ邵ｺ・ｰ邵ｺ・ｭ邵ｲ繝ｻ,
  "邵ｺ・｡郢ｧ繝ｻ・鍋ｸｺ・ｨ驍ｯ螢ｹ・郢ｧ蟲ｨ・檎ｸｺ・ｦ邵ｺ・ｦ邵ｺ蛹ｻ・臥ｸｺ繝ｻ・育ｸｲ繝ｻ,
  "邵ｺ蛹ｻ・臥ｸｺ繝ｻ竏ｴ郢ｧ蟲ｨ・樒ｸｲ竏夲ｼ樒ｸｺ繝ｻ笏邵ｺ蛛・ｽｼ繝ｻ
];

const DOM = {
  views: Array.from(document.querySelectorAll(".view")),
  authScreen: document.querySelector(".auth-screen"),
  setupScreen: document.querySelector("#setupScreen"),
  appShell: document.querySelector("#appShell"),
  bottomNav: document.querySelector("#bottomNav"),
  copyMonthDialog: document.querySelector("#copyMonthDialog"),
  remainingToday: document.querySelector("#remainingToday"),
  authTabs: Array.from(document.querySelectorAll("[data-auth-tab]")),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  loginId: document.querySelector("#loginId"),
  loginPassword: document.querySelector("#loginPassword"),
  registerName: document.querySelector("#registerName"),
  registerId: document.querySelector("#registerId"),
  registerPassword: document.querySelector("#registerPassword"),
  authMascot: document.querySelector("#authMascot"),
  setupMascot: document.querySelector("#setupMascot"),
  setupChat: document.querySelector("#setupChat"),
  setupForm: document.querySelector("#setupForm"),
  setupInput: document.querySelector("#setupInput"),
  setupActions: document.querySelector("#setupActions"),
  homeMascot: document.querySelector("#homeMascot"),
  chatMascot: document.querySelector("#chatMascot"),
  speechBubble: document.querySelector("#speechBubble"),
  chatLog: document.querySelector("#chatLog"),
  chatComposer: document.querySelector("#chatComposer"),
  chatInput: document.querySelector("#chatInput"),
  chatActions: document.querySelector("#chatActions"),
  resetRecord: document.querySelector("#resetRecord"),
  settingsView: document.querySelector("#settingsView"),
  homeButtons: Array.from(document.querySelectorAll("[data-home-action]")),
  routeButtons: Array.from(document.querySelectorAll("[data-go]")),
  bottomButtons: Array.from(document.querySelectorAll(".bottom-nav__item")),
  categorySummaryList: document.querySelector("#categorySummaryList"),
  bottleGrid: document.querySelector("#bottleGrid"),
  recordHistoryList: document.querySelector("#recordHistoryList"),
  calendarMonthLabel: document.querySelector("#calendarMonthLabel"),
  calendarGrid: document.querySelector("#calendarGrid"),
  calendarDetail: document.querySelector("#calendarDetail"),
  calendarViewButtons: Array.from(document.querySelectorAll("[data-calendar-view]")),
  calendarNavButtons: Array.from(document.querySelectorAll("[data-calendar-nav]")),
  weekNumbers: Array.from(document.querySelectorAll("[data-week-index]")),
  rangeMode: document.querySelector("#rangeMode"),
  budgetForm: document.querySelector("#budgetForm"),
  monthlyBudget: document.querySelector("#monthlyBudget"),
  saveReceipts: document.querySelector("#saveReceipts"),
  notifications: document.querySelector("#notifications"),
  categoryEditor: document.querySelector("#categoryEditor"),
  categoryCreateForm: document.querySelector("#categoryCreateForm"),
  categoryName: document.querySelector("#categoryName"),
  categoryColor: document.querySelector("#categoryColor"),
  setupActionsHint: document.querySelector("#setupActions")
};

const state = loadState();

const ui = {
  currentView: "auth",
  authTab: "login",
  currentMonthKey: getMonthKey(new Date()),
  recordFlow: null,
  setupFlow: null,
  setupProgress: null,
  recordDraft: null,
  calendarMode: "day",
  calendarMonth: new Date(),
  selectedDate: toDateKey(new Date()),
  selectedRangeStart: null,
  selectedRangeEnd: null,
  draggingRange: false,
  shouldPromptMonthCopy: false,
  recordCompletion: null
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      version: 1,
      auth: { isAuthed: false, user: null },
      profile: null,
      settings: {
        receiptImageSaving: false,
        notificationsEnabled: false
      },
      monthConfigs: {},
      records: [],
      lastStreakDate: null,
      setupProgress: null
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      version: 1,
      auth: parsed.auth ?? { isAuthed: false, user: null },
      profile: parsed.profile ?? null,
      settings: {
        receiptImageSaving: Boolean(parsed.settings?.receiptImageSaving),
        notificationsEnabled: Boolean(parsed.settings?.notificationsEnabled)
      },
      monthConfigs: parsed.monthConfigs ?? {},
      records: Array.isArray(parsed.records) ? parsed.records : [],
      lastStreakDate: parsed.lastStreakDate ?? null,
      setupProgress: parsed.setupProgress ?? null
    };
  } catch {
    return {
      version: 1,
      auth: { isAuthed: false, user: null },
      profile: null,
      settings: {
        receiptImageSaving: false,
        notificationsEnabled: false
      },
      monthConfigs: {},
      records: [],
      lastStreakDate: null,
      setupProgress: null
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${MONTH_KEY_PREFIX}${year}-${month}`;
}

function parseMonthKey(monthKey) {
  const value = monthKey.replace(MONTH_KEY_PREFIX, "");
  const [year, month] = value.split("-");
  return { year: Number(year), month: Number(month) };
}

function getMonthDates(date) {
  const base = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(base);
  start.setDate(start.getDate() - start.getDay());
  const dates = [];
  for (let index = 0; index < 42; index += 1) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + index);
    dates.push(cell);
  }
  return dates;
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("ja-JP")}陷繝ｻ;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function copyMonthConfig(source) {
  return JSON.parse(JSON.stringify(source));
}

function cloneSetupFlow(flow) {
  return flow ? JSON.parse(JSON.stringify(flow)) : null;
}

function persistSetupProgress() {
  state.setupProgress = ui.setupFlow ? cloneSetupFlow(ui.setupFlow) : null;
  saveState();
}

function clearSetupProgress() {
  state.setupProgress = null;
  saveState();
}

function ensureMonthConfig(monthKey) {
  if (state.setupProgress && !state.setupProgress.completed) {
    ui.setupFlow = cloneSetupFlow(state.setupProgress);
    showSetupScreen();
    return null;
  }

  if (state.monthConfigs[monthKey]) {
    return state.monthConfigs[monthKey];
  }

  const previousKey = getPreviousMonthKey(monthKey);
  const previousConfig = previousKey ? state.monthConfigs[previousKey] : null;

  if (previousConfig) {
    ui.shouldPromptMonthCopy = true;
    return null;
  }

  ui.setupFlow = createSetupFlow(monthKey, null);
  persistSetupProgress();
  showSetupScreen();
  return null;
}

function getPreviousMonthKey(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const base = new Date(year, month - 2, 1);
  if (Number.isNaN(base.getTime())) {
    return null;
  }
  return getMonthKey(base);
}

function ensureCurrentMonthConfig() {
  ui.currentMonthKey = getMonthKey(new Date());
  const config = ensureMonthConfig(ui.currentMonthKey);
  if (config) {
    ui.shouldPromptMonthCopy = false;
    return config;
  }
  return null;
}

function getMonthConfig(monthKey) {
  return state.monthConfigs[monthKey] ?? null;
}

function createDefaultCategories() {
  return [
    { id: uid(), name: "鬯滓ｺｯ・ｲ・ｻ", budget: 30000, color: DEFAULT_CATEGORY_COLORS[0] },
    { id: uid(), name: "騾墓ｻ難ｽｴ・ｻ髮具ｽｻ", budget: 20000, color: DEFAULT_CATEGORY_COLORS[1] },
    { id: uid(), name: "陞ｽ・ｯ隶鯉ｽｽ", budget: 10000, color: DEFAULT_CATEGORY_COLORS[2] },
    { id: uid(), name: "闔・､鬨ｾ繝ｻ, budget: 12000, color: DEFAULT_CATEGORY_COLORS[3] }
  ];
}

function createSetupFlow(monthKey, fromConfig) {
  const categories = fromConfig?.categories
    ? copyMonthConfig(fromConfig.categories)
    : createDefaultCategories();
  return {
    monthKey,
    categories: categories.map((item) => ({ ...item })),
    index: 0,
    mode: "budget",
    pendingCategoryName: "",
    completed: false
  };
}

function createEmptyMonthConfig() {
  return {
    monthlyBudget: 0,
    categories: []
  };
}

function uid() {
  return `id-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function setView(viewName) {
  ui.currentView = viewName;
  DOM.views.forEach((view) => {
    const active = view.dataset.view === viewName;
    view.hidden = !active;
    view.classList.toggle("is-active", active);
  });

  DOM.bottomNav.hidden = viewName === "auth" || viewName === "setup" || viewName === "record";
  DOM.appShell.hidden = viewName === "auth" || viewName === "setup";
  DOM.authScreen.hidden = viewName !== "auth";
  DOM.setupScreen.hidden = viewName !== "setup";
}

function setAuthTab(tab) {
  ui.authTab = tab;
  DOM.authTabs.forEach((button) => {
    const active = button.dataset.authTab === tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  DOM.loginForm.hidden = tab !== "login";
  DOM.registerForm.hidden = tab !== "register";
  DOM.loginForm.classList.toggle("is-active", tab === "login");
  DOM.registerForm.classList.toggle("is-active", tab === "register");
}

function setMascotMood(targets, mood) {
  const src = mood === "happy" ? "assets/mascot/mikeneko-happy.png" : "assets/mascot/mikeneko-normal.png";
  for (const target of targets) {
    if (target) {
      target.src = src;
      target.dataset.mood = mood;
    }
  }
}

function celebrateMascot(targets) {
  for (const target of targets) {
    if (!target) {
      continue;
    }
    target.classList.remove("is-celebrating");
    void target.offsetWidth;
    target.classList.add("is-celebrating");
    window.setTimeout(() => target.classList.remove("is-celebrating"), 800);
  }
}

function setSpeech(text) {
  DOM.speechBubble.textContent = text;
}

function renderArcText(element) {
  if (!element) {
    return;
  }

  const text = element.textContent.trim();
  element.textContent = "";
  const count = text.length;
  const radius = element.classList.contains("hero-arc__line--large") ? 160 : 132;

  text.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.position = "absolute";
    span.style.left = "50%";
    span.style.top = "50%";
    span.style.transformOrigin = `0 ${radius}px`;
    const angle = (-96 + (192 * index) / Math.max(1, count - 1));
    span.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`;
    element.appendChild(span);
  });
}

function formatDateLabel(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getCurrentMonthConfig() {
  const monthKey = ui.currentMonthKey;
  return state.monthConfigs[monthKey] ?? null;
}

function getCurrentCategories() {
  return getCurrentMonthConfig()?.categories ?? [];
}

function getCategoryById(id) {
  return getCurrentCategories().find((item) => item.id === id) ?? null;
}

function getMonthBudgetTotal(monthKey = ui.currentMonthKey) {
  const config = getMonthConfig(monthKey);
  if (!config) {
    return 0;
  }
  return config.categories.reduce((sum, category) => sum + Number(category.budget || 0), 0);
}

function getRecordsForMonth(monthKey = ui.currentMonthKey) {
  return state.records.filter((record) => getMonthKey(record.date) === monthKey);
}

function getRecordsForDate(dateKey) {
  return state.records.filter((record) => record.date === dateKey);
}

function getSpentForMonth(monthKey = ui.currentMonthKey) {
  return getRecordsForMonth(monthKey).reduce((sum, record) => sum + Number(record.amount || 0), 0);
}

function getSpentForToday(date = new Date()) {
  const dateKey = toDateKey(date);
  return getRecordsForDate(dateKey).reduce((sum, record) => sum + Number(record.amount || 0), 0);
}

function getRemainingTodayAmount() {
  const monthBudget = getMonthBudgetTotal();
  const spentMonth = getSpentForMonth();
  const remainingMonth = Math.max(0, monthBudget - spentMonth);
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const remainingDays = Math.max(1, Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24)));
  const dailyShare = Math.floor(remainingMonth / remainingDays);
  return Math.max(0, dailyShare);
}

function getCategoryRemaining(category) {
  const spent = state.records
    .filter((record) => record.categoryId === category.id && getMonthKey(record.date) === ui.currentMonthKey)
    .reduce((sum, record) => sum + Number(record.amount || 0), 0);
  return Math.max(0, Number(category.budget || 0) - spent);
}

function getCategoryProgress(category) {
  const budget = Math.max(1, Number(category.budget || 0));
  const remaining = getCategoryRemaining(category);
  return clamp((budget - remaining) / budget, 0, 1);
}

function isFirstRun() {
  return !state.auth?.isAuthed;
}

function renderRemainingToday() {
  DOM.remainingToday.textContent = `闔蛾大ｾ狗ｸｺ繧・・ ${formatMoney(getRemainingTodayAmount())}`;
}

function boot() {
  renderArcText(document.querySelector(".hero-arc__line--small"));
  renderArcText(document.querySelector(".hero-arc__line--large"));
  setAuthTab("login");
  setView(isFirstRun() ? "auth" : "home");
  if (!isFirstRun()) {
    beginMonthIfNeeded();
  }
  bindEvents();
  checkMonthRollover();
  renderAll();
  window.setInterval(checkMonthRollover, 60000);
}

function bindEvents() {
  DOM.authTabs.forEach((button) => {
    button.addEventListener("click", () => setAuthTab(button.dataset.authTab));
  });

  DOM.loginForm.addEventListener("submit", handleLogin);
  DOM.registerForm.addEventListener("submit", handleRegister);
  DOM.setupForm.addEventListener("submit", handleSetupSubmit);
  DOM.setupActions.addEventListener("click", handleSetupActions);
  DOM.chatComposer.addEventListener("submit", handleChatSubmit);
  DOM.chatActions.addEventListener("click", handleChatActions);
  DOM.resetRecord.addEventListener("click", resetRecordFlow);
  DOM.homeButtons.forEach((button) => button.addEventListener("click", handleHomeAction));
  DOM.routeButtons.forEach((button) => button.addEventListener("click", () => navigate(button.dataset.go)));
  DOM.bottomButtons.forEach((button) => button.addEventListener("click", () => navigate(button.dataset.go)));
  DOM.calendarViewButtons.forEach((button) => button.addEventListener("click", () => setCalendarMode(button.dataset.calendarView)));
  DOM.calendarNavButtons.forEach((button) => button.addEventListener("click", () => moveCalendarMonth(button.dataset.calendarNav)));
  DOM.weekNumbers.forEach((button) => button.addEventListener("click", () => selectCalendarWeek(Number(button.dataset.weekIndex))));
  DOM.rangeMode.addEventListener("change", () => {
    ui.selectedRangeStart = null;
    ui.selectedRangeEnd = null;
    renderCalendar();
  });
  DOM.budgetForm.addEventListener("submit", handleBudgetSave);
  DOM.categoryCreateForm.addEventListener("submit", handleCategoryCreate);
  DOM.copyMonthDialog.addEventListener("close", handleCopyMonthDialogClose);
}

function navigate(target) {
  if (target === "confirm") {
    navigate("data");
    return;
  }

  if (target === "record") {
    startRecordFlow();
    return;
  }

  if (target === "home") {
    setView("home");
    renderHome();
  } else if (target === "data") {
    setView("data");
    renderDataPage();
  } else if (target === "calendar") {
    setView("calendar");
    renderCalendar();
  } else if (target === "settings") {
    setView("settings");
    renderSettings();
  }
  highlightBottomNav(target);
}

function highlightBottomNav(target) {
  DOM.bottomButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.go === target);
  });
}

function showApp() {
  DOM.appShell.hidden = false;
  DOM.bottomNav.hidden = false;
  setView("record");
}

function showSetupScreen() {
  DOM.setupScreen.hidden = false;
  DOM.appShell.hidden = true;
  DOM.bottomNav.hidden = true;
  setView("setup");
  renderSetupStage();
}

function handleLogin(event) {
  event.preventDefault();
  const loginId = DOM.loginId.value.trim();
  const password = DOM.loginPassword.value.trim();

  if (!loginId || !password) {
    showTransientFormError(DOM.loginForm, "ID邵ｺ・ｨ郢昜ｻ｣縺帷ｹ晢ｽｯ郢晢ｽｼ郢晏ｳｨ・定怦・･郢ｧ蠕娯ｻ邵ｺ・ｭ");
    return;
  }

  state.auth = { isAuthed: true, user: { name: loginId, id: loginId } };
  state.profile = state.profile ?? { name: loginId };
  saveState();
  setMascotMood([DOM.authMascot], "normal");
  setSpeech("郢晢ｽｭ郢ｧ・ｰ郢ｧ・､郢晢ｽｳ邵ｺ・ｧ邵ｺ髦ｪ笳・ｹｧ蛹ｻﾂ繧・ｽｻ鬆大ｾ狗ｹｧ繧・ｽ・ｸｺ・｣邵ｺ荳奇ｽ顔ｸｺ繝ｻ・・ｸｺ繝ｻ繝ｻ邵ｲ繝ｻ);
  beginMonthIfNeeded();
}

function handleRegister(event) {
  event.preventDefault();
  const name = DOM.registerName.value.trim();
  const registerId = DOM.registerId.value.trim();
  const password = DOM.registerPassword.value.trim();

  if (!name || !registerId || password.length < 8) {
    showTransientFormError(DOM.registerForm, "邵ｺ鄙ｫ竊醍ｸｺ・ｾ邵ｺ蛹ｻﾂ竏墅鍋ｹ晢ｽｼ郢晢ｽｫ邵ｲ繝ｻ隴√・・ｭ蠍ｺ・ｻ・･闕ｳ鄙ｫ繝ｻ郢昜ｻ｣縺帷ｹ晢ｽｯ郢晢ｽｼ郢晏ｳｨ窶ｲ陟｢繝ｻ・ｦ竏壺味郢ｧ繝ｻ);
    return;
  }

  state.auth = { isAuthed: true, user: { name, id: registerId } };
  state.profile = { name };
  saveState();
  setMascotMood([DOM.authMascot], "happy");
  setSpeech("騾具ｽｻ鬪ｭ・ｲ邵ｺ繧・ｽ顔ｸｺ蠕娯・邵ｺ繝ｻﾂ繧・ｽ・ｸｺ霈費ｼ邵ｺ蜀暦ｽｶ螢ｹ・郢ｧ蛹ｻ竕ｧ邵ｺ・ｭ邵ｲ繝ｻ);
  beginMonthIfNeeded();
}

function beginMonthIfNeeded() {
  if (ensureCurrentMonthConfig()) {
    showApp();
    renderAll();
    return;
  }

  if (ui.shouldPromptMonthCopy) {
    DOM.copyMonthDialog.showModal();
    return;
  }

  if (ui.setupFlow) {
    showSetupScreen();
    return;
  }

  showApp();
}

function handleCopyMonthDialogClose() {
  const value = DOM.copyMonthDialog.returnValue;
  const monthKey = ui.currentMonthKey;
  const previousKey = getPreviousMonthKey(monthKey);
  const previous = previousKey ? state.monthConfigs[previousKey] : null;

  if (value === "copy" && previous) {
    state.monthConfigs[monthKey] = copyMonthConfig(previous);
    saveState();
    ui.shouldPromptMonthCopy = false;
    showApp();
    renderAll();
    return;
  }

  ui.setupFlow = createSetupFlow(monthKey, null);
  ui.shouldPromptMonthCopy = false;
  persistSetupProgress();
  showSetupScreen();
}

function renderSetupStage() {
  if (!ui.setupFlow || ui.currentView !== "setup") {
    return;
  }

  const flow = ui.setupFlow;
  const categories = flow.categories;
  const current = categories[flow.index];
  DOM.setupActions.innerHTML = "";
  DOM.setupForm.hidden = false;

  if (!current) {
    DOM.setupChat.innerHTML = `
      <div class="chat-message chat-message--bot">邵ｺ繧・ｽ顔ｸｺ蠕娯・邵ｺ繝ｻﾂ繧・・陜玲ｫ・ｽｨ・ｭ陞ｳ螢ｹ窶ｲ驍ｨ繧・ｽ冗ｸｺ・｣邵ｺ貅假ｽ育ｸｲ繧・・郢晢ｽｼ郢晢｣ｰ邵ｺ・ｸ鬨ｾ・ｲ郢ｧ繧・鴬邵ｲ繝ｻ/div>
    `;
    DOM.setupForm.hidden = true;
    DOM.setupActions.innerHTML = `<button type="button" class="primary-button" data-setup-done>郢晏ｸ吶・郢晢｣ｰ邵ｺ・ｸ</button>`;
    DOM.setupActions.querySelector("[data-setup-done]")?.addEventListener("click", () => {
      finishSetup();
    });
    return;
  }

  const currentName = current.name || `郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ${flow.index + 1}`;
  DOM.setupChat.innerHTML = `
    <div class="chat-message chat-message--bot">
      <span class="chat-message__meta">${flow.index + 1}/${categories.length}</span>
      ${escapeHtml(currentName)}邵ｺ・ｯ邵ｺ繝ｻ・･郢ｧ蟲ｨ竊鍋ｸｺ蜷ｶ・九・繝ｻ    </div>
  `;
  DOM.setupInput.value = current.budget ? String(current.budget) : "";
  DOM.setupInput.placeholder = `${currentName}邵ｺ・ｮ闔閧ｲ・ｮ蜉ｱ・定怦・･陷牙ｫ｣;
  DOM.setupActions.innerHTML = `
    <button type="button" class="option-button" data-setup-add>郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ郢ｧ螳夲ｽｿ・ｽ陷会｣ｰ</button>
  `;
}

function handleSetupSubmit(event) {
  event.preventDefault();
  if (!ui.setupFlow) {
    return;
  }

  const value = Number(DOM.setupInput.value);
  if (!Number.isFinite(value) || value < 0) {
    showTransientFormError(DOM.setupForm, "鬩･鮃ｹ・｡髦ｪ・定怦・･郢ｧ蠕娯ｻ邵ｺ・ｭ");
    return;
  }

  const current = ui.setupFlow.categories[ui.setupFlow.index];
  if (current) {
    current.budget = Math.round(value);
  }

  ui.setupFlow.index += 1;
  persistSetupProgress();
  renderSetupStage();
}

function handleSetupActions(event) {
  const button = event.target.closest("[data-setup-add]");
  if (!button || !ui.setupFlow) {
    return;
  }

  const name = window.prompt("髴托ｽｽ陷会｣ｰ邵ｺ蜷ｶ・狗ｹｧ・ｫ郢昴・縺也ｹ晢ｽｪ陷ｷ髦ｪ・定怦・･郢ｧ蠕娯ｻ邵ｺ・ｭ");
  if (!name) {
    return;
  }
  const budget = Number(window.prompt(`${name}邵ｺ・ｮ闔閧ｲ・ｮ蜉ｱ・定怦・･郢ｧ蠕娯ｻ邵ｺ・ｭ`, "0"));
  if (!Number.isFinite(budget)) {
    return;
  }

  ui.setupFlow.categories.push({
    id: uid(),
    name: name.trim(),
    budget: Math.round(budget),
    color: DEFAULT_CATEGORY_COLORS[ui.setupFlow.categories.length % DEFAULT_CATEGORY_COLORS.length]
  });
  persistSetupProgress();
  renderSetupStage();
}

function finishSetup() {
  const monthKey = ui.currentMonthKey;
  const config = ui.setupFlow?.categories?.length
    ? {
        monthlyBudget: ui.setupFlow.categories.reduce((sum, category) => sum + Number(category.budget || 0), 0),
        categories: ui.setupFlow.categories.map((category) => ({ ...category }))
      }
    : createEmptyMonthConfig();

  state.monthConfigs[monthKey] = config;
  state.auth = state.auth?.isAuthed ? state.auth : { isAuthed: true, user: { name: "user" } };
  ui.setupFlow = null;
  clearSetupProgress();
  showApp();
  renderAll();
  setMascotMood([DOM.homeMascot, DOM.chatMascot], "normal");
  setSpeech("雋・摩・咏ｸｺ・ｧ邵ｺ髦ｪ笳・ｹｧ蛹ｻﾂ繧・ｽ・ｸｺ・｣邵ｺ荳奇ｽ企坎蛟ｬ鮖ｸ邵ｺ蜉ｱ窶ｻ邵ｺ繝ｻ・・ｸｺ繝ｻ繝ｻ邵ｲ繝ｻ);
}

function renderAll() {
  renderRemainingToday();
  renderHome();
  renderDataPage();
  renderCalendar();
  renderSettings();
  renderSetupStage();
  if (ui.recordFlow) {
    renderRecordFlow();
  }
}

function renderHome() {
  renderRemainingToday();
  renderHomeButtons();
  if (ui.recordCompletion) {
    DOM.chatLog.innerHTML = `
      <div class="chat-message chat-message--bot">
        <span class="chat-message__meta">髫ｪ蛟ｬ鮖ｸ陞ｳ蠕｡・ｺ繝ｻ/span>
        ${escapeHtml(ui.recordCompletion.message)}
        <div class="record-summary">
          <div class="record-summary__row"><span class="record-summary__label">隴鯉ｽ･闔峨・/span><strong>${escapeHtml(formatDateLabel(ui.recordCompletion.record.date))}</strong></div>
          <div class="record-summary__row"><span class="record-summary__label">郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ</span><strong>${escapeHtml(getCategoryById(ui.recordCompletion.record.categoryId)?.name || "")}</strong></div>
          <div class="record-summary__row"><span class="record-summary__label">鬩･鮃ｹ・｡繝ｻ/span><strong>${formatMoney(ui.recordCompletion.record.amount)}</strong></div>
          <div class="record-summary__row"><span class="record-summary__label">鬨ｾ・｣驍ｯ螟奇ｽｨ蛟ｬ鮖ｸ</span><strong>${ui.recordCompletion.streak}隴鯉ｽ･鬨ｾ・｣驍ｯ螟ｲ・ｼ繝ｻ/strong></div>
        </div>
      </div>
    `;
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-chat-action="confirm">邵ｺ荵晢ｿ･邵ｺ・ｫ郢ｧ繝ｻ/button>
      <button type="button" class="option-button" data-chat-action="record">邵ｺ髦ｪ・咲ｸｺ繝ｻ/button>
    `;
    DOM.chatComposer.hidden = false;
    DOM.chatInput.placeholder = "驍ｯ螢ｹ・邵ｺ・ｦ陷茨ｽ･陷牙ｸ呻ｼ邵ｺ・ｦ郢ｧ繧・ｼ樒ｸｺ繝ｻ・・;
    return;
  }

  if (!ui.recordFlow) {
    DOM.chatLog.innerHTML = `
      <div class="chat-message chat-message--bot">邵ｺ・ｪ邵ｺ・ｫ邵ｺ蜷ｶ・九・繝ｻ/div>
    `;
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-chat-action="confirm">邵ｺ荵晢ｿ･邵ｺ・ｫ郢ｧ繝ｻ/button>
      <button type="button" class="option-button" data-chat-action="record">邵ｺ髦ｪ・咲ｸｺ繝ｻ/button>
    `;
    DOM.chatComposer.hidden = false;
    DOM.chatInput.placeholder = "邵ｺ阮呻ｼ・ｸｺ・ｫ陷茨ｽ･陷牙ｸ呻ｼ邵ｺ・ｦ郢ｧ繧・ｽ､・ｧ闕ｳ莠･・､・ｫ";
  } else {
    renderRecordFlow();
  }
}

function renderHomeButtons() {
  const recordsToday = getRecordsForDate(toDateKey(new Date()));
  const streak = getStreakDays();
  if (ui.recordCompletion) {
    DOM.speechBubble.textContent = `${ui.recordCompletion.message} ${streak > 1 ? `${streak}隴鯉ｽ･鬨ｾ・｣驍ｯ螟ｲ・ｼ・・: "闔蛾大ｾ狗ｹｧ繧・斡郢ｧ蟲ｨ・槭・繝ｻ}`;
    return;
  }

  DOM.speechBubble.textContent = recordsToday.length
    ? `闔蛾大ｾ狗ｹｧ繧奇ｽｨ蛟ｬ鮖ｸ邵ｺ・ｧ邵ｺ髦ｪ窶ｻ郢ｧ荵昴・邵ｲ繝ｻ{streak > 1 ? `${streak}隴鯉ｽ･鬨ｾ・｣驍ｯ螢ｹ笆｡郢ｧ蛹ｻﾂ・｡ : "邵ｺ蛹ｻ・臥ｸｺ繝ｻ・ｼ繝ｻ}`
    : "闔蛾大ｾ狗ｸｺ・ｯ邵ｺ・ｩ郢ｧ阮吮・1隴鯉ｽ･邵ｺ・ｫ邵ｺ蜷ｶ・九・繝ｻ;
}

function handleHomeAction(event) {
  const target = event.currentTarget.dataset.homeAction;
  if (target === "confirm") {
    navigate("data");
    return;
  }
  if (target === "record") {
    startRecordFlow();
  }
}

function startRecordFlow(record = null, initialStep = "date") {
  if (!state.monthConfigs[ui.currentMonthKey]) {
    beginMonthIfNeeded();
    return;
  }
  ui.recordCompletion = null;
  ui.recordDraft = record
    ? { ...record, mode: "edit", id: record.id }
    : {
        id: uid(),
        mode: "new",
        date: toDateKey(new Date()),
        categoryId: "",
        amount: 0,
        detailed: false,
        store: "",
        memo: "",
        receiptImage: "",
        receiptFileName: "",
        recordType: "quick",
        quickRange: "low",
        quickDetailMode: null,
        selectedDate: null
      };
  ui.recordFlow = {
    step: initialStep,
    editField: null,
    quickRange: "low",
    amountStage: "range",
    receiptImageData: "",
    receiptFile: null,
    aiResult: null
  };
  setMascotMood([DOM.chatMascot, DOM.homeMascot], "normal");
  setView("record");
  renderRecordFlow();
}

function resetRecordFlow() {
  ui.recordFlow = null;
  ui.recordDraft = null;
  ui.recordCompletion = null;
  setView("record");
  renderRecordFlow();
  setMascotMood([DOM.chatMascot, DOM.homeMascot], "normal");
  setSpeech("なにする？");
}
function renderRecordFlow() {
  if (!ui.recordFlow) {
    DOM.chatComposer.hidden = true;
    DOM.chatLog.innerHTML = `<div class="chat-message chat-message--bot">なにする？</div>`;
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-chat-action="confirm">かくにん</button>
      <button type="button" class="option-button" data-chat-action="record">きろく</button>
    `;
    return;
  }

  DOM.chatComposer.hidden = false;
  const draft = ui.recordDraft;
  const step = ui.recordFlow.step;
  DOM.chatLog.innerHTML = "";
  DOM.chatActions.innerHTML = "";
  DOM.chatInput.value = "";
  DOM.chatInput.placeholder = "邵ｺ阮呻ｼ・ｸｺ・ｫ陷茨ｽ･陷峨・;

  if (step === "date") {
    renderBotMessage("邵ｺ繝ｻ笆ｽ邵ｺ・ｮ邵ｺ髦ｪ・咲ｸｺ謫ｾ・ｼ繝ｻ);
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-step-date="today">闔蛾大ｾ・/button>
      <button type="button" class="option-button" data-step-date="yesterday">隴擾ｽｨ隴鯉ｽ･</button>
      <button type="button" class="option-button" data-step-date="other">陋ｻ・･邵ｺ・ｮ隴鯉ｽ･</button>
    `;
    return;
  }

  if (step === "date-other") {
    renderBotMessage("郢ｧ・ｫ郢晢ｽｬ郢晢ｽｳ郢敖郢晢ｽｼ邵ｺ荵晢ｽ芽ｭ鯉ｽ･闔牙･・帝ｩ包ｽｸ郢ｧ阮吶堤ｸｺ・ｭ");
    DOM.chatActions.innerHTML = renderMiniCalendarMarkup();
    bindMiniCalendarButtons();
    return;
  }

  if (step === "category") {
    renderBotMessage("郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ邵ｺ・ｯ繝ｻ繝ｻ);
    const categories = getCurrentCategories();
    DOM.chatActions.innerHTML = `
      ${categories.map((category) => `<button type="button" class="option-button" data-category-id="${category.id}">${escapeHtml(category.name)}</button>`).join("")}
      <button type="button" class="option-button" data-add-category>郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ郢ｧ蛛ｵ繝ｻ郢ｧ繝ｻ笘・/button>
    `;
    return;
  }

  if (step === "category-add-name") {
    renderBotMessage("隴・ｽｰ邵ｺ蜉ｱ・樒ｹｧ・ｫ郢昴・縺也ｹ晢ｽｪ陷ｷ髦ｪ・定怦・･郢ｧ蠕娯ｻ邵ｺ・ｭ");
    DOM.chatInput.placeholder = "關灘・・ｼ螢ｽ蠕矩包ｽｨ陷ｩ繝ｻ;
    DOM.chatComposer.hidden = false;
    return;
  }

  if (step === "category-add-budget") {
    renderBotMessage(`${draft.newCategoryName}邵ｺ・ｮ闔閧ｲ・ｮ蜉ｱ繝ｻ繝ｻ豁・;
    DOM.chatInput.placeholder = "鬩･鮃ｹ・｡髦ｪ・定怦・･陷峨・;
    return;
  }

  if (step === "detail-toggle") {
    renderBotMessage("邵ｺ荳奇ｽ冗ｸｺ蜉ｱ・･邵ｺ髦ｪ・咲ｸｺ荳岩・郢ｧ蜈ｷ・ｼ繝ｻ);
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-detail-toggle="yes">邵ｺ・ｯ邵ｺ繝ｻ/button>
      <button type="button" class="option-button" data-detail-toggle="no">邵ｺ繝ｻ・樒ｸｺ繝ｻ/button>
    `;
    return;
  }

  if (step === "detail") {
    renderBotMessage("陟手挙繝ｻ陷ｷ髦ｪﾂ繝ｻ竕｡鬯倬亂ﾂ竏墅鍋ｹ晢ｽ｢邵ｲ竏墅樒ｹｧ・ｷ郢晢ｽｼ郢晏現・定怦・･郢ｧ蠕娯ｻ邵ｺ・ｭ");
    DOM.chatLog.insertAdjacentHTML("beforeend", renderDetailEditor());
    bindDetailEditor();
    DOM.chatComposer.hidden = true;
    return;
  }

  if (step === "quick-range") {
    renderBotMessage("邵ｺ繝ｻ・･郢ｧ蟲ｨ・･郢ｧ蟲ｨ・槭・繝ｻ);
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-amount-range="low">1000陷繝ｻ・ｻ・･闕ｳ繝ｻ/button>
      <button type="button" class="option-button" data-amount-range="mid">1000邵ｲ繝ｻ0000陷繝ｻ/button>
      <button type="button" class="option-button" data-amount-range="high">10000陷繝ｻ・ｻ・･闕ｳ繝ｻ/button>
      <button type="button" class="option-button" data-amount-range="custom">邵ｺ荳奇ｽ冗ｸｺ蜉ｱ・･陷茨ｽ･陷峨・/button>
    `;
    return;
  }

  if (step === "quick-low") {
    renderBotMessage("100陷繝ｻ閻ｰ闖ｴ髦ｪ縲帝ｩ包ｽｸ郢ｧ阮吶堤ｸｺ・ｭ");
    DOM.chatActions.innerHTML = renderAmountButtons(100, 1000, 100);
    return;
  }

  if (step === "quick-mid") {
    renderBotMessage("1000陷繝ｻ閻ｰ闖ｴ髦ｪ縲帝ｩ包ｽｸ郢ｧ阮吶堤ｸｺ・ｭ");
    DOM.chatActions.innerHTML = renderAmountButtons(1000, 10000, 1000);
    return;
  }

  if (step === "quick-mid-fine") {
    renderBotMessage("100陷繝ｻ蠎顔ｹｧ繧・・郢ｧ蠕鯉ｽ九・繝ｻ);
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-fine-100="yes">邵ｺ・ｯ邵ｺ繝ｻ/button>
      <button type="button" class="option-button" data-fine-100="no">邵ｺ繝ｻ・樒ｸｺ繝ｻ/button>
    `;
    return;
  }

  if (step === "quick-mid-fine-amount") {
    renderBotMessage("100陷繝ｻ閻ｰ闖ｴ髦ｪ縲帝屆・ｳ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ");
    DOM.chatActions.innerHTML = renderAmountButtons(100, 900, 100);
    return;
  }

  if (step === "quick-high") {
    renderBotMessage("10000陷繝ｻ閻ｰ闖ｴ髦ｪ縲帝ｩ包ｽｸ郢ｧ阮吶堤ｸｺ・ｭ");
    DOM.chatActions.innerHTML = renderAmountButtons(10000, 100000, 10000);
    return;
  }

  if (step === "quick-high-thousand") {
    renderBotMessage("1000陷繝ｻ閻ｰ闖ｴ髦ｪ・り怦・･郢ｧ蠕鯉ｽ九・繝ｻ);
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-fine-1000="yes">邵ｺ・ｯ邵ｺ繝ｻ/button>
      <button type="button" class="option-button" data-fine-1000="no">邵ｺ繝ｻ・樒ｸｺ繝ｻ/button>
    `;
    return;
  }

  if (step === "quick-high-thousand-amount") {
    renderBotMessage("1000陷繝ｻ閻ｰ闖ｴ髦ｪ縲帝屆・ｳ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ");
    DOM.chatActions.innerHTML = renderAmountButtons(1000, 9000, 1000);
    return;
  }

  if (step === "quick-high-fine") {
    renderBotMessage("100陷繝ｻ蠎顔ｹｧ繧・・郢ｧ蠕鯉ｽ九・繝ｻ);
    DOM.chatActions.innerHTML = `
      <button type="button" class="option-button" data-fine-100="yes">邵ｺ・ｯ邵ｺ繝ｻ/button>
      <button type="button" class="option-button" data-fine-100="no">邵ｺ繝ｻ・樒ｸｺ繝ｻ/button>
    `;
    return;
  }

  if (step === "quick-high-fine-amount") {
    renderBotMessage("100陷繝ｻ閻ｰ闖ｴ髦ｪ縲帝屆・ｳ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ");
    DOM.chatActions.innerHTML = renderAmountButtons(100, 900, 100);
    return;
  }

  if (step === "summary") {
    renderConfirmationSummary();
    return;
  }

  if (step === "edit-select") {
    renderEditSelect();
    return;
  }

  if (step === "edit-field") {
    renderEditField();
    return;
  }
}

function renderBotMessage(message) {
  DOM.chatLog.insertAdjacentHTML("beforeend", `<div class="chat-message chat-message--bot">${escapeHtml(message)}</div>`);
}

function renderUserMessage(message) {
  DOM.chatLog.insertAdjacentHTML("beforeend", `<div class="chat-message chat-message--user">${escapeHtml(message)}</div>`);
}

function renderMiniCalendarMarkup() {
  const now = new Date();
  const cells = getMonthDates(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return `
    <div class="mini-calendar">
      ${cells.map((date) => {
        const dateKey = toDateKey(date);
        const outside = date.getMonth() !== monthStart.getMonth();
        return `<button type="button" class="calendar-cell${outside ? " is-outside" : ""}" data-mini-date="${dateKey}">
          <span class="calendar-cell__day">${date.getDate()}</span>
        </button>`;
      }).join("")}
    </div>
  `;
}

function bindMiniCalendarButtons() {
  DOM.chatActions.querySelectorAll("[data-mini-date]").forEach((button) => {
    button.addEventListener("click", () => {
      ui.recordDraft.date = button.dataset.miniDate;
      ui.recordFlow.step = "category";
      renderRecordFlow();
    });
  });
}

function renderAmountButtons(start, end, step) {
  const buttons = [];
  for (let value = start; value <= end; value += step) {
    buttons.push(`<button type="button" class="option-button" data-amount-value="${value}">${formatMoney(value)}</button>`);
  }
  return buttons.join("");
}

function renderDetailEditor() {
  const draft = ui.recordDraft;
  return `
    <div class="record-summary">
      <label class="field"><span>陟手挙繝ｻ陷ｷ繝ｻ/span><input id="detailStore" type="text" value="${escapeHtml(draft.store || "")}" placeholder="關灘・・ｼ螢ｹ縺慕ｹ晢ｽｳ郢晁侭繝ｫ"></label>
      <label class="field"><span>鬩･鮃ｹ・｡繝ｻ/span><input id="detailAmount" type="number" min="0" step="1" value="${escapeHtml(draft.amount || "")}" placeholder="0"></label>
      <label class="field"><span>郢晢ｽ｡郢晢ｽ｢</span><textarea id="detailMemo" placeholder="闔会ｽｻ隲｢荳翫・郢晢ｽ｡郢晢ｽ｢">${escapeHtml(draft.memo || "")}</textarea></label>
      <label class="field"><span>郢晢ｽｬ郢ｧ・ｷ郢晢ｽｼ郢晏沺閨ｴ陟厄ｽｱ / 郢ｧ・｢郢昴・繝ｻ郢晢ｽｭ郢晢ｽｼ郢昴・/span><input id="receiptFile" class="hidden-file" type="file" accept="image/*"></label>
      <div class="home-actions">
        <button type="button" class="secondary-button" data-receipt-select>騾包ｽｻ陷剃ｸ奇ｽ帝ｩ包ｽｸ邵ｺ・ｶ</button>
        <button type="button" class="secondary-button" data-receipt-ai>AI邵ｺ・ｧ郢ｧ蛹ｻ竏ｩ邵ｺ・ｨ郢ｧ繝ｻ/button>
      </div>
      <div id="receiptResult" class="subcopy">騾包ｽｻ陷剃ｸ翫・髫ｪ・ｭ陞ｳ螢ｹ縲定将譎擾ｽｭ讌ｼN邵ｺ・ｫ邵ｺ蜉ｱ笳・撻・ｴ陷ｷ蛹ｻ繝ｻ邵ｺ・ｿ闖ｫ譎・亜邵ｺ蜉ｱ竏ｪ邵ｺ蜷ｶﾂ繝ｻ/div>
      <div class="home-actions">
        <button type="button" class="primary-button" data-detail-next>隹ｺ・｡邵ｺ・ｸ</button>
      </div>
    </div>
  `;
}

function bindDetailEditor() {
  const store = document.querySelector("#detailStore");
  const amount = document.querySelector("#detailAmount");
  const memo = document.querySelector("#detailMemo");
  const file = document.querySelector("#receiptFile");
  const selectButton = document.querySelector("[data-receipt-select]");
  const aiButton = document.querySelector("[data-receipt-ai]");
  const nextButton = document.querySelector("[data-detail-next]");
  const result = document.querySelector("#receiptResult");

  selectButton?.addEventListener("click", () => file?.click());
  file?.addEventListener("change", () => {
    const selected = file.files?.[0];
    if (selected) {
      ui.recordFlow.receiptFile = selected;
      result.textContent = `鬩包ｽｸ隰壽ｧｭ・邵ｺ貅ｽ蛻､陷偵・ ${selected.name}`;
    }
  });

  aiButton?.addEventListener("click", async () => {
    const selected = file?.files?.[0];
    if (!selected) {
      result.textContent = "陷亥現竊鍋ｹ晢ｽｬ郢ｧ・ｷ郢晢ｽｼ郢晁ご蛻､陷剃ｸ奇ｽ帝ｩ包ｽｸ郢ｧ阮吶堤ｸｺ・ｭ邵ｲ繝ｻ;
      return;
    }
    if (!window.Tesseract?.recognize) {
      result.textContent = "邵ｺ阮吶・驕ｶ・ｯ隴幢ｽｫ邵ｺ・ｧ邵ｺ・ｯAI髫ｱ・ｭ邵ｺ・ｿ陷ｿ謔ｶ・顔ｹｧ蜑・ｽｽ・ｿ邵ｺ蛹ｻ竊醍ｸｺ繝ｻ繝ｻ邵ｺ・ｧ邵ｲ竏ｵ辟碑怦・･陷牙ｸ吶帝ｨｾ・ｲ郢ｧ竏壺ｻ邵ｺ・ｭ邵ｲ繝ｻ;
      return;
    }

    result.textContent = "髫ｱ・ｭ邵ｺ・ｿ陷ｿ謔ｶ・願叉・ｭ...";
    try {
      const { data } = await window.Tesseract.recognize(selected, "jpn+eng");
      const text = data.text || "";
      const extractedAmount = extractAmount(text);
      if (extractedAmount) {
        amount.value = String(extractedAmount);
      }
      const extractedStore = extractStoreName(text);
      if (extractedStore) {
        store.value = extractedStore;
      }
      ui.recordFlow.aiResult = text.slice(0, 120);
      result.textContent = "髫ｱ・ｭ邵ｺ・ｿ陷ｿ謔ｶ・顔ｸｺ・ｧ邵ｺ髦ｪ笳・ｹｧ蛹ｻﾂ繧・ｽｿ繝ｻ・ｦ竏壺・郢ｧ迚呻ｽｰ莉｣・騾ｶ・ｴ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ邵ｲ繝ｻ;
    } catch (error) {
      result.textContent = "髫ｱ・ｭ邵ｺ・ｿ陷ｿ謔ｶ・顔ｸｺ・ｫ陞滂ｽｱ隰ｨ蜉ｱ・邵ｺ貅假ｽ育ｸｲ繧育・陷茨ｽ･陷牙ｸ吶堤ｹｧ繧・ｽ､・ｧ闕ｳ莠･・､・ｫ邵ｲ繝ｻ;
    }
  });

  nextButton?.addEventListener("click", () => {
    ui.recordDraft.store = store.value.trim();
    ui.recordDraft.amount = Number(amount.value || 0);
    ui.recordDraft.memo = memo.value.trim();
    ui.recordFlow.step = "summary";
    renderRecordFlow();
  });
}

function renderConfirmationSummary() {
  const draft = ui.recordDraft;
  const category = getCategoryById(draft.categoryId);
  const detailLines = [];
  detailLines.push(`<div class="record-summary__row"><span class="record-summary__label">隴鯉ｽ･闔峨・/span><strong>${escapeHtml(formatDateLabel(draft.date))}</strong></div>`);
  detailLines.push(`<div class="record-summary__row"><span class="record-summary__label">郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ</span><strong>${escapeHtml(category?.name || "")}</strong></div>`);
  detailLines.push(`<div class="record-summary__row"><span class="record-summary__label">鬩･鮃ｹ・｡繝ｻ/span><strong>${formatMoney(draft.amount)}</strong></div>`);
  if (draft.store || draft.memo) {
    detailLines.push(`<div class="record-summary__row"><span class="record-summary__label">陟手挙繝ｻ</span><strong>${escapeHtml(draft.store || "邵ｺ・ｪ邵ｺ繝ｻ)}</strong></div>`);
    detailLines.push(`<div class="record-summary__row"><span class="record-summary__label">郢晢ｽ｡郢晢ｽ｢</span><strong>${escapeHtml(draft.memo || "邵ｺ・ｪ邵ｺ繝ｻ)}</strong></div>`);
  }
  DOM.chatLog.innerHTML = `
    <div class="chat-message chat-message--bot">
      邵ｺ繧・ｽ顔ｸｺ蠕娯・邵ｺ繝ｻﾂ繧・ｼ・ｹｧ蠕後帝坎蛟ｬ鮖ｸ邵ｺ蜉ｱ窶ｻ邵ｺ繝ｻ・樒ｸｺ荵昶・繝ｻ繝ｻ      <div class="record-summary">${detailLines.join("")}</div>
    </div>
  `;
  DOM.chatActions.innerHTML = `
    <button type="button" class="option-button" data-confirm-record="save">髫ｪ蛟ｬ鮖ｸ邵ｺ蜷ｶ・・/button>
    <button type="button" class="option-button" data-confirm-record="edit">陞溽判蟲ｩ邵ｺ蜷ｶ・・/button>
  `;
}

function renderEditSelect() {
  const draft = ui.recordDraft;
  DOM.chatLog.innerHTML = `
    <div class="chat-message chat-message--bot">
      闖ｴ霈費ｽ定棔逕ｻ蟲ｩ邵ｺ蜉ｱ竏ｪ邵ｺ蜷ｶﾂｰ繝ｻ繝ｻ      <div class="record-summary">
        <div class="record-summary__row"><span class="record-summary__label">隴鯉ｽ･闔峨・/span><strong>${escapeHtml(formatDateLabel(draft.date))}</strong></div>
        <div class="record-summary__row"><span class="record-summary__label">郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ</span><strong>${escapeHtml(getCategoryById(draft.categoryId)?.name || "")}</strong></div>
        <div class="record-summary__row"><span class="record-summary__label">鬩･鮃ｹ・｡繝ｻ/span><strong>${formatMoney(draft.amount)}</strong></div>
        <div class="record-summary__row"><span class="record-summary__label">陟手挙繝ｻ</span><strong>${escapeHtml(draft.store || "邵ｺ・ｪ邵ｺ繝ｻ)}</strong></div>
        <div class="record-summary__row"><span class="record-summary__label">郢晢ｽ｡郢晢ｽ｢</span><strong>${escapeHtml(draft.memo || "邵ｺ・ｪ邵ｺ繝ｻ)}</strong></div>
      </div>
    </div>
  `;
  DOM.chatActions.innerHTML = `
    <button type="button" class="option-button" data-edit-field="date">隴鯉ｽ･闔峨・/button>
    <button type="button" class="option-button" data-edit-field="category">郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ</button>
    <button type="button" class="option-button" data-edit-field="amount">鬩･鮃ｹ・｡繝ｻ/button>
    <button type="button" class="option-button" data-edit-field="store">陟手挙繝ｻ陷ｷ繝ｻ/button>
    <button type="button" class="option-button" data-edit-field="memo">郢晢ｽ｡郢晢ｽ｢</button>
    <button type="button" class="option-button" data-edit-field="detail">邵ｺ荳奇ｽ冗ｸｺ蜉ｱ・･</button>
  `;
}

function renderEditField() {
  const field = ui.recordFlow.editField;
  const draft = ui.recordDraft;
  const currentValue = field === "date"
    ? draft.date
    : field === "category"
      ? getCategoryById(draft.categoryId)?.name || ""
      : field === "amount"
        ? String(draft.amount)
        : field === "store"
          ? draft.store || ""
          : draft.memo || "";

  DOM.chatLog.innerHTML = `
    <div class="chat-message chat-message--bot">
      ${field === "date" ? "隴鯉ｽ･闔牙･・帝ｶ・ｴ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ" : field === "category" ? "郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ郢ｧ蝣､蟲ｩ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ" : field === "amount" ? "鬩･鮃ｹ・｡髦ｪ・帝ｶ・ｴ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ" : field === "store" ? "陟手挙繝ｻ陷ｷ髦ｪ・帝ｶ・ｴ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ" : field === "memo" ? "郢晢ｽ｡郢晢ｽ｢郢ｧ蝣､蟲ｩ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ" : "邵ｺ荳奇ｽ冗ｸｺ蜉ｱ・･邵ｺ髦ｪ・咲ｸｺ荳岩・郢ｧ蜿･繝ｻ陞ｳ・ｹ郢ｧ蝣､蟲ｩ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ"}
      <div class="record-summary">
        <div class="record-summary__row"><span class="record-summary__label">霑ｴ・ｾ陜ｨ・ｨ陋滂ｽ､</span><strong>${escapeHtml(currentValue || "邵ｺ・ｪ邵ｺ繝ｻ)}</strong></div>
      </div>
    </div>
  `;

  if (field === "date") {
    DOM.chatActions.innerHTML = renderMiniCalendarMarkup();
    bindMiniCalendarButtonsForEdit();
    return;
  }

  if (field === "category") {
    DOM.chatActions.innerHTML = getCurrentCategories().map((category) => `<button type="button" class="option-button" data-edit-category="${category.id}">${escapeHtml(category.name)}</button>`).join("");
    return;
  }

  if (field === "amount") {
    DOM.chatActions.innerHTML = renderAmountButtons(100, 100000, 100);
    return;
  }

  DOM.chatComposer.hidden = false;
  DOM.chatInput.value = currentValue || "";
  DOM.chatInput.placeholder = field === "store" ? "陟手挙繝ｻ陷ｷ髦ｪ・定怦・･陷峨・ : "郢晢ｽ｡郢晢ｽ｢郢ｧ雋槭・陷峨・;
}

function bindMiniCalendarButtonsForEdit() {
  DOM.chatActions.querySelectorAll("[data-mini-date]").forEach((button) => {
    button.addEventListener("click", () => {
      ui.recordDraft.date = button.dataset.miniDate;
      ui.recordFlow.step = "summary";
      ui.recordFlow.editField = null;
      renderRecordFlow();
    });
  });
}

function handleChatSubmit(event) {
  event.preventDefault();
  if (!ui.recordFlow) {
    const value = DOM.chatInput.value.trim();
    if (value) {
      DOM.chatLog.innerHTML = `<div class="chat-message chat-message--bot">邵ｺ・ｾ邵ｺ螢ｹ繝ｻ邵ｲ蠕個ｰ邵ｺ荳岩・郢ｧ阮卍髦ｪﾂｰ邵ｲ蠕娯ｳ郢ｧ髦ｪ・･邵ｲ髦ｪ・定ｬ夲ｽｼ邵ｺ蜉ｱ窶ｻ邵ｺ・ｭ邵ｲ繝ｻ/div>`;
    }
    DOM.chatInput.value = "";
    return;
  }

  const value = DOM.chatInput.value.trim();
  if (!value) {
    showTransientFormError(DOM.chatComposer, "陷茨ｽ･陷牙ｸ呻ｼ邵ｺ・ｦ邵ｺ・ｭ");
    return;
  }

  if (ui.recordFlow.step === "category-add-name") {
    ui.recordDraft.newCategoryName = value;
    ui.recordFlow.step = "category-add-budget";
    renderRecordFlow();
    return;
  }

  if (ui.recordFlow.step === "category-add-budget") {
    const budget = Number(value);
    if (!Number.isFinite(budget)) {
      showTransientFormError(DOM.chatComposer, "鬩･鮃ｹ・｡髦ｪ縲定怦・･郢ｧ蠕娯ｻ邵ｺ・ｭ");
      return;
    }
    const newCategory = {
      id: uid(),
      name: ui.recordDraft.newCategoryName,
      budget: Math.round(budget),
      color: DEFAULT_CATEGORY_COLORS[getCurrentCategories().length % DEFAULT_CATEGORY_COLORS.length]
    };
    const monthConfig = getCurrentMonthConfig();
    monthConfig.categories.push(newCategory);
    saveState();
    ui.recordDraft.categoryId = newCategory.id;
    ui.recordFlow.step = "detail-toggle";
    renderRecordFlow();
    return;
  }

  if (ui.recordFlow.step === "detail") {
    return;
  }

  if (ui.recordFlow.step === "edit-field") {
    const field = ui.recordFlow.editField;
    applyEditTextField(field, value);
    return;
  }
}

function handleChatActions(event) {
  const button = event.target.closest("button");
  if (!button || !ui.recordFlow) {
    return;
  }

  if (button.dataset.chatAction === "confirm") {
    navigate("data");
    return;
  }

  if (button.dataset.chatAction === "record") {
    startRecordFlow();
    return;
  }

  if (button.dataset.stepDate) {
    if (button.dataset.stepDate === "today") {
      ui.recordDraft.date = toDateKey(new Date());
      ui.recordFlow.step = "category";
    } else if (button.dataset.stepDate === "yesterday") {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      ui.recordDraft.date = toDateKey(date);
      ui.recordFlow.step = "category";
    } else {
      ui.recordFlow.step = "date-other";
    }
    renderRecordFlow();
    return;
  }

  if (button.dataset.categoryId) {
    ui.recordDraft.categoryId = button.dataset.categoryId;
    ui.recordFlow.step = "detail-toggle";
    renderRecordFlow();
    return;
  }

  if (button.dataset.addCategory !== undefined) {
    ui.recordFlow.step = "category-add-name";
    renderRecordFlow();
    return;
  }

  if (button.dataset.detailToggle) {
    if (button.dataset.detailToggle === "yes") {
      ui.recordDraft.detailed = true;
      ui.recordFlow.step = "detail";
    } else {
      ui.recordDraft.detailed = false;
      ui.recordFlow.step = "quick-range";
    }
    renderRecordFlow();
    return;
  }

  if (button.dataset.amountRange) {
    const range = button.dataset.amountRange;
    ui.recordDraft.quickRange = range;
    if (range === "low") {
      ui.recordFlow.step = "quick-low";
    } else if (range === "mid") {
      ui.recordFlow.step = "quick-mid";
    } else if (range === "high") {
      ui.recordFlow.step = "quick-high";
    } else {
      ui.recordDraft.detailed = true;
      ui.recordFlow.step = "detail";
    }
    renderRecordFlow();
    return;
  }

  if (button.dataset.amountValue) {
    const amount = Number(button.dataset.amountValue);
    if (ui.recordFlow.step === "quick-low" || ui.recordFlow.step === "quick-mid" || ui.recordFlow.step === "quick-high") {
      ui.recordDraft.amount = amount;
    } else if (ui.recordFlow.step === "quick-mid-fine-amount" || ui.recordFlow.step === "quick-high-thousand-amount" || ui.recordFlow.step === "quick-high-fine-amount") {
      ui.recordDraft.amount += amount;
    }

    if (ui.recordFlow.step === "quick-low") {
      ui.recordFlow.step = "summary";
    } else if (ui.recordFlow.step === "quick-mid") {
      ui.recordFlow.step = "quick-mid-fine";
    } else if (ui.recordFlow.step === "quick-mid-fine-amount") {
      ui.recordFlow.step = "summary";
    } else if (ui.recordFlow.step === "quick-high") {
      ui.recordFlow.step = "quick-high-thousand";
    } else if (ui.recordFlow.step === "quick-high-thousand-amount") {
      ui.recordFlow.step = "quick-high-fine";
    } else if (ui.recordFlow.step === "quick-high-fine-amount") {
      ui.recordFlow.step = "summary";
    }
    renderRecordFlow();
    return;
  }

  if (button.dataset.fine100) {
    if (ui.recordFlow.step === "quick-mid-fine") {
      ui.recordFlow.step = button.dataset.fine100 === "yes" ? "quick-mid-fine-amount" : "summary";
    } else if (ui.recordFlow.step === "quick-high-fine") {
      ui.recordFlow.step = button.dataset.fine100 === "yes" ? "quick-high-fine-amount" : "summary";
    }
    renderRecordFlow();
    return;
  }

  if (button.dataset.fine1000) {
    if (button.dataset.fine1000 === "yes") {
      ui.recordFlow.step = "quick-high-thousand-amount";
    } else {
      ui.recordFlow.step = "quick-high-fine";
    }
    renderRecordFlow();
    return;
  }

  if (button.dataset.confirmRecord) {
    if (button.dataset.confirmRecord === "save") {
      commitRecord();
    } else {
      ui.recordFlow.step = "edit-select";
      renderRecordFlow();
    }
    return;
  }

  if (button.dataset.editField) {
    ui.recordFlow.editField = button.dataset.editField;
    ui.recordFlow.step = "edit-field";
    renderRecordFlow();
    return;
  }

  if (button.dataset.editCategory) {
    ui.recordDraft.categoryId = button.dataset.editCategory;
    ui.recordFlow.step = "summary";
    renderRecordFlow();
  }
}

function applyEditTextField(field, value) {
  if (field === "date") {
    ui.recordDraft.date = value;
  } else if (field === "amount") {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      showTransientFormError(DOM.chatComposer, "鬩･鮃ｹ・｡髦ｪ縲定怦・･郢ｧ蠕娯ｻ邵ｺ・ｭ");
      return;
    }
    ui.recordDraft.amount = Math.round(amount);
  } else if (field === "store") {
    ui.recordDraft.store = value;
  } else if (field === "memo") {
    ui.recordDraft.memo = value;
  }
  ui.recordFlow.step = "summary";
  ui.recordFlow.editField = null;
  renderRecordFlow();
}

function commitRecord() {
  const draft = ui.recordDraft;
  const record = {
    id: draft.id || uid(),
    date: draft.date,
    categoryId: draft.categoryId,
    amount: Math.round(Number(draft.amount || 0)),
    store: draft.store || "",
    memo: draft.memo || "",
    detailed: Boolean(draft.detailed),
    receiptImage: state.settings.receiptImageSaving && ui.recordFlow.receiptFile ? ui.recordFlow.receiptFile.name : "",
    receiptFileName: ui.recordFlow.receiptFile?.name || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!record.categoryId) {
    showTransientFormError(DOM.chatComposer, "郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ郢ｧ蟶昶・郢ｧ阮吶堤ｸｺ・ｭ");
    return;
  }

  if (draft.mode === "edit") {
    const index = state.records.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      state.records[index] = { ...state.records[index], ...record };
    }
  } else {
    state.records.unshift(record);
  }

  state.lastStreakDate = record.date;
  saveState();
  const streak = getStreakDays();
  const message = pickRandom(RECENT_MESSAGES);
  ui.recordFlow = null;
  ui.recordDraft = null;
  ui.recordCompletion = { record, streak, message };
  setMascotMood([DOM.homeMascot, DOM.chatMascot, DOM.setupMascot, DOM.authMascot], "happy");
  celebrateMascot([DOM.homeMascot, DOM.chatMascot]);
  setSpeech(message);
  DOM.chatActions.innerHTML = "";
  DOM.chatComposer.hidden = true;
  renderAll();
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getStreakDays() {
  const records = [...state.records]
    .map((record) => record.date)
    .filter(Boolean)
    .sort()
    .reverse();

  if (!records.length) {
    return 0;
  }

  const seen = new Set(records);
  let streak = 0;
  let cursor = new Date(`${records[0]}T00:00:00`);
  while (seen.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderDataPage() {
  const categories = getCurrentCategories();
  DOM.categorySummaryList.innerHTML = categories.map((category) => {
    const remaining = getCategoryRemaining(category);
    const spent = Number(category.budget || 0) - remaining;
    return `
      <article class="summary-item">
        <div class="summary-item__top">
          <strong>${escapeHtml(category.name)}</strong>
          <strong>${formatMoney(remaining)}</strong>
        </div>
        <div class="summary-item__rest">髫ｪ・ｭ陞ｳ繝ｻ${formatMoney(category.budget)} / 闖ｴ・ｿ邵ｺ・｣邵ｺ繝ｻ${formatMoney(spent)}</div>
      </article>
    `;
  }).join("");

  DOM.bottleGrid.innerHTML = categories.map((category) => {
    const fill = 1 - getCategoryProgress(category);
    return `
      <article class="bottle" style="--color:${category.color}; --fill:${clamp(fill, 0, 1)}">
        <div class="bottle__glass">
          <div class="bottle__fill">
            <div class="bottle__amount">${formatMoney(getCategoryRemaining(category))}</div>
          </div>
        </div>
        <div class="bottle__name">${escapeHtml(category.name)}</div>
      </article>
    `;
  }).join("");

  if (DOM.recordHistoryList) {
    const records = [...state.records].slice(0, 12);
    DOM.recordHistoryList.innerHTML = records.length
      ? records.map((record) => renderRecordDetailRow(record)).join("")
      : `<div class="subcopy">邵ｺ・ｾ邵ｺ・ｰ髫ｪ蛟ｬ鮖ｸ邵ｺ蠕娯・邵ｺ繝ｻ・育ｸｲ繝ｻ/div>`;
    bindRecordActionButtons(DOM.recordHistoryList);
  }
}

function setCalendarMode(mode) {
  ui.calendarMode = mode;
  DOM.calendarViewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.calendarView === mode));
  renderCalendar();
}

function moveCalendarMonth(direction) {
  const current = ui.calendarMonth;
  current.setMonth(current.getMonth() + (direction === "next" ? 1 : -1));
  ui.calendarMonth = new Date(current);
  renderCalendar();
}

function selectCalendarWeek(index) {
  const dates = getMonthDates(ui.calendarMonth);
  const start = index * 7;
  const weekDates = dates.slice(start, start + 7).filter((date) => date.getMonth() === ui.calendarMonth.getMonth());
  const summary = getRecordsForRange(weekDates[0], weekDates[weekDates.length - 1]);
  ui.selectedDate = toDateKey(weekDates[0] || new Date());
  renderCalendarDetail(summary, "鬨ｾ・ｱ邵ｺ譁絶・邵ｺ・ｮ鬮ｮ繝ｻ・ｨ繝ｻ);
}

function renderCalendar() {
  const month = ui.calendarMonth;
  DOM.calendarMonthLabel.textContent = `${month.getFullYear()}陝ｷ・ｴ${month.getMonth() + 1}隴帙・;
  DOM.calendarViewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.calendarView === ui.calendarMode));
  const dates = getMonthDates(month);
  const todayKey = toDateKey(new Date());
  DOM.calendarGrid.innerHTML = dates.map((date) => {
    const key = toDateKey(date);
    const records = getRecordsForDate(key);
    const isCurrentMonth = date.getMonth() === month.getMonth();
    const isSelected = ui.selectedDate === key;
    const inRange = isDateInSelectedRange(key);
    const selectedClass = isSelected ? " is-selected" : "";
    const rangeClass = inRange && !isSelected ? " is-in-range" : "";
    return `
      <button type="button" class="calendar-cell${isCurrentMonth ? "" : " is-outside"}${selectedClass}${rangeClass}" data-calendar-date="${key}">
        <span class="calendar-cell__day">${date.getDate()}</span>
        <span class="calendar-cell__count">${records.length ? `${records.length}闔会ｽｶ` : ""}${key === todayKey ? " 闔蛾大ｾ・ : ""}</span>
      </button>
    `;
  }).join("");

  DOM.calendarGrid.querySelectorAll("[data-calendar-date]").forEach((button) => {
    button.addEventListener("pointerdown", handleCalendarPointerDown);
    button.addEventListener("pointerenter", handleCalendarPointerEnter);
    button.addEventListener("pointerup", handleCalendarPointerUp);
    button.addEventListener("click", () => {
      if (!ui.draggingRange) {
        ui.selectedDate = button.dataset.calendarDate;
        renderCalendarDetail(getRecordsForDate(ui.selectedDate), formatDateLabel(ui.selectedDate));
      }
    });
  });

  if (ui.calendarMode === "week") {
    const weekIndex = getWeekIndexForDate(ui.selectedDate);
    selectCalendarWeek(weekIndex);
  } else if (ui.calendarMode === "month") {
    const records = getRecordsForRange(
      `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`,
      `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()).padStart(2, "0")}`
    );
    renderCalendarDetail(records, "隴帑ｺ･繝ｻ闖ｴ阮吶・鬮ｮ繝ｻ・ｨ繝ｻ);
  } else if (DOM.rangeMode.checked && ui.selectedRangeStart && ui.selectedRangeEnd) {
    renderCalendarDetail(getRecordsForRange(ui.selectedRangeStart, ui.selectedRangeEnd), "驕ｽ繝ｻ蟲・ｸｺ・ｮ髫ｪ蛟ｬ鮖ｸ");
  } else {
    renderCalendarDetail(getRecordsForDate(ui.selectedDate), formatDateLabel(ui.selectedDate));
  }
}

function getWeekIndexForDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = first.getDay();
  return Math.floor((date.getDate() + offset - 1) / 7);
}

function isDateInSelectedRange(dateKey) {
  if (!ui.selectedRangeStart || !ui.selectedRangeEnd) {
    return false;
  }
  const start = new Date(`${ui.selectedRangeStart}T00:00:00`).getTime();
  const end = new Date(`${ui.selectedRangeEnd}T00:00:00`).getTime();
  const current = new Date(`${dateKey}T00:00:00`).getTime();
  return current >= Math.min(start, end) && current <= Math.max(start, end);
}

function handleCalendarPointerDown(event) {
  if (!DOM.rangeMode.checked) {
    return;
  }
  const button = event.currentTarget;
  ui.draggingRange = true;
  ui.selectedRangeStart = button.dataset.calendarDate;
  ui.selectedRangeEnd = button.dataset.calendarDate;
  renderCalendar();
}

function handleCalendarPointerEnter(event) {
  if (!ui.draggingRange || !DOM.rangeMode.checked) {
    return;
  }
  const button = event.currentTarget;
  ui.selectedRangeEnd = button.dataset.calendarDate;
  renderCalendar();
}

function handleCalendarPointerUp(event) {
  if (!DOM.rangeMode.checked) {
    return;
  }
  ui.draggingRange = false;
  const button = event.currentTarget;
  ui.selectedRangeEnd = button.dataset.calendarDate;
  renderCalendar();
}

function getRecordsForRange(startKey, endKey) {
  if (!startKey || !endKey) {
    return [];
  }
  const start = new Date(`${startKey}T00:00:00`).getTime();
  const end = new Date(`${endKey}T00:00:00`).getTime();
  return state.records.filter((record) => {
    const current = new Date(`${record.date}T00:00:00`).getTime();
    return current >= Math.min(start, end) && current <= Math.max(start, end);
  });
}

function renderCalendarDetail(records, label) {
  const total = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  DOM.calendarDetail.innerHTML = `
    <div class="section-head section-head--compact">
      <div>
        <p class="eyebrow">${escapeHtml(label)}</p>
        <h3>${records.length ? `${records.length}闔会ｽｶ / ${formatMoney(total)}` : "髫ｪ蛟ｬ鮖ｸ邵ｺ・ｪ邵ｺ繝ｻ}</h3>
      </div>
    </div>
    <div class="detail-list">
      ${records.length ? records.map((record) => renderRecordDetailRow(record)).join("") : `<div class="subcopy">邵ｺ阮吶・隴帶ｻ・ｿ｣邵ｺ・ｮ髫ｪ蛟ｬ鮖ｸ邵ｺ・ｯ邵ｺ・ｾ邵ｺ・ｰ邵ｺ・ｪ邵ｺ繝ｻ・育ｸｲ繝ｻ/div>`}
    </div>
  `;
  bindRecordActionButtons(DOM.calendarDetail);
}

function renderRecordDetailRow(record) {
  const category = getCategoryById(record.categoryId);
  return `
    <div class="detail-item">
      <div>
        <strong>${escapeHtml(formatDateLabel(record.date))}</strong>
        <div class="subcopy">${escapeHtml(category?.name || "")}${record.store ? ` / ${escapeHtml(record.store)}` : ""}</div>
      </div>
      <div>
        <strong>${formatMoney(record.amount)}</strong>
        <div class="home-actions">
          <button type="button" class="mini-button" data-edit-record="${escapeHtml(record.id)}">陞溽判蟲ｩ</button>
          <button type="button" class="mini-button" data-delete-record="${escapeHtml(record.id)}">陷台ｼ∝求</button>
        </div>
      </div>
    </div>
  `;
}

function renderSettings() {
  const config = getCurrentMonthConfig();
  DOM.monthlyBudget.value = config ? String(config.monthlyBudget || getMonthBudgetTotal()) : "0";
  DOM.saveReceipts.checked = Boolean(state.settings.receiptImageSaving);
  DOM.notifications.checked = Boolean(state.settings.notificationsEnabled);
  DOM.categoryEditor.innerHTML = getCurrentCategories().map((category) => `
    <div class="category-row" data-category-row="${escapeHtml(category.id)}">
      <input type="text" value="${escapeHtml(category.name)}" data-category-name="${escapeHtml(category.id)}" aria-label="郢ｧ・ｫ郢昴・縺也ｹ晢ｽｪ陷ｷ繝ｻ>
      <input type="number" min="0" step="1" value="${escapeHtml(category.budget)}" data-category-budget="${escapeHtml(category.id)}" aria-label="闔閧ｲ・ｮ繝ｻ>
      <input type="color" value="${escapeHtml(category.color)}" data-category-color="${escapeHtml(category.id)}" aria-label="豼ｶ・ｲ">
      <div class="category-row__actions">
        <button type="button" class="mini-button" data-category-delete="${escapeHtml(category.id)}">陷台ｼ∝求</button>
      </div>
    </div>
  `).join("");

  DOM.categoryEditor.querySelectorAll("[data-category-name]").forEach((input) => {
    input.addEventListener("input", updateCategoryRow);
  });
  DOM.categoryEditor.querySelectorAll("[data-category-budget]").forEach((input) => {
    input.addEventListener("input", updateCategoryRow);
  });
  DOM.categoryEditor.querySelectorAll("[data-category-color]").forEach((input) => {
    input.addEventListener("input", updateCategoryRow);
  });
  DOM.categoryEditor.querySelectorAll("[data-category-delete]").forEach((button) => {
    button.addEventListener("click", deleteCategory);
  });

}

function bindRecordActionButtons(container) {
  if (!container) {
    return;
  }

  container.querySelectorAll("[data-edit-record]").forEach((button) => {
    button.addEventListener("click", () => editRecordById(button.dataset.editRecord));
  });
  container.querySelectorAll("[data-delete-record]").forEach((button) => {
    button.addEventListener("click", () => deleteRecordById(button.dataset.deleteRecord));
  });
}

function handleBudgetSave(event) {
  event.preventDefault();
  const config = getCurrentMonthConfig() ?? createEmptyMonthConfig();
  config.monthlyBudget = Number(DOM.monthlyBudget.value || 0);
  state.settings.receiptImageSaving = DOM.saveReceipts.checked;
  state.settings.notificationsEnabled = DOM.notifications.checked;
  state.monthConfigs[ui.currentMonthKey] = config;
  saveState();
  renderRemainingToday();
}

function handleCategoryCreate(event) {
  event.preventDefault();
  const name = DOM.categoryName.value.trim();
  if (!name) {
    return;
  }
  const color = DOM.categoryColor.value;
  const config = getCurrentMonthConfig() ?? createEmptyMonthConfig();
  config.categories.push({
    id: uid(),
    name,
    budget: 0,
    color
  });
  state.monthConfigs[ui.currentMonthKey] = config;
  state.settings = { ...state.settings };
  saveState();
  DOM.categoryName.value = "";
  renderAll();
}

function updateCategoryRow(event) {
  const input = event.currentTarget;
  const categoryId = input.dataset.categoryName || input.dataset.categoryBudget || input.dataset.categoryColor;
  const config = getCurrentMonthConfig();
  if (!config) {
    return;
  }
  const category = config.categories.find((item) => item.id === categoryId);
  if (!category) {
    return;
  }
  if (input.dataset.categoryName) {
    category.name = input.value;
  } else if (input.dataset.categoryBudget) {
    category.budget = Number(input.value || 0);
  } else if (input.dataset.categoryColor) {
    category.color = input.value;
  }
  saveState();
  renderRemainingToday();
  renderDataPage();
  renderCalendar();
}

function deleteCategory(event) {
  const categoryId = event.currentTarget.dataset.categoryDelete;
  const config = getCurrentMonthConfig();
  if (!config) {
    return;
  }
  config.categories = config.categories.filter((category) => category.id !== categoryId);
  saveState();
  renderAll();
}

function editRecordById(recordId) {
  const record = state.records.find((item) => item.id === recordId);
  if (!record) {
    return;
  }
  startRecordFlow(record, "edit-select");
}

function deleteRecordById(recordId) {
  state.records = state.records.filter((item) => item.id !== recordId);
  saveState();
  renderAll();
}

function showTransientFormError(container, text) {
  const element = document.createElement("div");
  element.className = "error-text";
  element.textContent = text;
  container.appendChild(element);
  window.setTimeout(() => element.remove(), 1800);
}

function extractAmount(text) {
  const match = text.match(/([0-9]{2,6})\s*陷繝ｻ/);
  return match ? Number(match[1]) : 0;
}

function extractStoreName(text) {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return lines[0] ?? "";
}

function checkMonthRollover() {
  const currentKey = getMonthKey(new Date());
  if (currentKey === ui.currentMonthKey) {
    return;
  }
  ui.currentMonthKey = currentKey;
  ensureCurrentMonthConfig();
}

document.addEventListener("DOMContentLoaded", boot);

