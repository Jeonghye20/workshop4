(function () {
  'use strict';
  var root = window.__AI_CONTENT_ROOT__ || document;
  var BASE = window.__AI_CONTENT_BASE__ || './';
  var app = root.getElementById('app');
  var _inputEnabled = true;
  var _muted = false;
  var _rafId = 0;

  function cleanup() {
    cancelAnimationFrame(_rafId);
  }
  if (window.__AI_CONTENT_DISPOSE__) window.__AI_CONTENT_DISPOSE__.push(cleanup);

  function notifyResize() {
    var host = root.host || root;
    host.dispatchEvent(new CustomEvent('embed-resize', {
      bubbles: true, composed: true,
      detail: { height: app ? app.scrollHeight : 0 }
    }));
  }

  function scheduleResize() {
    cancelAnimationFrame(_rafId);
    _rafId = requestAnimationFrame(notifyResize);
  }

  function setInputEnabled(enabled) {
    _inputEnabled = enabled;
    if (app) app.classList.toggle('is-disabled', !enabled);
  }

  var state = { slide: 0, infoOpen: false };
  function collectState() { return { slide: state.slide, infoOpen: state.infoOpen }; }
  function stateHasActivity() { return state.slide > 0 || state.infoOpen; }
  function stateSolved() { return state.slide === 1 ? 'all' : (stateHasActivity() ? 'partial' : ''); }
  function restoreState(saved) {
    state.slide = saved.slide === 1 ? 1 : 0;
    state.infoOpen = !!saved.infoOpen;
    render();
  }
  function resetState() { state = { slide: 0, infoOpen: false }; render(); }
  function render() {
    if (!app) return;
    var content = state.slide === 0
      ? '<div class="panel"><div class="bullet"><span class="dot"></span><span>표준 입력이란 사용자가 키보드와 같은 <span class="tooltip-wrap"><button class="info-btn" data-action="toggle-info">ⓘ 기본 입력 장치</button>' + (state.infoOpen ? '<span class="tooltip">사용자가 프로그램에 데이터를 입력하기 위해 가장 기본적으로 사용하는 하드웨어 장치를 말한다.</span>' : '') + '</span>를 이용하여 프로그램에 정보를 입력하는 것이다.</span></div><div class="bullet"><span class="dot"></span><span>표준 입력은 기본적으로 키보드 입력을 의미하지만 사용자의 편의를 위해 마우스, 터치스크린 등의 다양한 입력 방식을 지원한다.</span></div></div><div class="diagram"><img src="' + BASE + 'assets/input-flow.png" alt="키오스크의 입출력 흐름"></div>'
      : '<div class="panel"><div class="bullet"><span class="dot"></span><span>파이선에서는 표준 입력을 위한 함수로 <strong>input()</strong> 함수를 지원한다.</span></div><div class="bullet"><span class="dot"></span><span>괄호 안에 입력한 내용이 먼저 출력되고 사용자의 입력을 기다린다.</span></div><div class="bullet"><span class="dot"></span><span>사용자가 키보드로 입력한 정보는 지정된 변수에 저장된다.</span></div></div><div class="definition"><strong>정의</strong><code>변수명 = input(내용)</code></div>';
    app.innerHTML = '<div class="shell"><div class="topbar"><div><div class="eyebrow">핵심 개념</div><div class="subtitle">1. 표준 입출력</div></div><div class="muted-note">CMS 조작형 콘텐츠</div></div><div class="title-row"><span class="num">1</span><h1>표준 입력</h1></div>' + content + '<div class="nav"><button data-action="prev" ' + (state.slide===0?'disabled':'') + '>‹</button><span class="slide-count">' + (state.slide+1) + ' / 2</span><button data-action="next" ' + (state.slide===1?'disabled':'') + '>›</button></div></div>';
    scheduleResize();
  }
  root.addEventListener('click', function (e) {
    if (!_inputEnabled) return;
    var btn = e.target.closest('[data-action]'); if (!btn) return;
    var a = btn.getAttribute('data-action');
    if (a === 'prev') state.slide = Math.max(0, state.slide-1);
    if (a === 'next') state.slide = Math.min(1, state.slide+1);
    if (a === 'toggle-info') state.infoOpen = !state.infoOpen;
    render();
  });

  if (window.__AI_CONTENT_HOOKS__) {
    Object.assign(window.__AI_CONTENT_HOOKS__, {
      getUserInputs: function () {
        return [{ result: '', solved: (typeof stateSolved === 'function' ? stateSolved() : (stateHasActivity() ? 'partial' : '')), input: collectState() }];
      },
      setUserInputs: function (inputs) {
        var saved = inputs && inputs[0] && inputs[0].input;
        if (saved) restoreState(saved);
      },
      clearUserInputs: function () {
        setInputEnabled(true);
        resetState();
      },
      setMute: function () { _muted = true; },
      setUnMute: function () { _muted = false; },
      setDisableInput: function () { setInputEnabled(false); },
      setEnableInput: function () { setInputEnabled(true); }
    });
  }

  render();
})();
