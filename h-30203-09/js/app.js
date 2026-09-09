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

  var state={ran:false,hintOpen:false};
  function collectState(){return {ran:state.ran,hintOpen:state.hintOpen};}
  function stateHasActivity(){return state.ran||state.hintOpen;}
  function stateSolved(){return state.ran ? 'all' : (stateHasActivity() ? 'partial' : '');}
  function restoreState(saved){state.ran=!!saved.ran;state.hintOpen=!!saved.hintOpen;render();}
  function resetState(){state={ran:false,hintOpen:false};render();}
  function render(){ if(!app)return; app.innerHTML='<div class="shell"><div class="topbar"><div><div class="eyebrow" style="color:#f97316">해결해 보기</div><div class="subtitle">환율 변환 프로그램 만들기</div></div></div><div class="activity-labels"><span>조사</span><span>탐구</span><span class="on">실습</span><span>토의</span><span>발표</span></div><div class="prompt">▶ 인터넷에서 환율을 확인해 보고, 미국의 달러($) 단위로 금액을 입력받았을 때 한국의 원(₩) 단위로 얼마에 해당하는지 알려 주는 프로그램을 만들어 보자.</div><div class="codebox">dollar = <span class="numlit">5</span>\nrate = <span class="numlit">1258</span>\nwon = dollar * rate\nprint(dollar, <span class="str">\'달러($)는\'</span>, won, <span class="str">\'원(₩)입니다.\'</span>)</div><div class="controls">'+(state.ran?'<button class="btn btn-secondary" data-action="reset-run">초기화</button>':'')+'<button class="btn btn-primary" data-action="run" '+(state.ran?'disabled':'')+'>실행</button></div><div class="result"><div class="result-label">실행 결과 예시 · 출력</div><div class="terminal">달러($) 단위의 숫자 입력: <span class="orange">5</span>'+ (state.ran?'<br>5 달러($)는 6290 원(₩)입니다.':'') +'</div></div><button class="hint-button" data-action="hint">'+(state.hintOpen?'도움말 닫기':'도움말 열기')+'</button>'+(state.hintOpen?'<div class="hint">원(₩) 단위로 입력을 받아 미국 달러($) 단위로 출력해 주는 프로그램도 만들어 봅시다.</div>':'')+'</div>'; scheduleResize(); }
  root.addEventListener('click',function(e){if(!_inputEnabled)return;var b=e.target.closest('[data-action]');if(!b)return;var a=b.getAttribute('data-action');if(a==='run')state.ran=true;if(a==='reset-run')state.ran=false;if(a==='hint')state.hintOpen=!state.hintOpen;render();});

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
