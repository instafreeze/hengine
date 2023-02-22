//globals
let canvas = document.getElementById("background");
let ctx = canvas.getContext("2d");

//game object because funny
import {Game} from "./game.js";
let game = new Game();
//recalc screen dimensions
function calc(){
    let cx = document.body.clientWidth;
	let cy = document.body.clientHeight;
    canvas.width = cx;
	canvas.height = cy;
    game.updateSize(cx,cy);
    return true;
}
//render loop
async function frame(){
    ctx.clearRect(0, 0, game.size.x, game.size.y);
    ctx.strokeStyle = "";
    if(game.mode == "beforeload"){
        await game.loadMeta();
        await game.preload("backgrounds/menu.png");
        game.mode = "menu";
    }
    if(game.mode == "menu"){
        ctx.drawImage(game.cache["backgrounds/menu.png"], 0,0);
        ctx.fillStyle="white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(game.meta.name, game.size.x/2, 100);
        ctx.font = "24px Arial";
        ctx.fillText(game.meta.authors, game.size.x/2, 150);
    }
    requestAnimationFrame(frame);
}
calc();
frame();