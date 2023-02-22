const checks = {
    "meta": 2,
    "chars": 0
}
function rip(i,m){
    alert(`Line ${i+1}: ${m}`);
}
function matchCmd(command,input,pathRequired,path,lengthForce,line){
    let out = {};
    for(let i in command){
        if(command[i] == "<a>"){
            if(i-1==command.length) return true;
            continue;
        }
        if(command[i] != input[i]){
            return false;
        } else {
            if(pathRequired && path == undefined){
                rip(line,"attempted to use "+command[0]+" when path unset");
                throw "Fatal while parsing story";
            }
            if(lengthForce === true && input.length != command.length){
                rip(line,"wrong number of arguments on "+command[0]);
                throw "Fatal while parsing story";
            } else if(lengthForce !== false && lengthForce !== true) {
                if(input.length < lengthForce){
                    rip(line,"wrong number of arguments on "+command[0]);
                    throw "Fatal while parsing story";
                }
            }
            if(i-1==command.length) return true;
            continue;
        }
    }
}
export function parseStory(story){
    let out = {
        meta: {},
        content: {}
    };
    story = story.split("\n");
    let path = undefined;
    for(let i in story){
        //split by non escaped space
        if(story[i][0] == "/" && story[i][1] == "/") continue;
        if(story[i] == "" || story[i] == " ") continue;
        let l = story[i].split(/\s(?=(?:[^"]*"[^"]*")*[^"]*$)/g);
        
        if(matchCmd([
            "meta",
            "<a>",
            "<a>"
        ], l, false, path, true, i)){
			
		}
    }
}