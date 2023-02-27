//globals
let canvas = document.getElementById("background");
let ctx = canvas.getContext("2d");
//game object because funny
import { Game } from "./game.js";
import { parseStory } from "./parse.js";
let game = new Game({
    logs: false
});
//some basic options
const PRELOAD_OPTS = {
    targetMainLinearPathConstraint: 2,
    targetSubpathLinearPathConstraint: 2
}
//dialog text calculation
function getLines(text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];
    ctx.font = "24px Arial";
    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
//recalc screen dimensions
function calc(){
    let cx = document.body.clientWidth;
	let cy = document.body.clientHeight;
    canvas.width = cx;
	canvas.height = cy;
    game.updateSize(cx,cy);
    return true;
}
document.body.addEventListener("keyup", (e)=>{
    if(e.code == "Space"){
        game.current.blocked=false;
        if(game.current.dialog.owner != undefined && game.current.dialog.owner != ""){
            game.current.dialog = {};
        }
    }
})
function exec(x,depth,pr){
    x = JSON.parse(JSON.stringify(x));
    game.log(x.type);
    if(x.type == "background"){
        if(game.story.meta.defaultFileExtension != undefined && x.target.indexOf(".") == -1){
            x.target = x.target+"."+game.story.meta.defaultFileExtension;
        }
        game.current.background = "backgrounds/"+x.target
    }
    if(x.type == "scene"){
        depth.unshift("scene/"+x.target);
        pr.unshift(-1);
    }
    if(x.type == "dialog"){
        console.warn(`${x.target}: ${x.data}`);
        game.current.dialog.owner = x.target;
        game.current.dialog.content = x.data;
    }
    if(x.type == "chars"){
        game.current.chars = x.target;
    }
    return true;
}
function preloader(d,p){
    let depth = JSON.parse(JSON.stringify(d));
    let pr = JSON.parse(JSON.stringify(p));
    let perPathCap = [];
    pr.forEach(e=>perPathCap.push(0));
    game.log(perPathCap);
    let count = 3;
    let subPathLimit = 0;
    while(1){
        pr[0]+=1;
        if(count==0)return true;
        if(game.story.content[depth[0]].length == pr[0]){
            game.log("ending path "+depth[0], game.story.content[depth[0]], "index "+pr[0]);
            depth.shift();
            pr.shift();
            perPathCap.shift();
            if(depth.length == 0){
                game.log("preloader stopped because end of game reach");
                //end of game reached by preloader
                return true;
            }
            continue;
        }
        if(perPathCap[0] != 0 && perPathCap[0] == subPathLimit){
            game.log("end of option peek preload");
            depth.shift();
            pr.shift();
            perPathCap.shift();
            continue;
        }
        let x = JSON.parse(JSON.stringify(game.story.content[depth[0]][pr[0]]));
        game.log("blocking, reduce progress");
        if(x.blocking){
            if(perPathCap[0] != 0){
                subPathLimit++;
            } else {
                count--;
            }
        }
        if(x.type == "background"){
            if(game.story.meta.defaultFileExtension != undefined && x.target.indexOf(".") == -1){
                x.target=x.target+"."+game.story.meta.defaultFileExtension;
            }
            x.target="backgrounds/"+x.target;
            if(game.cache[x.target] == undefined && game.processing.indexOf(x.target) == -1){
                game.log("preloading "+x.target);
                game.preload(x.target);
            }
        }
        if(x.type == "chars"){
            for(let i in x.target){
                let src = "characters/"+x.target[i]+"/"+x.target[i]+"-neutral.png";
                if(game.cache[src] == undefined && game.processing.indexOf(src) == -1){
                    game.log("preloading "+src);
                    game.preload(src);
                }
            }
        }
        if(x.type == "scene"){
            game.log("render scene");
            depth.unshift("scene/"+x.target);
            pr.unshift(-1);
            perPathCap.unshift(0);
        }
        if(x.type == "options"){
            game.log(`preloading ${Object.keys(x.target).length} options`);
            for(let i in x.target){
                game.log("add to preload stack");
                subPathLimit=0;
                depth.unshift(x.target[i]);
                pr.unshift(-1);
                perPathCap.unshift(2);
            }
            //debugger;
        }
    }
}
//drawing function
function render(){
    if(game.current.background != ""){
        ctx.drawImage(game.cache[game.current.background], 0,0);
    }
    if(game.current.chars.length > 0){
        for(let i in game.current.chars){
            let dx = game.cache["characters/"+game.current.chars[i]+"/"+game.current.chars[i]+"-neutral.png"];
            ctx.drawImage(dx, (game.size.x/(game.current.chars.length+1))*(parseInt(i)+1) - (dx.width/2), 0);
        }
    }
    if(game.current.dialog.owner != undefined && game.current.dialog.owner != ""){
        let tx = game.size.x/2;
        let ty = game.size.y/4;
        ctx.fillStyle = "rgba(0,0,100,0.5)";
        ctx.fillRect(game.size.x/4, game.size.y-ty, tx, ty);
        ctx.font = "24px arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        let lines = getLines(game.current.dialog.content, tx-40);
        for(let i in lines){
            ctx.fillText(lines[i], (game.size.x/4)+20, (game.size.y-ty)+(30*(parseInt(i)+1)));
        }
    }
}
//logic loop
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
        preloader(["default"], [0]);
        setTimeout(function(){
            game.mode = "play";
        }, 1000);
    } else if(game.mode == "play"){
        if(game.current.depth.length == 0){
            game.current.depth = ["default"];
            game.current.progression = [0];
        }
        if(game.current.blocked){
            //window.confirm("men");
            //game.current.blocked=false;
        } else {
            while(1){
                game.current.progression[0]+=1;
                if(game.current.progression[0] == game.story.content[game.current.depth[0]].length){
                    game.current.progression.shift();
                    game.current.depth.shift();
                    if(game.current.depth.length == 0){
                        game.log("game finished");
                        throw "";
                    }
                } else {
                    preloader(game.current.depth,game.current.progression);
                    let x = game.story.content[game.current.depth[0]][game.current.progression[0]];
                    exec(x,game.current.depth,game.current.progression);
                    if(x.blocking){
                        game.current.blocked = true;
                        break;
                    }
                }
            }
        }   
    }
    render();
    requestAnimationFrame(frame);
}
game.story = parseStory(`meta storyParseTargetVersion 0.0
meta defaultFileExtension png

scene begin diag1
chars bro
block
back skylake.webp
scene end
path begin default
block
sound start sound.mp3 1000 0123456
chars bro soup
back hamburger.png
sprite bro angry
bro "this contains space so must put quotations"
soup "stupid dummy little bongleshit fortnite gaming eater eleven year old looking"
soup "huh bingle.mp4"
scene run diag1
options name def2 name2 def2
sound end 0123456
path end
path begin def2
block
back bro.png
block
back bro.png
back ellele.png
path end`);
console.log(game.story);
calc();
frame();