(function () {
  'use strict';

  var root = window.__AI_CONTENT_ROOT__ || document;
  var BASE = window.__AI_CONTENT_BASE__ || './';

  var app = root.getElementById('app');

  // ================================================================
  // 상수
  // ================================================================
  var COLS = ['농부', '늑대', '염소', '양배추'];

  // ②번 정답
  var Q2_INIT_ANS = [0, 0, 0, 0];
  var Q2_GOAL_ANS = [1, 1, 1, 1];

  // ③번 정답
  var Q3_ANSWERS = [
    [0, 0, 0, 0],
    [1, 0, 1, 0],
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 1, 0, 0],
    [1, 1, 0, 1],
    [0, 1, 0, 1],
    [1, 1, 1, 1]
  ];

  // ③번 고정 셀 (농부 열 일부)
  var Q3_FIXED = [
    [true,  false, false, false],
    [true,  false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [true,  false, false, false]
  ];

  // ③번 그리드 위치 (원본 1316×626 기준 %)
  // 이미지 원본: 2632×1252, 표시: 1316×626 (절반)
  var Q3_ROW_TOPS  = [11.82, 22.84, 33.87, 44.89, 55.91, 66.93, 77.96, 88.98];
  var Q3_COL_LEFTS = [16.19, 36.76, 57.33, 77.91];
  var Q3_CELL_W    = 20.57;
  var Q3_CELL_H    = 11.02;

  // ③번 레이블 위치 (원본 1316×626 기준 %)
  var Q3_COL_LABEL_TOPS  = [2.24, 2.24, 2.24, 2.24];
  var Q3_COL_LABEL_LEFTS = [22.0, 42.5, 63.2, 83.8];
  var Q3_ROW_LABEL_LEFTS = 1.37;
  var Q3_ROW_LABEL_TOPS  = [13.42, 51.12, 89.14];
  var Q3_ROW_LABELS      = ['초기 상태', '현재 상태', '목표 상태'];

  // ②번 그리드 위치 (원본 620×243 기준 %)
  // 이미지 원본: 1240×486, 표시: 620×243 (절반)
  var Q2_INPUT_TOP   = 73.3;
  var Q2_INPUT_H     = 23.0;
  var Q2_COL_LEFTS   = [15.3, 36.4, 57.4, 78.5];
  var Q2_INPUT_W     = 19.4;
  var Q2_NAME_TOP    = 50.6;
  var Q2_NAME_LEFTS  = [14.5, 35.6, 56.8, 78.1];
  var Q2_NAME_W      = 21.0;

  // ================================================================
  // 상태
  // ================================================================
  var _q1text  = '';
  var _q2init  = [null, null, null, null];
  var _q2goal  = [null, null, null, null];
  var _q3cells = makeQ3Cells();
  var _graded  = false;
  var _warning = false;
  var _warnTimer    = 0;
  var _inputEnabled = true;

  function makeQ3Cells() {
    var a = [];
    for (var i = 0; i < 8; i++) a.push([null, null, null, null]);
    return a;
  }

  // ================================================================
  // [필수] 정리 함수
  // ================================================================
  function cleanup() {
    clearTimeout(_warnTimer);
    window.removeEventListener('resize', onResize);
  }
  if (window.__AI_CONTENT_DISPOSE__) window.__AI_CONTENT_DISPOSE__.push(cleanup);

  // ================================================================
  // [연동] 뷰어 훅
  // ================================================================
  function collectState() {
    return {
      q1: _q1text,
      q2init: _q2init.slice(),
      q2goal: _q2goal.slice(),
      q3: JSON.parse(JSON.stringify(_q3cells)),
      graded: _graded
    };
  }

  function restoreState(saved) {
    if (!saved) return;
    _q1text  = saved.q1 || '';
    _q2init  = saved.q2init ? saved.q2init.slice() : [null, null, null, null];
    _q2goal  = saved.q2goal ? saved.q2goal.slice() : [null, null, null, null];
    _q3cells = saved.q3 ? JSON.parse(JSON.stringify(saved.q3)) : makeQ3Cells();
    _graded  = !!saved.graded;
    render();
  }

  function resetState() {
    _q1text  = '';
    _q2init  = [null, null, null, null];
    _q2goal  = [null, null, null, null];
    _q3cells = makeQ3Cells();
    _graded  = false;
    _warning = false;
    _inputEnabled = true;
    render();
  }

  function isQ2Correct() {
    for (var i = 0; i < 4; i++) {
      if (_q2init[i] === null || +_q2init[i] !== Q2_INIT_ANS[i]) return false;
      if (_q2goal[i] === null || +_q2goal[i] !== Q2_GOAL_ANS[i]) return false;
    }
    return true;
  }

  function isQ3Correct() {
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 4; c++) {
        if (!Q3_FIXED[r][c] && (_q3cells[r][c] === null || +_q3cells[r][c] !== Q3_ANSWERS[r][c])) return false;
      }
    }
    return true;
  }

  function allCorrect() { return isQ2Correct() && isQ3Correct(); }

  function isQ2Filled() {
    for (var i = 0; i < 4; i++) {
      if (_q2init[i] === null || _q2goal[i] === null) return false;
    }
    return true;
  }

  function isQ3Filled() {
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 4; c++) {
        if (!Q3_FIXED[r][c] && _q3cells[r][c] === null) return false;
      }
    }
    return true;
  }

  if (window.__AI_CONTENT_HOOKS__) {
    Object.assign(window.__AI_CONTENT_HOOKS__, {
      getUserInputs: function () {
        return [{
          result: _graded ? (allCorrect() ? 'y' : 'n') : '',
          solved: _graded ? 'all' : ((isQ2Filled() && isQ3Filled()) ? 'partial' : ''),
          input:  collectState()
        }];
      },
      setUserInputs: function (inputs) {
        var saved = inputs && inputs[0] && inputs[0].input;
        if (saved) restoreState(saved);
      },
      clearUserInputs: resetState,
      setMute:         function () {},
      setUnMute:       function () {},
      setDisableInput: function () { _inputEnabled = false; applyLock(); },
      setEnableInput:  function () { _inputEnabled = true;  applyLock(); }
    });
  }

  function applyLock() {
    if (app) app.style.pointerEvents = _inputEnabled ? '' : 'none';
  }

  // ================================================================
  // 렌더링
  // ================================================================

  function pct(top, left, w, h) {
    return 'position:absolute;top:' + top + '%;left:' + left + '%;width:' + w + '%;height:' + h + '%;';
  }

  function renderHeader() {
    return '<div class="c-header">'
         +   '<div class="c-header-left">'
         +     '<span class="badge-haebogi">해 보기</span>'
         +     '<span class="c-subtitle">문제의 상태 표현과 구조화하기</span>'
         +   '</div>'
         +   '<div class="c-header-right">'
         +     '<span class="badge-탐구">탐구</span>'
         +     '<span class="badge-개별">개별</span>'
         +   '</div>'
         + '</div>'
         + '<h3 class="section-instruct">'
         +   '<span class="bul-robot"></span>'
         +   '다음을 읽고, 물음에 답해 보자.'
         + '</h3>';
  }

  function renderPassage() {
    return '<div class="passage-wrap">'
         +   '<img src="' + BASE + 'assets/it_m_30101_12_bg.png" class="passage-bg" alt="강 건너기 문제">'
         +   '<p class="passage-text">'
         +     '농부가 늑대, 염소, 양배추를 배에 싣고 강을 건너려고 한다.<br>'
         +     '배에는 농부 외에 한 가지만 더 실을 수 있다. 그런데 양배추를<br>'
         +     '싣고 염소와 늑대를 남겨 두면 늑대가 염소를 잡아먹는다. 또<br>'
         +     '늑대를 싣고 염소와 양배추를 남겨 두면 염소가 양배추를 먹어<br>'
         +     '버린다. 이러한 상황에서 모두 안전하게 강을 건너야 한다.'
         +   '</p>'
         + '</div>';
  }

  function renderQ1() {
    return '<div class="q-block">'
         +   '<p class="q-title"><span class="q-num">❶</span> 강 건너기 문제의 조건을 써 보자.</p>'
         +   '<div class="q1-given-wrap">'
         +     '<span class="q1-tag">조건</span>'
         +     '<span class="q1-given-text">농부는 혼자 이동 가능하지만 늑대, 양배추, 염소는 반드시 사람과 함께 이동해야 한다.</span>'
         +   '</div>'
         +   '<div class="q1-input-wrap">'
         +     '<div class="q1-example">'
         +       '<span class="q1-ex-label">예</span>'
         +       '<span class="q1-ex-text">늑대와 염소는 한 장소에 있을 수 없다.</span>'
         +     '</div>'
         +     '<div class="q1-field">'
         +       '<textarea class="q1-input" rows="2" placeholder="또 다른 조건을 써 보세요." '
         +         + (_graded ? 'readonly ' : '') + '></textarea>'
         +     '</div>'
         +   '</div>'
         + '</div>';
  }

  function renderQ2Group(group, imgFile, stateLabel) {
    var arr = group === 'init' ? _q2init : _q2goal;
    var ans = group === 'init' ? Q2_INIT_ANS : Q2_GOAL_ANS;

    var h = '<div class="q2-group-wrap">';
    // 이미지 (이미지가 컨테이너 높이를 결정)
    h += '<img src="' + BASE + 'assets/' + imgFile + '" class="q2-bg" alt="' + stateLabel + '">';

    // 상태 레이블 (말풍선 위에)
    h += '<div class="q2-state-label">' + stateLabel + '</div>';

    // 캐릭터 이름
    for (var i = 0; i < 4; i++) {
      h += '<div class="q2-char-name" style="' + pct(Q2_NAME_TOP, Q2_NAME_LEFTS[i], Q2_NAME_W, 12) + '">'
         +   COLS[i]
         + '</div>';
    }

    // 입력 칸 4개
    for (var j = 0; j < 4; j++) {
      var val = arr[j];
      var cls = 'q2-cell';
      if (_graded) {
        cls += (val !== null && +val === ans[j]) ? ' cell-correct' : ' cell-wrong';
      }
      h += '<div class="' + cls + '" data-action="q2cycle" data-group="' + group + '" data-idx="' + j + '" '
         +   'style="' + pct(Q2_INPUT_TOP, Q2_COL_LEFTS[j], Q2_INPUT_W, Q2_INPUT_H) + '">'
         +   (val === null ? '<span class="pencil">✏</span>' : '<span class="cell-val">' + val + '</span>')
         + '</div>';
    }

    h += '</div>';
    return h;
  }

  function renderQ2() {
    return '<div class="q-block">'
         +   '<p class="q-title"><span class="q-num">❷</span> 문제의 상태를 수행 가능한 상태로 구조화하여 나타내 보자.'
         +     '<span class="q-note">(단, 강을 건너기 전 출발 위치를 0, 강을 건넌 후 도착 위치를 1이라고 한다.)</span>'
         +   '</p>'
         +   '<div class="q2-pair">'
         +     renderQ2Group('init', 'left-list1.png', '초기\n상태')
         +     renderQ2Group('goal', 'left-list-2.png', '목표\n상태')
         +   '</div>'
         + '</div>';
  }

  function renderQ3() {
    var h = '<div class="q-block">'
          +   '<p class="q-title"><span class="q-num">❸</span> ❷에서 구조화한 상태를 이용하여 초기 상태에서 목표 상태에 도달하는 현재 상태의 단계를 나타내 보자.</p>'
          +   '<div class="q3-img-wrap">'
          +     '<img src="' + BASE + 'assets/it_m_30101_12_2.png" class="q3-bg" alt="상태 단계 표">';

    // 열 이름 레이블
    for (var c = 0; c < 4; c++) {
      h += '<div class="q3-col-label" style="' + pct(Q3_COL_LABEL_TOPS[c], Q3_COL_LABEL_LEFTS[c], 12, 8) + '">' + COLS[c] + '</div>';
    }

    // 행 구분 레이블
    for (var s = 0; s < 3; s++) {
      h += '<div class="q3-row-label" style="' + pct(Q3_ROW_LABEL_TOPS[s], Q3_ROW_LABEL_LEFTS, 13, 10) + '">'
         +   Q3_ROW_LABELS[s]
         + '</div>';
    }

    // 8행 × 4열 셀
    for (var r = 0; r < 8; r++) {
      for (var col = 0; col < 4; col++) {
        var style = pct(Q3_ROW_TOPS[r], Q3_COL_LEFTS[col], Q3_CELL_W, Q3_CELL_H);
        if (Q3_FIXED[r][col]) {
          h += '<div class="q3-cell-fixed" style="' + style + '">'
             +   '<span class="ex-label">예</span>' + Q3_ANSWERS[r][col]
             + '</div>';
        } else {
          var val  = _q3cells[r][col];
          var tdCls = 'q3-cell';
          if (_graded) {
            tdCls += (val !== null && +val === Q3_ANSWERS[r][col]) ? ' cell-correct' : ' cell-wrong';
          } else if (_warning && val === null) {
            tdCls += ' cell-warn';
          }
          h += '<div class="' + tdCls + '" data-action="q3cycle" data-r="' + r + '" data-c="' + col + '" style="' + style + '">'
             +   (val === null ? '<span class="pencil">✏</span>' : '<span class="cell-val">' + val + '</span>')
             + '</div>';
        }
      }
    }

    h += '</div></div>';
    return h;
  }

  function render() {
    var h = renderHeader()
          + renderPassage()
          + renderQ1()
          + renderQ2()
          + renderQ3();

    h += '<div class="c-warning">' + (_warning ? '✗ ②와 ③의 빈 칸을 모두 채워 주세요.' : '') + '</div>';

    if (_graded) {
      var ok = allCorrect();
      h += '<div class="c-result ' + (ok ? 'c-result-ok' : 'c-result-no') + '">'
         +   (ok ? '정답입니다! 🎉' : '틀린 칸이 있어요. 다시 확인해 보세요.')
         + '</div>';
    }

    h += '<div class="c-btn-wrap">';
    h += _graded
       ? '<button class="c-btn c-btn-reset" data-action="reset">↺ 다시 풀기</button>'
       : '<button class="c-btn c-btn-submit" data-action="submit">제출하기 ▶</button>';
    h += '</div>';

    if (app) app.innerHTML = h;

    var ta = root.querySelector('.q1-input');
    if (ta) ta.value = _q1text;

    notifyResize();
  }

  // ================================================================
  // 이벤트 위임
  // ================================================================
  root.addEventListener('input', function (e) {
    var ta = e.target.closest('.q1-input');
    if (ta) _q1text = ta.value;
  });

  root.addEventListener('click', function (e) {
    if (!_inputEnabled) return;
    var el = e.target.closest('[data-action]');
    if (!el) return;

    var action = el.dataset.action;

    if (action === 'q2cycle' && !_graded) {
      var grp = el.dataset.group;
      var idx = +el.dataset.idx;
      var arr = grp === 'init' ? _q2init : _q2goal;
      arr[idx] = arr[idx] === null ? '0' : (arr[idx] === '0' ? '1' : null);
      if (_warning) { _warning = false; clearTimeout(_warnTimer); }
      render();

    } else if (action === 'q3cycle' && !_graded) {
      var r = +el.dataset.r;
      var c = +el.dataset.c;
      _q3cells[r][c] = _q3cells[r][c] === null ? '0' : (_q3cells[r][c] === '0' ? '1' : null);
      if (_warning) { _warning = false; clearTimeout(_warnTimer); }
      render();

    } else if (action === 'submit') {
      if (!isQ2Filled() || !isQ3Filled()) {
        _warning = true;
        render();
        clearTimeout(_warnTimer);
        _warnTimer = setTimeout(function () { _warning = false; render(); }, 2500);
        return;
      }
      _graded = true;
      render();
      notifyScore(allCorrect() ? 100 : 0);

    } else if (action === 'reset') {
      resetState();
    }
  });

  // ================================================================
  // EventBridge
  // ================================================================
  function notifyScore(score) {
    var host = root.host || root;
    host.dispatchEvent(new CustomEvent('embed-score', {
      bubbles: true, composed: true,
      detail: { score: score, solved: 'all' }
    }));
  }

  function notifyResize() {
    var host = root.host || root;
    host.dispatchEvent(new CustomEvent('embed-resize', {
      bubbles: true, composed: true,
      detail: { height: app ? app.scrollHeight : 0 }
    }));
  }

  function onResize() { notifyResize(); }
  window.addEventListener('resize', onResize);

  // ================================================================
  // 진입점
  // ================================================================
  render();

  void BASE;
})();
