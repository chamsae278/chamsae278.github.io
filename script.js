// script.js

$(function () {
  // --- 1. 변수 및 상태 초기화 ---
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const resetBtn = document.getElementById("resetBtn");
  
  // Chess 객체 안전 초기화 (라이브러리가 없어도 스크립트가 멈추지 않도록 함)
  var game = null;
  try {
      if (typeof Chess !== 'undefined') {
          game = new Chess();
      }
  } catch (e) {
      console.warn("Chess 라이브러리를 로드하지 못했습니다.", e);
  }

  var board = null;
  var $status = $("#status");
  var $pgnText = $("#pgn-text");
  var $openingName = $("#opening-name");
  
  var $board = $('#myBoard');
  var squareToHighlight = null; 
  var squareClass = 'square-55d63'; 

  // --- 2. 오프닝 데이터 ---
  const OPENINGS = [
    // 1. e4 e5 계열
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7", name: "Ruy Lopez: Closed", desc: "백이 중앙을 강력하게 통제하며 장기적인 전략적 우위를 점하려는 전통적인 오프닝입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4", name: "Ruy Lopez: Open", desc: "흑이 백의 중앙 폰을 잡으며 적극적으로 기물을 전개하는 공격적인 라인입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6", name: "Ruy Lopez: Berlin Defense", desc: "'베를린 장벽'이라 불리며, 매우 견고하고 무승부 비율이 높은 방어법입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5", name: "Ruy Lopez", desc: "백이 비숍으로 흑의 나이트를 압박하며 주도권을 잡는 가장 유명한 오프닝 중 하나입니다." },
    
    // Italian Game
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3", name: "Giuoco Piano: Pianissimo", desc: "매우 조용하고 느린 전개를 선호하는 형태입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4", name: "Giuoco Piano: Classical", desc: "백이 중앙을 강력하게 차지하려는 시도입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5", name: "Giuoco Piano", desc: "이탈리안 게임의 기본 형태로, 비숍을 c4에 배치해 f7 약점을 노립니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. d4", name: "Two Knights: Fried Liver", desc: "백이 나이트를 희생하여 흑의 킹을 공격하는 매우 위험한 전술입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6", name: "Two Knights Defense", desc: "흑이 비숍 전개 대신 나이트를 꺼내 백의 e4 폰을 역공합니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4", name: "Italian Game", desc: "빠른 전개와 중앙 싸움이 특징인 대중적인 오프닝입니다." },

    // Four Knights & Others
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Bb5 Bb4 5. O-O O-O", name: "Four Knights: Spanish", desc: "네 개의 나이트가 모두 나온 안정적인 형태입니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6", name: "Four Knights Game", desc: "안정적이고 견고한 게임을 원하는 플레이어에게 적합합니다." },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4", name: "Scotch Game", desc: "백이 d4로 즉시 중앙을 열어 공간 우위를 가져가려 합니다." },
    { pgn: "1. e4 e5 2. f4 exf4 3. Nf3", name: "King's Gambit Accepted", desc: "백이 킹 쪽 폰을 희생하여 공격 라인을 여는 낭만적인 오프닝입니다." },
    
    // Sicilian
    { pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", name: "Sicilian: Najdorf", desc: "시실리안 디펜스 중 가장 유명하고 복잡한 라인입니다." },
    { pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6", name: "Sicilian: Dragon", desc: "흑이 비숍을 피앙케토하여 대각선을 장악하는 공격적인 형태입니다." },
    { pgn: "1. e4 c5", name: "Sicilian Defense", desc: "1.e4에 대한 승률이 높은 흑의 대응으로, 불균형한 포지션을 만듭니다." },
    
    // French & Caro-Kann
    { pgn: "1. e4 e6 2. d4 d5", name: "French Defense", desc: "견고하지만 다소 수동적인 방어법으로 중앙 싸움을 유도합니다." },
    { pgn: "1. e4 c6 2. d4 d5", name: "Caro-Kann Defense", desc: "매우 단단한 방어법으로 c8 비숍의 길이 막히지 않는 장점이 있습니다." },
    
    // d4 Openings
    { pgn: "1. d4 d5 2. c4 dxc4", name: "Queen's Gambit Accepted", desc: "흑이 폰을 잡지만 빠른 기물 전개에 집중하는 전략입니다." },
    { pgn: "1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. Nc3", name: "Queen's Gambit Declined", desc: "오래전부터 사용된 고전적이고 견고한 방어법입니다." },
    { pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7", name: "King's Indian Defense", desc: "중앙을 내어주고 나중에 킹 사이드 공격으로 반격하는 오프닝입니다." },
    { pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6", name: "Slav Defense", desc: "d5 폰을 c6 폰으로 지키며 견고한 진형을 구축합니다." },
    
    // Others
    { pgn: "1. c4", name: "English Opening", desc: "측면에서 중앙을 통제하며 유연한 게임을 진행합니다." },
    { pgn: "1. Nf3 d5 2. g3", name: "Réti Opening", desc: "중앙 폰을 밀지 않고 기물로 중앙을 간접 통제합니다." },
    { pgn: "1. e4", name: "King's Pawn Opening", desc: "가장 대중적인 첫수로 중앙 통제와 빠른 전개가 가능합니다." },
    { pgn: "1. d4", name: "Queen's Pawn Opening", desc: "안전하고 전략적인 게임으로 이어지는 경우가 많습니다." }
  ];

  // --- 3. UI 이벤트 핸들러 ---
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", function () {
      sidebar.classList.toggle("close");
      const content = document.getElementById("mainContent"); // 안전하게 다시 선택
      if(content) content.classList.toggle("shifted");
    });
  }

  // --- [핵심 수정] 오프닝 페이지 버튼 생성 로직 ---
  // 이 부분이 가장 먼저 실행되도록 하여 에러의 영향을 받지 않게 합니다.
  const openingGrid = document.getElementById("opening-grid");
  const openingModal = document.getElementById("openingModal");
  const modalCloseBtn = document.querySelector(".close-modal");

  if (openingGrid) {
      console.log("오프닝 그리드 발견, 버튼 생성 시작..."); // 디버깅용 로그
      OPENINGS.forEach(opening => {
          if (!opening.pgn || opening.name === "아직 오프닝이 아닙니다.") return;

          const btn = document.createElement("button");
          btn.className = "opening-btn";
          btn.textContent = opening.name;
          
          btn.addEventListener("click", () => {
              document.getElementById("modalTitle").textContent = opening.name;
              document.getElementById("modalPgn").textContent = opening.pgn;
              document.getElementById("modalDesc").textContent = opening.desc ? opening.desc : "설명 준비 중";
              openingModal.style.display = "block";
          });

          openingGrid.appendChild(btn);
      });
  }

  // 모달 닫기 이벤트
  if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => {
          openingModal.style.display = "none";
      });
  }
  window.addEventListener("click", (event) => {
      if (event.target == openingModal) {
          openingModal.style.display = "none";
      }
  });

  // --- 4. 체스 게임 로직 가드 (Guard Clause) ---
  // 체스판(myBoard)이 없거나 game 객체가 없으면 여기서 스크립트 종료
  // 이렇게 하면 오프닝 페이지에서는 아래 코드가 실행되지 않아 에러가 안 납니다.
  if ($('#myBoard').length === 0 || !game) {
      return; 
  }

  // --- 5. 체스판 관련 함수들 (보드가 있을 때만 실행됨) ---
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

  // 앱 시작
  initBoard();

  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }
});
