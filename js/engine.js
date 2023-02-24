//globals
let canvas = document.getElementById("background");
let ctx = canvas.getContext("2d");
//game object because funny
import { Game } from "./game.js";
import { parseStory } from "./parse.js";
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
function exec(x){
    if(x.type == "background"){
        if(game.story.meta.defaultFileExtension != undefined && x.target.indexOf(".") == -1){
            x.target=x.target+"."+game.story.meta.defaultFileExtension;
        }

    }
}
function preloader(depth,pr){
    let count = 2;
    while(1){
        pr[0]+=1;
        if(count==0)return true;
        if(game.story.content[depth[0]].length == pr[0]){
            depth.shift();
            pr.shift();
            if(depth.length == 0){
                //end of game reached by preloader
                return true;
            }
        }
        let x = game.story.content[depth[0]][pr[0]];
        if(x.blocking){
            count--;
            continue;
        } else {
            //follow scene and path redirections
            //for paths, preload one step of each choice
            //if we run into media, preload it
            if(x.type == "background"){
                if(game.story.meta.defaultFileExtension != undefined && x.target.indexOf(".") == -1){
                    x.target=x.target+"."+game.story.meta.defaultFileExtension;
                }
                game.preload(x.target);
            }
        }
    }
}
preloader()
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
        setTimeout(function(){
            game.mode = "play";
        }, 1000);
    } else if(game.mode == "play"){
        if(game.current.depth.length == 0){
            game.current.depth = ["default"];
            game.current.progression = [0];
        }
        if(game.current.blocked){
            game.current.blocked=false;
        } else {
            while(1){
                game.current.progression[0]+=1;
                if(game.current.progression[0] == game.story.content[game.current.depth[0]].length){
                    game.current.progression.shift();
                    game.current.depth.shift();
                    if(game.current.depth.length == 0){
                        console.log("game finished");
                        throw "";
                    }
                } else {
                    let x = game.story.content[game.current.depth[0]][game.current.progression[0]];
                    if(x.blocking){
                        game.current.blocked = true;
                        break;
                    } else {
                        console.log(x);
                    }
                }
            }
        }   
    }
    requestAnimationFrame(frame);
}
game.story = parseStory(`meta storyParseTargetVersion 0.0
meta defaultFileExtension png

scene begin diag1
chars joe bob
bob "kkkkkys"
joe "omgisters"
scene end
path begin default
block
sound start sound.mp3 1000 0123456
chars bob joe
back menu
sprite bob angry
bob "this contains space so must put quotations"
joe "huh bingle.mp4"
scene run diag1
options name path name2 path2
sound end 0123456
path end
path begin funny
chars bob joe
bob "how many cheeseburgers hit?"
joe "eleven"
bob "no, tweleve"
joe "ahahahhahah hahh aha hah ha hah ha BOOM"
path end`);
calc();
frame();