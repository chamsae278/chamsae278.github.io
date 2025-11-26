$(function () {

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

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

  var normalizedPgn = pgn.replace(/\s+/g, ' ');

  // 👇 이 부분을 수정합니다:
  // 1. PGN 문자열에서 수(Move) 번호와 그 뒤의 공백을 찾습니다. (예: "1. " 또는 "10. ")
  // 2. 찾은 패턴을 줄바꿈 문자('\n')와 함께 다시 삽입하여 강제 개행합니다.
  
  // 정규식: (\d+\.)는 '1.', '2.' 등 수 번호를 찾고, 그 뒤에 공백 하나를 찾습니다.
  // 이 패턴을 개행 문자 '\n'과 함께 다시 삽입합니다. (첫 수에는 적용되지 않도록 약간 조정)
  var formattedPgn = normalizedPgn.replace(/ (\d+\.)/g, '\n$1').trim();
  
  // 첫 번째 수가 개행되지 않았을 경우를 대비하여 추가 처리 (선택 사항)
  // formattedPgn = formattedPgn.trim().replace(/^(\d+\.)/g, '\n$1').trim();

  // 가져온 기록을 <pre> 태그에 넣습니다.
  // $pgnText는 jQuery 객체이므로 .text()를 사용하면 됩니다.
  $pgnText.text(formattedPgn); 
}
  // 체스판 설정 (설정 객체)
  var config = {
    draggable: true,
    position: "start",
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    // [수정된 이미지 CDN 주소] Wikimedia Commons에서 가져옵니다.
    pieceTheme: "pieces/{piece}.png",
  };
  // 체스판 그리기
  // 이 코드가 이제 HTML 준비 후에 실행됩니다.
  board = Chessboard("myBoard", config);

  // 초기 상태 텍스트 업데이트
  updateStatus();
}); // <-- jQuery ready 함수 끝
