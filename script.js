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
    // ----------------------------------------------------------------------
    // 1. 1. e4 e5 Openings (오픈 게임 계열)
    // ----------------------------------------------------------------------
    // Ruy Lopez (루이 로페즈)
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7", name: "Ruy Lopez: Closed (루이 로페즈: 클로즈드)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4", name: "Ruy Lopez: Open (루이 로페즈: 오픈)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6", name: "Ruy Lopez: Berlin Defense (베를린 디펜스)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5", name: "Ruy Lopez (루이 로페즈)" },
    
    // Italian Game (이탈리안 게임)
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3", name: "Giuoco Piano: Giuoco Pianissimo (죠코 피아니시모)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4", name: "Giuoco Piano: Classical (죠코 피아노: 클래식)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5", name: "Giuoco Piano (죠코 피아노)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. d4", name: "Two Knights Defense: Fried Liver Attack (프라이드 리버 어택)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6", name: "Two Knights Defense (투 나이트 디펜스)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4", name: "Italian Game (이탈리안 게임)" }, 

    // Four Knights Game (포 나잇 게임)
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Bb5 Bb4 5. O-O O-O", name: "Four Knights Game: Spanish Variation (스페니시)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6", name: "Four Knights Game (포 나잇 게임)" }, 
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3", name: "Three Knights Game (쓰리 나잇 게임)" }, 
    
    // Scotch & Vienna
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4", name: "Scotch Game (스코티시 게임)" },
    { pgn: "1. e4 e5 2. Nc3 Nf6 3. g3", name: "Vienna Game: Falkbeer Variation (빈 게임)" },
    
    // King's Gambit (킹스 갬빗)
    { pgn: "1. e4 e5 2. f4 exf4 3. Nf3", name: "King's Gambit Accepted (킹스 갬빗: 억셉티드)" },
    
    // ----------------------------------------------------------------------
    // 2. 1. e4 Non-e5 Defenses (기타 1.e4 방어)
    // ----------------------------------------------------------------------
    // Sicilian Defense (시실리안 디펜스)
    { pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", name: "Sicilian Defense: Najdorf (시실리안: 나이도프)" },
    { pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5", name: "Sicilian Defense: Sveshnikov (시실리안: 스베시니코프)" },
    { pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6", name: "Sicilian Defense: Dragon (시실리안: 드래곤)" },
    { pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", name: "Sicilian Defense: Scheveningen (시실리안: 스케베닝겐)" },
    { pgn: "1. e4 c5 2. Nf3 Nc6", name: "Sicilian Defense: Open (시실리안: 오픈)" },
    { pgn: "1. e4 c5", name: "Sicilian Defense (시실리안 디펜스)" },
    
    // French Defense (프렌치 디펜스)
    { pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. e5", name: "French Defense: Advance Variation (어드밴스)" },
    { pgn: "1. e4 e6 2. d4 d5 3. Nd2", name: "French Defense: Tarrasch Variation (타라시)" },
    { pgn: "1. e4 e6 2. d4 d5 3. Nc3", name: "French Defense: Classical (클래시컬)" },
    { pgn: "1. e4 e6 2. d4 d5", name: "French Defense (프렌치 디펜스)" }, 
    
    // Caro-Kann Defense (캐로-칸 디펜스)
    { pgn: "1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3", name: "Caro-Kann Defense: Exchange Variation (교환형)" },
    { pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5", name: "Caro-Kann Defense: Classical (클래시컬)" },
    { pgn: "1. e4 c6 2. d4 d5", name: "Caro-Kann Defense (캐로-칸 디펜스)" }, 
    
    // Pirc & Modern
    { pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6", name: "Pirc Defense (피르츠 디펜스)" },
    { pgn: "1. e4 g6 2. d4 Bg7 3. Nc3", name: "Modern Defense (모던 디펜스)" },
    
    // Miscellaneous
    { pgn: "1. e4 Nf6 2. e5 Nd5 3. d4 d6", name: "Alekhine Defense (알레킨 디펜스)" },
    { pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3", name: "Scandinavian Defense (스칸디나비아 디펜스)" },
    
    // ----------------------------------------------------------------------
    // 3. 1. d4 Openings (퀸즈 폰 오프닝 계열)
    // ----------------------------------------------------------------------
    // Queen's Gambit (퀸즈 갬빗)
    { pgn: "1. d4 d5 2. c4 dxc4", name: "Queen's Gambit Accepted (퀸즈 갬빗: 억셉티드)" },
    { pgn: "1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. Nc3", name: "Queen's Gambit Declined (퀸즈 갬빗: 디클라인드)" },
    
    // Indian Defenses (인도 디펜스)
    { pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5", name: "Gruenfeld Defense (그룬펠트 디펜스)" },
    { pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4", name: "Nimzo-Indian Defense (님조-인디언 디펜스)" },
    { pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6", name: "Queen's Indian Defense (퀸즈 인디언 디펜스)" },
    { pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7", name: "King's Indian Defense: Classical (킹스 인디언: 클래시컬)" },
    { pgn: "1. d4 Nf6 2. c4 g6", name: "King's Indian Defense (킹스 인디언 디펜스)" },
    
    // Slav Defense (슬라브 디펜스)
    { pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4", name: "Semi-Slav Defense: Anti-Meran (세미-슬라브)" },
    { pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6", name: "Slav Defense (슬라브 디펜스)" },
    
    // Other d4
    { pgn: "1. d4 Nf6 2. c4 e5 3. dxe5 Ng4", name: "Budapest Gambit (부다페스트 갬빗)" },
    { pgn: "1. d4 d6 2. c4 e5 3. dxe5", name: "Old Indian Defense (올드 인디언)" },
    
    // ----------------------------------------------------------------------
    // 4. Flank & Irregular Openings (측면 및 비정형 오프닝)
    // ----------------------------------------------------------------------
    { pgn: "1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5", name: "English Opening: Four Knights Variation (잉글리시: 포 나잇)" },
    { pgn: "1. c4", name: "English Opening (잉글리시 오프닝)" },
    { pgn: "1. Nf3 d5 2. g3 Nf6 3. Bg2", name: "Réti Opening (레티 오프닝)" },
    { pgn: "1. f4 d5 2. Nf3", name: "Bird's Opening (버드 오프닝)" },
    { pgn: "1. g3", name: "King's Fianchetto Opening (킹스 피앙케토)" },
    { pgn: "1. b3", name: "Larsen's Opening (라르센 오프닝)" },
    
    // ----------------------------------------------------------------------
    // 5. General / Fallback (일반)
    // ----------------------------------------------------------------------
    { pgn: "1. e4 e5 2. Nf3 Nc6", name: "Open Game (오픈 게임)" },
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
    // --- 👇 추가된 부분: 게임 종료 시 클릭 이동 차단 ---
    if (game.game_over()) {
        // 게임이 종료되었으면 (체크메이트, 무승부 포함) 아무것도 하지 않고 함수 종료
        return; 
    }
    // --- 👆 추가된 부분 종료 ---
    
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
  // --- 👇 수정된 부분: 게임 종료 시 드래그 차단 ---
  // 게임이 끝났으면 (체크메이트, 스테일메이트, 50수 규칙 등) 기물 이동을 차단합니다.
  if (game.game_over()) {
    return false;
  }
  // --- 👆 수정된 부분 종료 ---
  
  // 기물의 색깔 확인 (현재 턴의 기물만 움직일 수 있음)
  if (
    (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)
  ) {
    return false; // 상대방 기물이면 움직임 차단
  }
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
    
    // 👇 체스판 크기를 660px로 조정하고, 모바일 최대 크기를 500px로 설정합니다.
    if (screenWidth <= 768) {
        boardSize = Math.min(screenWidth * 0.9, 500); 
    } else {
        boardSize = 645; // 데스크톱 기본 크기 660px
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
        // 👇 체스판 크기를 660px로 조정하고, 모바일 최대 크기를 500px로 설정합니다.
        if (newScreenWidth <= 768) {
            newBoardSize = Math.min(newScreenWidth * 0.9, 500); // 모바일 최대 크기 500px
        } else {
            newBoardSize = 645; // 데스크톱 기본 크기 660px
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