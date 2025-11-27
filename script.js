// script.js

$(function () {
  // --- 변수 및 상태 초기화 ---
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const resetBtn = document.getElementById("resetBtn");
  
  var board = null;
  var game = new Chess();
  var $status = $("#status");
  var $pgnText = $("#pgn-text");
  var $openingName = $("#opening-name");
  
  // 클릭 이동을 위한 상태 변수
  var $board = $('#myBoard');
  var squareToHighlight = null; // 현재 선택된 기물의 위치 (from)
  var squareClass = 'square-55d63'; // chessboard.js의 칸 클래스명

  // 오프닝 데이터 (기존과 동일)
  const OPENINGS = [
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5", name: "Giuoco Piano (죠코 피아노)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6", name: "Two Knights Defense (투 나이트 디펜스)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4", name: "Italian Game (이탈리안 게임)" }, 
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5", name: "Ruy Lopez (루이 로페즈)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. d4", name: "Scotch Game (스코티시 게임)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6", name: "Open Game (오픈 게임)" },
    { pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", name: "Sicilian Defense: Najdorf (시실리안 나이도프)" },
    { pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5", name: "Sicilian Defense: Sveshnikov (시실리안 스베시니코프)" },
    { pgn: "1. e4 c5", name: "Sicilian Defense (시실리안 디펜스)" },
    { pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5", name: "Gruenfeld Defense (그룬펠트 디펜스)" },
    { pgn: "1. d4 d5 2. c4 c6 3. Nc3 Nf6", name: "Slav Defense (슬라브 디펜스)" },
    { pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5", name: "Queen's Gambit Declined (퀸즈 갬빗 디클라인드)" },
    { pgn: "1. d4 Nf6", name: "Indian Defense (인도 디펜스)" },
    { pgn: "1. d4 d5", name: "Closed Game (클로즈드 게임)" },
    { pgn: "1. Nf3", name: "Réti Opening (레티 오프닝)" },
    { pgn: "1. c4", name: "English Opening (잉글리시 오프닝)" },
    { pgn: "1. g3", name: "King's Fianchetto Opening (킹스 피앙케토)" },
    { pgn: "1. e4", name: "King's Pawn Opening (킹스 폰 오프닝)" },
    { pgn: "1. d4", name: "Queen's Pawn Opening (퀸즈 폰 오프닝)" },
    { pgn: "", name: "아직 오프닝이 아닙니다." },
  ];

  // --- UI 이벤트 핸들러 (사이드바) ---
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", function () {
      sidebar.classList.toggle("close");
      mainContent.classList.toggle("shifted");
    });
  }

  // --- 체스 로직 함수들 ---

  // 이동 가능한 경로 표시 및 선택 표시 제거 함수
  function removeHighlights() {
    // 💡 capture-target 클래스 제거 추가
    $board.find('.' + squareClass).removeClass('valid-move selected-square capture-target'); 
    $board.find('.piece-417db').removeClass('selected-piece'); // 기물 선택 효과 제거
    $board.find('.' + squareClass).css('box-shadow', '');
  }

  // 이동 가능한 칸 하이라이트 표시
  function highlightMoves(square, moves) {
      $board.find('.square-' + square).addClass('selected-square'); // 선택된 칸 강조
      $board.find('.square-' + square + ' .piece-417db').addClass('selected-piece'); // 기물 강조 효과
      
      for (var i = 0; i < moves.length; i++) {
          const targetSquare = moves[i].to;
          $board.find('.square-' + targetSquare).addClass('valid-move');

          // 💡 캡처 가능한 기물 강조 로직 추가
          const pieceOnTarget = game.get(targetSquare);
          if (pieceOnTarget && pieceOnTarget.color !== game.turn()) {
              // 상대방 기물이 있다면 캡처 타겟 클래스 추가
              $board.find('.square-' + targetSquare).addClass('capture-target'); 
          }
      }
  }

  // 칸 클릭/터치 이벤트 핸들러 (클릭 이동 로직)
  function onSquareClick(event) {
    // 터치 이벤트 충돌 방지
    if (event.type === 'touchend') {
        event.preventDefault(); 
    }
    
    var $target = $(event.currentTarget); 
    var square = $target.attr('data-square');
    var targetPiece = game.get(square); // 클릭된 칸의 기물

    // 1. 이미 기물이 선택된 상태 (squareToHighlight가 설정됨)
    if (squareToHighlight) {
        
        // 1-A. VALID MOVE 체크 및 실행
        var moves = game.moves({ square: squareToHighlight, verbose: true });
        var move = moves.find(m => m.to === square);

        if (move) {
            // ** VALID MOVE: 이동 애니메이션 실행 **
            removeHighlights(); // 이동 전에 하이라이트 제거
            squareToHighlight = null; // 선택 상태 초기화

            // game.move()로 chess.js 상태 변경 후, board.position()으로 애니메이션 반영
            // board.position()이 chessboard.js에 내장된 애니메이션을 사용합니다.
            game.move(move.san); 
            board.position(game.fen()); 

            updateStatus();
            updatePgn();
            updateOpening();
            return; 
        }
        
        // 1-B. DESELECTION / SELECTION SWITCH

        // 클릭된 칸에 기물이 없으면 -> 선택 취소 (빈 공간 터치)
        if (!targetPiece) {
            removeHighlights();
            squareToHighlight = null;
            return; 
        }

        // 자신의 기물을 다시 터치했거나 다른 자신의 기물을 터치한 경우
        if (targetPiece.color === game.turn()) {
            // 자신의 기물을 다시 터치했으면 선택 취소 (토글)
            if (squareToHighlight === square) {
                removeHighlights();
                squareToHighlight = null;
                return;
            }
            // 다른 자신의 기물을 터치했으면 선택 변경 (아래 2번 로직으로 이동)
        } else {
            // 상대방 기물을 터치했지만 유효한 이동 목표가 아님 -> 선택 취소
            removeHighlights();
            squareToHighlight = null;
            return;
        }
    }


    // 2. New Selection Logic (새로운 기물 선택)

    // 기물이 없거나 상대방 기물을 클릭한 경우 (선택 불가)
    if (!targetPiece || targetPiece.color !== game.turn()) {
        removeHighlights();
        squareToHighlight = null;
        return;
    }

    // 자신의 기물을 선택 (새로운 선택 또는 선택 변경)
    removeHighlights();
    squareToHighlight = square;
    var moves = game.moves({ square: square, verbose: true });
    highlightMoves(square, moves);
  }

  // 드래그 앤 드롭 기능을 완전히 비활성화 (클릭 이동만 사용)
  function onDragStart(source, piece, position, orientation) {
    return false; 
  }

  // onSnapEnd 및 onMoveEnd는 position()으로 대체하여 사용하지 않습니다.
  function updateStatus() {
    var status = "";
    var moveColor = "White (백)";
    if (game.turn() === "b") {
      moveColor = "Black (흑)";
    }

    if (game.in_checkmate()) {
      status = "게임 종료: " + moveColor + " 체크메이트 승!";
    } else if (game.in_draw()) {
      status = "게임 종료: 무승부";
    } else {
      status = moveColor + " 차례입니다.";
      if (game.in_check()) {
        status += ", " + moveColor + "이(가) 체크 상태입니다!";
      }
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

    if (!openingFound) {
      $openingName.text("아직 오프닝이 아닙니다.");
    }
  }

  // --- 보드 초기화 및 반응형 설정 ---
  function initBoard() {
    var screenWidth = $(window).width();
    var boardSize;
    
    if (screenWidth <= 768) {
        boardSize = Math.min(screenWidth * 0.9, 350); 
    } else {
        boardSize = 400;
    }

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

    // 창 크기가 변경될 때마다 보드 크기를 재설정
    $(window).on('resize', function() {
        var newScreenWidth = $(window).width();
        var newBoardSize;
        if (newScreenWidth <= 768) {
            newBoardSize = Math.min(newScreenWidth * 0.9, 350);
        } else {
            newBoardSize = 400;
        }

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