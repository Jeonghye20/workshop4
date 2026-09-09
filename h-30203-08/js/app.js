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

  var state = { step: 0, commentOpen: false };
  function collectState(){ return { step:state.step, commentOpen:state.commentOpen }; }
  function stateHasActivity(){ return state.step>0 || state.commentOpen; }
  function stateSolved(){ return state.step>=2 ? 'all' : (stateHasActivity() ? 'partial' : ''); }
  function restoreState(saved){ state.step=Math.max(0,Math.min(2,Number(saved.step)||0)); state.commentOpen=!!saved.commentOpen; render(); }
  function resetState(){ state={step:0,commentOpen:false}; render(); }
  function render(){
    if(!app)return;
    var result='▶ 실행 버튼을 눌러 결과를 확인해 보세요';
    if(state.step>=1){ result='몇 잔 주문하겠습니까? <span class="orange">3</span>'+(state.step===1?' <button class="enter-btn" data-action="enter" aria-label="입력 실행"><img src="'+BASE+'assets/enter.png" alt="Enter"></button>':''); }
    if(state.step>=2){ result+='<br>3 잔의 총 금액은 9000 원입니다.<br>추가 주문하겠습니까?'; }
    app.innerHTML='<div class="shell"><div class="topbar"><div><div class="eyebrow">핵심 개념</div><div class="subtitle">1. 표준 입출력</div></div></div><div class="title-row"><span class="num">3</span><h1>표준 입출력을 활용한 프로그램</h1></div><div class="panel"><div class="bullet"><span class="dot"></span><span>표준 입출력 함수를 이용하면 사용자와 소통하는 프로그램을 만들 수 있다.</span></div></div><div class="codebox">price = <span class="numlit">3000</span>\namount = <span class="fn">input</span>(<span class="str">\'몇 잔 주문하겠습니까?\'</span>)\ntotal = price * <span class="fn">int</span>(amount)  <button class="blank" data-action="comment">#</button> '+(state.commentOpen?'<span class="comment">숫자 연산을 위한 자료형 변환</span>':'')+'\nprint(amount, <span class="str">\'잔의 총 금액은\'</span>, total, <span class="str">\'원입니다.\'</span>)\nprint(<span class="str">\'추가 주문하겠습니까?\'</span>)</div><div class="controls">'+(state.step>0?'<button class="btn btn-secondary" data-action="reset-run">초기화</button>':'')+'<button class="btn btn-primary" data-action="run" '+(state.step>0?'disabled':'')+'>실행</button></div><div class="result"><div class="result-label">출력</div><div class="terminal">'+result+'</div></div></div>';
    scheduleResize();
  }
  root.addEventListener('click',function(e){if(!_inputEnabled)return;var b=e.target.closest('[data-action]');if(!b)return;var a=b.getAttribute('data-action');if(a==='run')state.step=1;if(a==='enter')state.step=2;if(a==='comment')state.commentOpen=!state.commentOpen;if(a==='reset-run')state.step=0;render();});

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
