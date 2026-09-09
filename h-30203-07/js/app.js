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

  var state = { slide: 0, revealed: 0 };
  var outputs = ['총 수량은 3 잔입니다.', '총 수량은_3_잔입니다.', '총 수량은 3 잔입니다. !확인'];
  function collectState() { return { slide: state.slide, revealed: state.revealed }; }
  function stateHasActivity() { return state.slide > 0 || state.revealed > 0; }
  function stateSolved() { return state.slide === 1 && state.revealed >= 3 ? 'all' : (stateHasActivity() ? 'partial' : ''); }
  function restoreState(saved) { state.slide=saved.slide===1?1:0; state.revealed=Math.max(0,Math.min(3,Number(saved.revealed)||0)); render(); }
  function resetState() { state={slide:0,revealed:0}; render(); }
  function render() {
    if (!app) return;
    var content;
    if (state.slide===0) {
      content='<div class="panel"><div class="bullet"><span class="dot"></span><span>표준 출력이란 프로그램에서 처리된 내용이 화면과 같은 기본 출력 장치를 통해 출력되는 것이다.</span></div><div class="bullet"><span class="dot"></span><span><strong>print()</strong> 함수는 괄호 안의 내용을 화면에 출력하는 함수이다.</span></div></div><div class="definition"><strong>정의</strong><code>print(\'출력할 내용\')</code></div>';
    } else {
      var out=outputs.slice(0,state.revealed).map(function(x){return '<div>'+x+'</div>';}).join('');
      content='<div class="codebox">print(<span class="str">\'총 수량은\'</span>, <span class="numlit">3</span>, <span class="str">\'잔입니다.\'</span>)\nprint(<span class="str">\'총 수량은\'</span>, <span class="numlit">3</span>, <span class="str">\'잔입니다.\'</span>, sep=<span class="str">\'_\'</span>)\nprint(<span class="str">\'총 수량은\'</span>, <span class="numlit">3</span>, <span class="str">\'잔입니다.\'</span>, end=<span class="str">\' !확인\'</span>)</div><div class="controls"><button class="btn btn-secondary" data-action="reset-run">초기화</button><button class="btn btn-primary" data-action="run" '+(state.revealed>=3?'disabled':'')+'>실행</button></div><div class="result"><div class="result-label">출력</div><div class="terminal">'+(out||'▶ 실행 버튼을 눌러 결과를 확인해 보세요')+'</div></div>';
    }
    app.innerHTML='<div class="shell"><div class="topbar"><div><div class="eyebrow">핵심 개념</div><div class="subtitle">1. 표준 입출력</div></div></div><div class="title-row"><span class="num">2</span><h1>표준 출력</h1></div>'+content+'<div class="nav"><button data-action="prev" '+(state.slide===0?'disabled':'')+'>‹</button><span class="slide-count">'+(state.slide+1)+' / 2</span><button data-action="next" '+(state.slide===1?'disabled':'')+'>›</button></div></div>';
    scheduleResize();
  }
  root.addEventListener('click',function(e){ if(!_inputEnabled)return; var b=e.target.closest('[data-action]'); if(!b)return; var a=b.getAttribute('data-action'); if(a==='prev')state.slide=0; if(a==='next')state.slide=1; if(a==='run')state.revealed=Math.min(3,state.revealed+1); if(a==='reset-run')state.revealed=0; render(); });

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
