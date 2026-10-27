# ChessMate — Two-Player Chess Website

ChessMate is a responsive chess website made as a beginner-friendly intermediate web development project. Two players can play on the same device.

## Features

- Standard 8×8 chessboard with Unicode chess pieces
- Legal chess moves and turn tracking
- Highlighted legal destinations for a selected piece
- Check, checkmate, stalemate, and draw status messages
- Move history in algebraic notation
- Undo the previous move
- Restart the game
- Pawn promotion choice (queen, rook, bishop, or knight)
- Responsive layout for desktop and mobile screens
- Keyboard-focus outlines and accessible labels for board squares

## Tech stack

- **HTML5** — page structure
- **CSS3** — layout, colors, responsive styling
- **JavaScript** — board interface, click handling, status and history display
- **chess.js 0.10.3** — chess rules and legal-move validation, loaded from a CDN

## Run the website

1. Download or extract this project folder.
2. Open `index.html` in a modern web browser.
3. Keep an internet connection enabled because the chess.js library and fonts are loaded from CDNs.

No installation or build command is required.

## How to play

1. White moves first.
2. Click one of your pieces. Legal destination squares are highlighted.
3. Click a highlighted destination to move.
4. Players alternate turns on the same device.
5. Use **Undo move** to take back the last move, or **New game** to reset the board.

## Project files

- `index.html` — page content and layout
- `style.css` — visual design and responsive rules
- `script.js` — game interface and interactions
- `README.md` — project information and run instructions
- `STUDY_GUIDE.md` — beginner explanation of how the project works
- `INTERVIEW_PREP.md` — sample questions and answers for the project discussion

## Limitations

- This is local two-player chess, not online multiplayer.
- It does not include a computer opponent or player accounts.
- The chess.js library is loaded from a CDN, so an internet connection is required when opening the page unless the dependency is downloaded and configured locally.

## Suggested repository name

`chessmate-chess-game`

## Publishing with GitHub Pages

Upload the project files to a public GitHub repository. Keep `index.html` in the repository's root directory. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select the `main` branch and `/(root)` folder, and save. After the deployment finishes, use the URL shown in the Pages settings.

Official guide: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
