/* ChessMate: interface code. chess.js supplies the chess rules. */
"use strict";

const boardElement = document.getElementById("chessboard");
const statusTitle = document.getElementById("status-title");
const statusMessage = document.getElementById("status-message");
const turnPiece = document.getElementById("turn-piece");
const turnLabel = document.getElementById("turn-label");
const moveList = document.getElementById("move-list");
const moveCount = document.getElementById("move-count");
const undoButton = document.getElementById("undo-button");
const restartButton = document.getElementById("restart-button");
const promotionDialog = document.getElementById("promotion-dialog");
const toast = document.getElementById("toast");

const PIECES = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟︎" }
};
const FILES = "abcdefgh";

let game;
let selectedSquare = null;
let legalTargets = [];
let lastMove = null;
let pendingPromotion = null;
let toastTimer = null;

function startGame() {
  game = new Chess();
  selectedSquare = null;
  legalTargets = [];
  lastMove = null;
  pendingPromotion = null;
  promotionDialog.hidden = true;
  render();
  showToast("New game started");
}

function getPieceSymbol(piece) {
  return piece ? PIECES[piece.color][piece.type] : "";
}

function squareName(row, col) {
  return FILES[col] + (8 - row);
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const squareNameValue = squareName(row, col);
      const square = document.createElement("button");
      square.type = "button";
      square.className = "square " + ((row + col) % 2 === 0 ? "light" : "dark");
      square.dataset.square = squareNameValue;
      square.setAttribute("aria-label", squareNameValue);
      square.title = squareNameValue;

      if (lastMove && (lastMove.from === squareNameValue || lastMove.to === squareNameValue)) {
        square.classList.add("last-move");
      }
      if (selectedSquare === squareNameValue) square.classList.add("selected");

      const piece = game.get(squareNameValue);
      if (piece) {
        const pieceSpan = document.createElement("span");
        pieceSpan.className = "piece " + (piece.color === "w" ? "white" : "black");
        pieceSpan.textContent = getPieceSymbol(piece);
        square.appendChild(pieceSpan);
      }

      if (col === 0) {
        const rank = document.createElement("span");
        rank.className = "coordinate";
        rank.textContent = String(8 - row);
        square.appendChild(rank);
      }
      if (row === 7) {
        const file = document.createElement("span");
        file.className = "coordinate";
        file.textContent = FILES[col];
        square.appendChild(file);
      }

      if (legalTargets.includes(squareNameValue)) {
        const marker = document.createElement("span");
        const occupied = Boolean(game.get(squareNameValue));
        marker.className = occupied ? "legal-ring" : "legal-dot";
        square.appendChild(marker);
      }

      square.addEventListener("click", () => handleSquareClick(squareNameValue));
      boardElement.appendChild(square);
    }
  }
}

function renderMoves() {
  const history = game.history();
  moveList.innerHTML = "";
  moveCount.textContent = history.length + (history.length === 1 ? " move" : " moves");

  if (history.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-moves";
    empty.textContent = "Moves will appear here.";
    moveList.appendChild(empty);
    return;
  }

  for (let i = 0; i < history.length; i += 2) {
    const item = document.createElement("li");
    item.className = "move-pair";
    const number = document.createElement("span");
    number.innerHTML = '<span class="move-number">' + (Math.floor(i / 2) + 1) + '.</span>';
    number.appendChild(document.createTextNode(history[i]));
    item.appendChild(number);
    if (history[i + 1]) {
      const blackMove = document.createElement("span");
      blackMove.textContent = history[i + 1];
      item.appendChild(blackMove);
    }
    moveList.appendChild(item);
  }
  moveList.scrollTop = moveList.scrollHeight;
}

function updateStatus() {
  const turn = game.turn();
  const colorName = turn === "w" ? "White" : "Black";
  turnPiece.textContent = turn === "w" ? "♙" : "♟︎";
  turnLabel.textContent = colorName + "'s turn";

  if (game.in_checkmate()) {
    const winner = turn === "w" ? "Black" : "White";
    statusTitle.textContent = "Checkmate!";
    statusMessage.textContent = winner + " wins. Start a new game to play again.";
    turnLabel.textContent = "Game finished";
  } else if (game.in_stalemate()) {
    statusTitle.textContent = "Draw by stalemate";
    statusMessage.textContent = "The player to move has no legal moves but is not in check.";
    turnLabel.textContent = "Game finished";
  } else if (game.in_draw()) {
    statusTitle.textContent = "Draw game";
    statusMessage.textContent = "The game has ended in a draw.";
    turnLabel.textContent = "Game finished";
  } else if (game.in_check()) {
    statusTitle.textContent = colorName + " is in check";
    statusMessage.textContent = "The king is under attack. Make a legal move to respond.";
  } else {
    statusTitle.textContent = colorName + " to move";
    statusMessage.textContent = "Select a piece, then choose a highlighted square.";
  }
  undoButton.disabled = game.history().length === 0;
}

function render() {
  renderBoard();
  renderMoves();
  updateStatus();
}

function handleSquareClick(square) {
  if (game.game_over() || pendingPromotion) return;

  const piece = game.get(square);
  const isOwnPiece = piece && piece.color === game.turn();

  if (selectedSquare && legalTargets.includes(square)) {
    makeMove(selectedSquare, square);
    return;
  }

  if (isOwnPiece) {
    selectedSquare = square;
    legalTargets = game.moves({ square: square, verbose: true }).map(move => move.to);
    renderBoard();
    return;
  }

  selectedSquare = null;
  legalTargets = [];
  renderBoard();
}

function makeMove(from, to, promotion) {
  const piece = game.get(from);
  if (piece && piece.type === "p" && (to.endsWith("8") || to.endsWith("1")) && !promotion) {
    pendingPromotion = { from: from, to: to };
    promotionDialog.hidden = false;
    return;
  }

  let move;
  try {
    move = game.move({ from: from, to: to, promotion: promotion || "q" });
  } catch (error) {
    move = null;
  }

  if (!move) {
    showToast("That move is not legal");
    selectedSquare = null;
    legalTargets = [];
    render();
    return;
  }

  lastMove = { from: move.from, to: move.to };
  selectedSquare = null;
  legalTargets = [];
  pendingPromotion = null;
  promotionDialog.hidden = true;
  render();
}

document.querySelectorAll("[data-promotion]").forEach(button => {
  button.addEventListener("click", () => {
    if (!pendingPromotion) return;
    const choice = button.dataset.promotion;
    makeMove(pendingPromotion.from, pendingPromotion.to, choice);
  });
});

undoButton.addEventListener("click", () => {
  if (game.history().length === 0) return;
  const undone = game.undo();
  lastMove = null;
  selectedSquare = null;
  legalTargets = [];
  pendingPromotion = null;
  promotionDialog.hidden = true;
  if (undone) showToast("Last move undone");
  render();
});

restartButton.addEventListener("click", startGame);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

if (typeof Chess === "undefined") {
  statusTitle.textContent = "Chess rules library not loaded";
  statusMessage.textContent = "Check your internet connection, then refresh the page. The chess.js library is loaded from a CDN.";
  boardElement.innerHTML = '<p style="padding:20px">Unable to load chess.js. Connect to the internet and refresh.</p>';
  undoButton.disabled = true;
  restartButton.disabled = true;
} else {
  startGame();
}
