// script.js

$(function () {
  // --- 1. 변수 및 상태 초기화 ---
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const resetBtn = document.getElementById("resetBtn");
  
  // Chess 객체 안전 초기화 (라이브러리가 없거나, 이 페이지가 아니어도 오류 방지)
  var game = null;
  try {
      if (typeof Chess !== 'undefined') {
          game = new Chess();
      }
  } catch (e) {
      console.warn("Chess 라이브러리(chess.min.js) 로드 실패: 체스판 로직은 비활성화됩니다.");
  }

  // 오프닝 페이지 관련 DOM 요소
  const openingGrid = document.getElementById("opening-grid");
  const filterContainer = document.getElementById("filter-buttons-container");
  const openingModal = document.getElementById("openingModal");
  const modalCloseBtn = document.querySelector(".close-modal");

  var board = null;
  var $status = $("#status");
  var $pgnText = $("#pgn-text");
  var $openingName = $("#opening-name");
  
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

  // --- 3. 오프닝 페이지 관련 핵심 로직 (필터링 및 렌더링) ---

  // 오프닝 버튼 생성 및 모달 이벤트 연결
  function createOpeningButton(opening) {
      const btn = document.createElement("button");
      btn.className = "opening-btn";
      btn.textContent = opening.name;
      
      btn.addEventListener("click", () => {
          document.getElementById("modalTitle").textContent = opening.name;
          document.getElementById("modalPgn").textContent = opening.pgn;
          document.getElementById("modalDesc").textContent = opening.desc ? opening.desc : "설명 준비 중";
          openingModal.style.display = "block";
      });

      return btn;
  }
  
  // 선택된 필터에 따라 오프닝 목록을 렌더링하는 함수
  function renderOpenings(filterMove) {
      if (!openingGrid) return;

      // 1. 기존 목록 비우기
      openingGrid.innerHTML = '';
      
      // 2. 필터링
      const filteredOpenings = OPENINGS.filter(opening => {
          if (!opening.pgn || opening.name === "아직 오프닝이 아닙니다.") return false;

          // 'All' 필터는 모든 항목을 통과시킴
          if (filterMove === 'All') return true;

          // PGN이 필터링할 첫 수로 시작하는지 확인
          // 1. e4, 1. d4, 1. c4, 1. Nf3 등 정확한 첫 수 비교
          return opening.pgn.startsWith(filterMove);
      });

      // 3. 렌더링
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
      
      // 4. 필터 버튼 상태 업데이트 (Active 클래스 토글)
      document.querySelectorAll('.filter-btn').forEach(button => {
          button.classList.remove('active');
          if (button.getAttribute('data-filter') === filterMove) {
              button.classList.add('active');
          }
      });
  }

  // 필터 버튼을 생성하고 이벤트를 연결하는 함수
  function createFilterButtons() {
      if (!filterContainer) return;

      FILTER_MOVES.forEach(move => {
          const btn = document.createElement('button');
          btn.className = 'filter-btn';
          // '1. e4' -> 'e4'로 표시, 'All' -> '전체보기'로 표시
          btn.textContent = move === 'All' ? '전체보기' : move.replace('1. ', '');
          
          btn.setAttribute('data-filter', move);
          
          btn.addEventListener('click', () => {
              renderOpenings(move);
          });
          
          filterContainer.appendChild(btn);
      });
  }

  // 오프닝 페이지 로드 시 초기화
  if (openingGrid) {
      createFilterButtons();
      renderOpenings('All'); // 초기에는 '전체보기' 목록 표시
  }

  // 모달 닫기 이벤트
  if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => {
          openingModal.style.display = "none";
      });
  }
  // 모달 바깥 영역 클릭 시 닫기
  window.addEventListener("click", (event) => {
      if (event.target == openingModal) {
          openingModal.style.display = "none";
      }
  });

  // --- 4. 기타 UI 이벤트 핸들러 (사이드바) ---
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", function () {
      sidebar.classList.toggle("close");
      if(mainContent) mainContent.classList.toggle("shifted");
    });
  }

  // --- 5. 체스 게임 로직 가드 (Guard Clause) ---
  // 체스판(myBoard)이 없거나 game 객체가 없으면 여기서 스크립트 종료하여 에러 방지
  if ($('#myBoard').length === 0 || !game) {
      return; 
  }

  // ----------------------------------------------------------------------
  // (이하 기존 체스 게임 로직: myBoard가 있는 페이지에서만 실행됨)
  // ----------------------------------------------------------------------

  function removeHighlights() {
    $board.find('.' + squareClass).removeClass('valid-move selected-square capture-target'); 
    $board.find('.piece-417db').removeClass('selected-piece'); 
    $board.find('.' + squareClass).css('box-shadow', '');
  }

  function highlightMoves(square, moves) {
      $board.find('.square-' + square).addClass('selected-square'); 
      $board.find('.square-' + square + ' .piece-417db').addClass('selected-piece'); 
      
      for (var i = 0; i < moves.length; i++) {
          const targetSquare = moves[i].to;
          $board.find('.square-' + targetSquare).addClass('valid-move');
          const pieceOnTarget = game.get(targetSquare);
          if (pieceOnTarget && pieceOnTarget.color !== game.turn()) {
              $board.find('.square-' + targetSquare).addClass('capture-target'); 
          }
      }
  }

  function onSquareClick(event) {
    if (game.game_over()) return; 
    if (event.type === 'touchend') event.preventDefault(); 
    
    var $target = $(event.currentTarget); 
    var square = $target.attr('data-square');
    var targetPiece = game.get(square); 

    if (squareToHighlight) {
        var moves = game.moves({ square: squareToHighlight, verbose: true });
        var move = moves.find(m => m.to === square);

        if (move) {
            removeHighlights(); 
            squareToHighlight = null; 
            game.move(move.san); 
            board.position(game.fen()); 
            updateStatus();
            updatePgn();
            updateOpening();
            return; 
        }
        
        if (!targetPiece) {
            removeHighlights();
            squareToHighlight = null;
            return; 
        }

        if (targetPiece.color === game.turn()) {
            if (squareToHighlight === square) {
                removeHighlights();
                squareToHighlight = null;
                return;
            }
        } else {
            removeHighlights();
            squareToHighlight = null;
            return;
        }
    }

    if (!targetPiece || targetPiece.color !== game.turn()) {
        removeHighlights();
        squareToHighlight = null;
        return;
    }

    removeHighlights();
    squareToHighlight = square;
    var moves = game.moves({ square: square, verbose: true });
    highlightMoves(square, moves);
  }

  function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false; 
    }
  }

  function updateStatus() {
    var status = "";
    var moveColor = "White (백)";
    if (game.turn() === "b") moveColor = "Black (흑)";

    if (game.in_checkmate()) status = "게임 종료: " + moveColor + " 체크메이트 승!";
    else if (game.in_draw()) status = "게임 종료: 무승부";
    else {
      status = moveColor + " 차례입니다.";
      if (game.in_check()) status += ", " + moveColor + "이(가) 체크 상태입니다!";
    }
    $status.html(status);
  }
  
  function updatePgn() {
    var pgn = game.pgn();
    var normalizedPgn = pgn.replace(/\s+/g, ' ');
    var formattedPgn = normalizedPgn.replace(/ (\d+\.)/g, '\n$1').trim();
    $pgnText.text(formattedPgn); 
  }

  function resetGame() {
    game.reset();
    board.position(game.fen());
    updateStatus();
    updatePgn();
    updateOpening();
    removeHighlights();
    squareToHighlight = null;
  }

  function updateOpening() {
    const currentPgn = game.pgn();
    let openingFound = false;
    for (let i = 0; i < OPENINGS.length; i++) {
      if (currentPgn.startsWith(OPENINGS[i].pgn)) {
        $openingName.text(OPENINGS[i].name);
        openingFound = true;
        break; 
      }
    }
    if (!openingFound) $openingName.text("아직 오프닝이 아닙니다.");
  }

  function initBoard() {
    var screenWidth = $(window).width();
    var boardSize = (screenWidth <= 768) ? Math.min(screenWidth * 0.9, 500) : 645;

    var config = {
      draggable: false, 
      position: 'start',
      onDragStart: onDragStart, 
      onDrop: function() { return 'snapback'; },
      pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    };

    var $boardDiv = $('#myBoard');
    $boardDiv.css('width', boardSize + 'px');

    board = Chessboard('myBoard', config);
    
    $('#myBoard').on('click touchend', '.square-55d63', onSquareClick);

    $(window).on('resize', function() {
        var newScreenWidth = $(window).width();
        var newBoardSize = (newScreenWidth <= 768) ? Math.min(newScreenWidth * 0.9, 500) : 645;
        if ($boardDiv.width() != newBoardSize) {
             $boardDiv.css('width', newBoardSize + 'px');
             board.resize();
        }
    });

    updateStatus();
    updatePgn();
    updateOpening();
  }

  initBoard();

  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }
});
