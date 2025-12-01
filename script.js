// script.js

$(function () {
  // --- 1. 변수 및 상태 초기화 ---
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const resetBtn = document.getElementById("resetBtn");
  
  // Chess 객체 안전 초기화
  var game = null;
  try {
      if (typeof Chess !== 'undefined') {
          game = new Chess();
      }
  } catch (e) {
      console.warn("Chess 라이브러리(chess.min.js) 로드 실패: 체스판 로직은 비활성화됩니다.");
  }

  // 오프닝 페이지 & 게임 페이지 공통 DOM
  const openingModal = document.getElementById("openingModal");
  const modalCloseBtn = document.querySelector(".close-modal");

  // 게임 페이지 관련 변수
  var board = null;
  var $status = $("#status");
  var $pgnText = $("#pgn-text");
  var $openingName = $("#opening-name");
  
  // 오프닝 데이터 저장 변수 (현재 오프닝 정보를 저장)
  let currentOpening = null; 

  // 클릭 이동을 위한 상태 변수 (체스판 전용)
  var $board = $('#myBoard');
  var squareToHighlight = null; 
  var squareClass = 'square-55d63'; 

  // --- 2. 오프닝 데이터 ---
  const OPENINGS = [
    // 1. e4 e5 계열
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7", name: "Ruy Lopez: Closed", desc: "백이 중앙을 강력하게 통제하며 장기적인 전략적 우위를 점하려는 전통적인 오프닝입니다. 흑의 반격을 억제하며 천천히 압박합니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4", name: "Ruy Lopez: Open", desc: "흑이 백의 중앙 폰을 잡으며 적극적으로 기물을 전개하는 공격적인 라인입니다. 복잡한 전술 싸움이 일어납니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6", name: "Ruy Lopez: Berlin Defense", desc: "'베를린 장벽'이라 불리며, 매우 견고하고 무승부 비율이 높은 방어법입니다. 엔드게임 실력이 중요합니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5", name: "Ruy Lopez", desc: "가장 유명하고 분석이 많이 된 오프닝 중 하나입니다. 백이 비숍으로 흑의 나이트를 압박하며 주도권을 잡습니다." },
    
    // Italian Game
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3", name: "Giuoco Piano: Pianissimo", desc: "매우 조용하고 느린 전개를 선호하는 형태입니다. 중앙 폰을 바로 밀지 않고 기물을 안전하게 배치합니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4", name: "Giuoco Piano: Classical", desc: "백이 중앙을 강력하게 차지하려는 시도입니다. 흑이 정확하게 대응하지 않으면 순식간에 무너질 수 있습니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5", name: "Giuoco Piano", desc: "이탈리안 게임의 기본 형태로, 비숍을 c4에 배치해 흑의 약점인 f7 칸을 노립니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. d4", name: "Two Knights: Fried Liver", desc: "백이 나이트를 희생하여 흑의 킹을 중앙으로 끌어내는 매우 공격적이고 위험한 전술입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6", name: "Two Knights Defense", desc: "흑이 비숍 전개 대신 나이트를 꺼내 백의 e4 폰을 역공하는 공격적인 방어법입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4", name: "Italian Game", desc: "초보자부터 마스터까지 애용하는 오프닝입니다. 빠른 전개와 중앙 싸움이 특징입니다." },

    // Four Knights & Others (1. e4)
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Bb5 Bb4 5. O-O O-O", name: "Four Knights: Spanish", desc: "네 개의 나이트가 모두 나온 안정적인 형태입니다. 대칭적인 구조가 많아 무승부가 자주 나옵니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6", name: "Four Knights Game", desc: "안정적이고 견고한 게임을 원하는 플레이어에게 적합합니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4", name: "Scotch Game", desc: "백이 d4로 즉시 중앙을 엽니다. 흑의 e5 거점을 없애고 공간 우위를 가져가려 합니다." },
    { pgn: "1. e4 e5 2. f4 exf4 3. Nf3", name: "King's Gambit Accepted", desc: "낭만주의 체스의 대표작입니다. 백이 킹 쪽 폰을 희생하여 공격 라인을 엽니다. 매우 위험하고 화려합니다." },
    
    // Sicilian (1. e4)
    { pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", name: "Sicilian: Najdorf", desc: "시실리안 디펜스 중 가장 유명하고 복잡한 라인입니다. 바비 피셔와 카스파로프가 애용했습니다." },
    { pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6", name: "Sicilian: Dragon", desc: "흑의 비숍을 g7으로 피앙케토하여 대각선을 장악합니다. 서로 반대쪽 캐슬링 후 격렬한 공격이 이어집니다." },
    { pgn: "1. e4 c5", name: "Sicilian Defense", desc: "1.e4에 대한 가장 인기 있고 승률이 높은 흑의 대응입니다. 불균형한 포지션을 만들어 승부를 봅니다." },
    
    // French & Caro-Kann (1. e4)
    { pgn: "1. e4 e6 2. d4 d5", name: "French Defense", desc: "견고하지만 다소 수동적인 방어법입니다. 흑은 e6-d5 구조로 백의 중앙에 도전합니다." },
    { pgn: "1. e4 c6 2. d4 d5", name: "Caro-Kann Defense", desc: "매우 단단한 방어법입니다. 프렌치 디펜스와 비슷하지만 c8 비숍의 길이 막히지 않는 장점이 있습니다." },
    
    // 3. d4 Openings 계열
    { pgn: "1. d4 d5 2. c4 dxc4", name: "Queen's Gambit Accepted", desc: "흑이 폰을 잡지만 지키려 하지 않고 빠른 기물 전개에 집중하는 전략입니다." },
    { pgn: "1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. Nc3", name: "Queen's Gambit Declined", desc: "오래전부터 사용된 고전적인 방어법입니다. 흑이 중앙을 굳건히 지킵니다." },
    { pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7", name: "King's Indian Defense", desc: "흑이 중앙을 내어주고 나중에 킹 사이드 공격으로 반격하는 하이퍼모던 오프닝입니다." },
    { pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6", name: "Slav Defense", desc: "d5 폰을 c6 폰으로 지키며 견고한 진형을 구축합니다. 퀸즈 갬빗 디클라인드보다 비숍 활용이 쉽습니다." },
    { pgn: "1. d4", name: "Queen's Pawn Opening", desc: "1.e4보다 안전하고 전략적인 게임으로 이어지는 경우가 많습니다." },
    
    // 4. Others (Flank Openings)
    { pgn: "1. c4", name: "English Opening", desc: "백이 c4 폰을 먼저 밀어 중앙을 측면에서 통제합니다. 유연하고 전략적인 게임이 됩니다." },
    { pgn: "1. Nf3 d5 2. g3", name: "Réti Opening", desc: "중앙 폰을 밀지 않고 나이트와 피앙케토 비숍으로 중앙을 간접 통제합니다." },
    { pgn: "1. e4", name: "King's Pawn Opening (First Move Only)", desc: "가장 대중적인 첫수로 중앙 통제와 빠른 전개가 가능합니다." },
  ];

  // 필터링에 사용할 주요 첫 수 목록
  const FILTER_MOVES = ['All', '1. e4', '1. d4', '1. c4', '1. Nf3'];

  // 오프닝 목록을 표시할 DOM 요소 (오프닝 페이지 전용)
  const openingGrid = document.getElementById("opening-grid");
  const filterContainer = document.getElementById("filter-buttons-container");
  
  // --- 3. UI 이벤트 핸들러 및 모달 로직 (전 페이지 공통) ---
  
  // 사이드바 토글
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", function () {
      sidebar.classList.toggle("close");
      if(mainContent) mainContent.classList.toggle("shifted");
      // 보드 크기 조정 (사이드바 닫힘/열림에 따라)
      if (board) {
        setTimeout(function() {
          board.resize(); 
        }, 300); // CSS 애니메이션 시간을 고려하여 지연
      }
    });
  }

  // 모달 닫기
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
        if (openingModal) openingModal.style.display = 'none';
    });
  }

  // 모달 외부 클릭 시 닫기
  window.addEventListener('click', (event) => {
      if (event.target === openingModal) {
          if (openingModal) openingModal.style.display = 'none';
      }
  });

  // 오프닝 이름 클릭 시 모달 열기 (Index.html 페이지 전용)
  if ($openingName && $openingName.length) {
      $openingName.on('click', function() {
          // currentOpening이 null이 아니고, 유효한 오프닝 정보를 가지고 있을 때만 모달을 띄웁니다.
          if (currentOpening) {
              document.getElementById("modalTitle").textContent = currentOpening.name;
              document.getElementById("modalPgn").textContent = currentOpening.pgn;
              document.getElementById("modalDesc").textContent = currentOpening.desc ? currentOpening.desc : "설명 준비 중";
              if (openingModal) openingModal.style.display = "block";
          }
      });
  }


  // --- 4. 오프닝 페이지 로직 (opening.html 전용) ---

  // 오프닝 버튼 생성 함수
  function createOpeningButton(opening) {
      const btn = document.createElement('button');
      btn.className = 'opening-btn';
      btn.textContent = opening.name;
      btn.addEventListener('click', () => {
          // 모달 정보 업데이트
          document.getElementById("modalTitle").textContent = opening.name;
          document.getElementById("modalPgn").textContent = opening.pgn;
          document.getElementById("modalDesc").textContent = opening.desc ? opening.desc : "설명 준비 중";
          if (openingModal) openingModal.style.display = "block";
      });
      return btn;
  }

  // 선택된 필터에 따라 오프닝 목록을 렌더링하는 함수 (오프닝 페이지 전용)
  function renderOpenings(filterMove) {
      if (!openingGrid) return;

      openingGrid.innerHTML = '';

      const filteredOpenings = OPENINGS.filter(opening => {
          if (!opening.pgn || opening.name === "아직 오프닝이 아닙니다.") return false;
          
          if (filterMove === 'All') return true;
          
          // 오프닝 PGN이 필터링할 첫 수로 시작하는지 확인
          return opening.pgn.startsWith(filterMove);
      });

      if (filteredOpenings.length === 0) {
          const p = document.createElement('p');
          p.textContent = `"${filterMove.replace('1. ', '')}"(으)로 시작하는 오프닝이 없습니다.`;
          openingGrid.appendChild(p);
      } else {
          filteredOpenings.forEach(opening => {
              const btn = createOpeningButton(opening);
              openingGrid.appendChild(btn);
          });
      }

      // 필터 버튼 활성화 상태 업데이트
      document.querySelectorAll('.filter-btn').forEach(button => {
          button.classList.remove('active');
          if (button.getAttribute('data-filter') === filterMove) {
              button.classList.add('active');
          }
      });
  }

  // 필터 버튼을 생성하고 이벤트를 연결하는 함수 (오프닝 페이지 전용)
  function setupOpeningFilters() {
      if (!filterContainer) return;
      
      FILTER_MOVES.forEach(move => {
          const btn = document.createElement('button');
          btn.className = 'filter-btn';
          btn.textContent = move === 'All' ? '전체' : move;
          btn.setAttribute('data-filter', move);
          
          btn.addEventListener('click', function() {
              renderOpenings(move);
          });
          
          filterContainer.appendChild(btn);
      });

      // 초기 렌더링
      renderOpenings('All');
  }

  // 오프닝 페이지에 있다면 필터와 목록을 설정합니다.
  if (openingGrid && filterContainer) {
      setupOpeningFilters();
  }


  // --- 5. 체스 게임 로직 (index.html 전용) ---

  // 이동할 수 있는 칸에 하이라이트 표시
  function highlightMoves (source, moves) {
    if (moves.length === 0) return;
    
    // 현재 선택한 칸 하이라이트 (노란색)
    $board.find('.' + squareClass).removeClass('highlight-square');
    $board.find('.square-' + source).addClass('highlight-square-selected');
    
    // 이동 가능한 칸 하이라이트 (초록색)
    for (var i = 0; i < moves.length; i++) {
        var targetSquare = moves[i].to;
        $board.find('.square-' + targetSquare).addClass('highlight-square-move');
    }
  }

  // 하이라이트 제거
  function removeHighlights () {
    $board.find('.highlight-square-selected').removeClass('highlight-square-selected')
    $board.find('.highlight-square-move').removeClass('highlight-square-move')
  }

  // 체스 기물이 움직이기 전에 처리 (유효성 검사)
  function onDragStart (source, piece, position, orientation) {
    // 게임 종료 시, 혹은 백/흑 차례가 아닌 기물을 잡을 경우 이동 방지
    if (game.game_over() ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
  }

  // 기물 드롭 시 처리
  function onDrop (source, target) {
    // 이동 시도
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // 폰 승급 시 항상 퀸으로 가정
    })

    // 불법적인 이동인 경우 snapback
    if (move === null) return 'snapback'

    updateStatus()
    updatePgn()
    updateOpening() // 오프닝 업데이트
  }

  // 클릭으로 이동 처리
  function onSquareClick (square) {
      var $target = $board.find('.square-' + square);
      var piece = game.get(square);
      
      // 1. 현재 기물 선택 (혹은 다른 기물 선택)
      if (piece && piece.color === game.turn()) {
          removeHighlights();
          squareToHighlight = square;
          var moves = game.moves({
              square: square,
              verbose: true
          });
          highlightMoves(square, moves);
          return;
      }

      // 2. 이전에 선택된 기물이 있고, 현재 칸이 이동 가능한 칸일 때 이동 실행
      if (squareToHighlight !== null) {
          var move = game.move({
              from: squareToHighlight,
              to: square,
              promotion: 'q' // 폰 승급 시 항상 퀸으로 가정
          });

          // 합법적인 이동인 경우
          if (move !== null) {
              board.position(game.fen());
              squareToHighlight = null;
              removeHighlights();
              updateStatus();
              updatePgn();
              updateOpening(); // 오프닝 업데이트
              return;
          }
      }

      // 3. 선택 해제
      squareToHighlight = null;
      removeHighlights();
  }


  // 보드 상태 업데이트
  function updateStatus () {
    var status = ''
    var moveColor = '백'
    if (game.turn() === 'b') {
      moveColor = '흑'
    }

    // 체크메이트 확인
    if (game.in_checkmate()) {
      status = '게임 종료, ' + moveColor + ' 체크메이트 패배.'
    }
    // 스테일메이트 (무승부) 확인
    else if (game.in_draw()) {
      status = '게임 종료, 무승부 (Draw).'
    }
    // 체크 확인
    else if (game.in_check()) {
      status = moveColor + ' 차례, 체크! (Check!)'
    }
    // 게임 진행 중
    else {
      status = moveColor + ' 차례'
    }
    $status.html(status)
  }

  // PGN 업데이트
  function updatePgn() {
    var pgn = game.pgn();
    // 줄 바꿈을 포함하여 보기 좋게 포맷 (1. e4 e5 2. Nf3 Nc6 -> 1. e4 e5\n2. Nf3 Nc6)
    var normalizedPgn = pgn.replace(/\s+/g, ' ');
    var formattedPgn = normalizedPgn.replace(/ (\d+\.)/g, '\n$1').trim();
    $pgnText.text(formattedPgn);
  }

  // 💡 오프닝 업데이트 함수 (수정된 로직)
  function updateOpening() {
      const history = game.history();
      let currentPgn = "";

      // 1. 현재 게임 기록을 "1. e4 e5 2. Nf3 Nc6 ..." 형식의 문자열로 변환
      for (let i = 0; i < history.length; i++) {
          // 백의 차례(짝수 인덱스 0, 2...)일 때 앞에 번호 붙임
          if (i % 2 === 0) {
              currentPgn += (Math.floor(i / 2) + 1) + ". ";
          }
          currentPgn += history[i] + " ";
      }
      currentPgn = currentPgn.trim(); // 마지막 공백 제거

      let bestMatch = null;
      
      // 2. 변환된 PGN 문자열과 오프닝 데이터 비교
      // 가장 긴 PGN을 가진 오프닝부터 찾습니다 (더 구체적인 오프닝 우선)
      const sortedOpenings = OPENINGS.sort((a, b) => b.pgn.length - a.pgn.length);

      for (const opening of sortedOpenings) {
          // startsWith를 사용하여 현재 진행된 수순이 오프닝 데이터와 일치하는지 확인
          if (currentPgn.startsWith(opening.pgn)) {
              bestMatch = opening;
              break; // 가장 긴(상세한) 일치 항목을 찾으면 중단
          }
      }

      if (bestMatch) {
          currentOpening = bestMatch;
          $openingName.text(currentOpening.name);
      } else {
          currentOpening = null;
          $openingName.text('아직 오프닝이 아닙니다.');
      }

      // 오프닝 이름에 클릭 가능 클래스 추가/제거 (모달을 띄울 수 있도록)
      if (currentOpening) {
          $openingName.addClass('clickable-opening-name');
      } else {
          $openingName.removeClass('clickable-opening-name');
      }
  }


  // 게임 리셋 버튼 이벤트
  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }

  // 게임 리셋
  function resetGame() {
    game.reset();
    board.position(game.fen());
    updateStatus();
    updatePgn();
    updateOpening();
    removeHighlights();
    squareToHighlight = null;
  }

  // 보드 초기화 및 리사이즈 로직
  function initBoard() {
    
    var boardConfig = {
      draggable: true,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: updatePgn,
      onSquareClick: onSquareClick // 클릭 이동 활성화
    }
    
    // #myBoard 요소가 존재하는 경우에만 보드를 초기화
    if ($board.length) {
        board = Chessboard('myBoard', boardConfig);
        $(window).resize(board.resize); // 윈도우 크기 변경 시 보드 크기 조정
        updateStatus();
        updatePgn();
        updateOpening();
    }
  }
  
  // DOM이 로드된 후 체스보드 초기화 (index.html에서만)
  if ($board.length) {
    initBoard();
  }


  // --- 6. TOC (목차) 로직 (규칙, 용어 페이지 전용) ---
  
  // 목차를 생성하는 함수
  function createTOC() {
      const tocList = document.getElementById('toc-list');
      const contentWrapper = document.querySelector('.rules-content-wrapper'); // 규칙/용어 내용 컨테이너

      if (!tocList || !contentWrapper) return; // 목차 요소가 없으면 실행하지 않음

      // h2, h3 제목 태그들을 찾습니다.
      const headers = contentWrapper.querySelectorAll('h2, h3');

      headers.forEach((header, index) => {
          // 1. ID 할당 (목차 링크의 타겟)
          if (!header.id) {
              // 한글 텍스트도 ID에 포함되도록 허용하고 공백을 하이픈으로 대체
              const safeText = header.textContent.trim().replace(/[^a-z0-9가-힣]+/gi, '-');
              header.id = `section-${safeText}-${index}`;
          }
          
          // 2. 목차 항목 생성
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          
          link.textContent = header.textContent.trim();
          link.href = `#${header.id}`;
          
          // 3. 클래스 추가 (h2/h3 레벨 구분)
          if (header.tagName === 'H3') {
              listItem.classList.add('h3-level');
          }
          
          // 4. 스크롤 이벤트 연결 (앵커 태그 기본 동작 방지 및 부드러운 스크롤 적용)
          $(link).on('click', function(e) {
              e.preventDefault(); // 기본 앵커 동작 방지
              const targetId = $(this).attr('href');
              
              // 스크롤 시 상단 여백 (fixed/sticky 헤더가 있을 경우를 고려하여 60px 설정)
              const scrollOffset = 60; 
              
              $('html, body').animate({
                  scrollTop: $(targetId).offset().top - scrollOffset
              }, 500); // 500ms 동안 부드럽게 스크롤
          });

          listItem.appendChild(link);
          tocList.appendChild(listItem);
      });
  }

  // 규칙 및 용어 페이지에만 목차 생성 함수를 실행합니다.
  if (document.getElementById('toc-list')) {
      createTOC();
  }

});
