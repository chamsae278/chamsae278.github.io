// script.js

$(function () {

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  // 👇 리셋 버튼 엘리먼트 가져오기
  const resetBtn = document.getElementById("resetBtn");

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", function () {
      sidebar.classList.toggle("close");
      mainContent.classList.toggle("shifted");
    });
  }

  var board = null;
  var game = new Chess();
  var $status = $("#status");
  var $pgnText = $("#pgn-text");
  // 1. $openingLink 변수를 제거하고 $openingName만 유지합니다.
  var $openingName = $("#opening-name"); 

  // 오프닝 데이터베이스가 자주 사용되는 오프닝들로 업데이트되었습니다.
  const OPENINGS = [
    // 1. e4 Openings (1.e4 e5)
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5", name: "Giuoco Piano (죠코 피아노)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6", name: "Two Knights Defense (투 나이트 디펜스)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4", name: "Italian Game (이탈리안 게임)" }, 
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5", name: "Ruy Lopez (루이 로페즈)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6 3. d4", name: "Scotch Game (스코티시 게임)" },
    { pgn: "1. e4 e5 2. Nf3 Nc6", name: "Open Game (오픈 게임)" },
    // 1. e4 Openings (Sicilian)
    { pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", name: "Sicilian Defense: Najdorf (시실리안 나이도프)" },
    { pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5", name: "Sicilian Defense: Sveshnikov (시실리안 스베시니코프)" },
    { pgn: "1. e4 c5", name: "Sicilian Defense (시실리안 디펜스)" },
    // 1. d4 Openings
    { pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5", name: "Gruenfeld Defense (그룬펠트 디펜스)" },
    { pgn: "1. d4 d5 2. c4 c6 3. Nc3 Nf6", name: "Slav Defense (슬라브 디펜스)" },
    { pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5", name: "Queen's Gambit Declined (퀸즈 갬빗 디클라인드)" },
    { pgn: "1. d4 Nf6", name: "Indian Defense (인도 디펜스)" },
    { pgn: "1. d4 d5", name: "Closed Game (클로즈드 게임)" },
    // Etc
    { pgn: "1. Nf3", name: "Réti Opening (레티 오프닝)" },
    { pgn: "1. c4", name: "English Opening (잉글리시 오프닝)" },
    { pgn: "1. g3", name: "King's Fianchetto Opening (킹스 피앙케토)" },
    { pgn: "1. e4", name: "King's Pawn Opening (킹스 폰 오프닝)" },
    { pgn: "1. d4", name: "Queen's Pawn Opening (퀸즈 폰 오프닝)" },
    { pgn: "", name: "아직 오프닝이 아닙니다." }, // 초기 상태
  ];

  function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    if (
      (game.turn() === "w" && piece.search(/^b/) !== -1) ||
      (game.turn() === "b" && piece.search(/^w/) !== -1)
    ) {
      return false;
    }
  }

  function onDrop(source, target) {
    var move = game.move({
      from: source,
      to: target,
      promotion: "q",
    });

    if (move === null) return "snapback";

    updateStatus();
    updatePgn();
    
    updateOpening(); // 오프닝 업데이트 함수 호출
  }

  // 애니메이션이 끝난 후 보드 상태 동기화
  function onSnapEnd() {
    board.position(game.fen());
  }

  // 게임 상태 업데이트 (텍스트 표시)
  function updateStatus() {
    var status = "";

    var moveColor = "White (백)";
    if (game.turn() === "b") {
      moveColor = "Black (흑)";
    }

    // 체크메이트?
    if (game.in_checkmate()) {
      status = "게임 종료: " + moveColor + " 체크메이트 승!";
    }
    // 무승부?
    else if (game.in_draw()) {
      status = "게임 종료: 무승부";
    }
    // 진행 중
    else {
      status = moveColor + " 차례입니다.";
      // 체크 상태?
      if (game.in_check()) {
        status += ", " + moveColor + "이(가) 체크 상태입니다!";
      }
    }

    $status.html(status);
  }
  
  function updatePgn() {
    // chess.js의 pgn() 함수를 사용하여 전체 기록 문자열을 가져옵니다.
    var pgn = game.pgn();

    // 여러 공백을 단일 공백으로 정규화합니다.
    var normalizedPgn = pgn.replace(/\s+/g, ' ');

    // 정규식: (\\d+\\.)는 '1.', '2.' 등 수 번호를 찾고, 그 앞에 공백이 있으면 
    // 그 공백을 개행 문자 '\n'과 함께 다시 삽입하여 강제 개행합니다.
    var formattedPgn = normalizedPgn.replace(/ (\d+\.)/g, '\n$1').trim();
    
    $pgnText.text(formattedPgn); 
  }

  // 👇 리셋 게임 함수 추가
  function resetGame() {
    game.reset(); // chess.js 라이브러리의 reset 함수 호출 (초기 FEN으로 설정)
    board.position(game.fen()); // 보드 UI 업데이트
    updateStatus(); // 상태 메시지 업데이트
    updatePgn(); // PGN 기록 초기화
    updateOpening(); // 오프닝 이름 초기화
  }

  // 오프닝 이름 업데이트 함수
  function updateOpening() {
    const currentPgn = game.pgn();
    let openingFound = false;

    for (let i = 0; i < OPENINGS.length; i++) {
      // 현재 PGN이 오프닝의 PGN으로 시작하는지 확인
      if (currentPgn.startsWith(OPENINGS[i].pgn)) {
        $openingName.text(OPENINGS[i].name);
        openingFound = true;
        break; 
      }
    }

    // 오프닝을 찾지 못했거나 PGN이 비어 있으면 기본 메시지 표시
    if (!openingFound) {
      $openingName.text("아직 오프닝이 아닙니다.");
    }
  }


  // 초기 보드 설정을 위한 함수 호출
  function initBoard() {
    var config = {
      draggable: true,
      position: "start",
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      pieceTheme: "pieces/{piece}.png", // 이미지 경로가 올바른지 확인해주세요
    };

    board = Chessboard("myBoard", config);

    // 초기 상태 업데이트는 여기서 수행합니다.
    updateStatus();
    updatePgn();
    updateOpening();
  }
  
  // --- 함수 정의 영역 종료 ---

  initBoard(); // 보드 초기화 함수 호출

  // 👇 리셋 버튼 클릭 이벤트는 $(function () { ... }); 블록의 마지막에 등록해야 합니다. (수정된 부분)
  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }

});