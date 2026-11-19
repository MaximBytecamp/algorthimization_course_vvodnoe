(() => {
  'use strict';

  document.querySelectorAll('[data-recognize22]').forEach(root => {
    const buttons = [...root.querySelectorAll('button[data-scenario]')];
    const panels = [...root.querySelectorAll('[data-scenario-panel]')];

    function selectScenario(scenario) {
      buttons.forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.scenario === scenario));
      });
      panels.forEach(panel => {
        panel.hidden = panel.dataset.scenarioPanel !== scenario;
      });
    }

    const initialPanel = panels.find(panel => !panel.hidden);
    selectScenario(initialPanel ? initialPanel.dataset.scenarioPanel : buttons[0]?.dataset.scenario);

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        selectScenario(button.dataset.scenario);
      });
    });
  });

  document.querySelectorAll('[data-ask22]').forEach(root => {
    const questions = [...root.querySelectorAll('.ask__qs button')];
    const facts = root.querySelector('.ask__facts');
    const log = root.querySelector('.ask__log');
    const counter = root.querySelector('.ask__count');
    const reset = root.querySelector('[data-ask-reset]');

    if (!reset) return;

    reset.addEventListener('click', () => {
      questions.forEach(button => {
        button.disabled = false;
      });
      facts?.replaceChildren();
      log?.replaceChildren();
      if (counter) counter.textContent = 'задано 0 из 6';
      questions[0]?.focus();
    });
  });
})();
