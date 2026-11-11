// Where the save server is. '' = the same address that served this page (server.py / start-game2.bat).
// On GitHub Pages (static host, no server of its own) the game uses the cloud save API on Vercel, so a farm follows the player code to any browser or device. ?cloud=1 in the address forces it anywhere.
// With no server reachable the game keeps working and saves in this browser only.
window.FARM2_API = (/\.github\.io$/.test(location.hostname) || /[?&]cloud=1/.test(location.search)) ? 'https://framgame.vercel.app/api/v2' : '';
