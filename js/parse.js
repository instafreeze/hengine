const checks = {
    "meta": 2,
    "chars": 0
}
const storyParseVersion = "0.0"
function splitString(str) {
    const result = [];
    let current = "";
    let inQuotes = false;
  
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
  
      if (char === " " && !inQuotes) {
        if (current !== "") {
          result.push(current.replace(/"/g, ""));
          current = "";
        }
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else {
        current += char;
      }
    }
  
    if (current !== "") {
      result.push(current.replace(/"/g, ""));
    }
  
    return result;
  }
  
function rip(i,m){
    console.error(`Line ${parseInt(i)+1}: ${m}`);
    alert(`Line ${parseInt(i)+1}: ${m}`);
    throw "Fatal while parsing story";
}
function matchCmd(command,input,pathRequired,path,lengthForce,line){
    let out = {};
    for(let i in command){
        if(command[i] == "<a>"){
            if(parseInt(i)+1==command.length) return true;
            continue;
        }
        if(command[i] != input[i]){
            return false;
        } else {
            if(parseInt(i)+1==command.length){
                if(pathRequired && path == undefined){
                    rip(line,"attempted to use "+command[0]+" when path unset");
                }
                if(lengthForce === true && input.length != command.length){
                    rip(line,"wrong number of arguments on "+command[0]);
                } else if(lengthForce !== false && lengthForce !== true) {
                    if(input.length < lengthForce){
                        rip(line,"wrong number of arguments on "+command[0]);
                    }
                }
                return true;
            }
            continue;
        }
    }
}
export function parseStory(story){
    let out = {
        meta: {},
        content: {}
    };
    let chars = [];
    let sounds = [];
    story = story.split("\n");
    let path = undefined;
    let blockNext = false;
    for(let i in story){
        if(story[i][0] == "/" && story[i][1] == "/") continue;
        if(story[i] == "" || story[i] == " ") continue;
        if(story[i] == "block"){
            blockNext=true;
            continue;
        }
        let l = splitString(story[i]);
        
        if(matchCmd([
            "meta",
            "<a>",
            "<a>"
        ], l, false, path, true, i)){
            if(l[1] == "storyParseTargetVersion"){
                if(l[2] != storyParseVersion){
                    console.warn("Storyfile meant for storyParser v"+l[2]+", current is "+storyParseVersion);
                }
            }
			out.meta[l[1]] = l[2];
        } else if(matchCmd([
            "path",
            "begin",
            "<a>"
        ], l, false, path, true, i)){
            if(path != undefined){
                rip(i, "path already defined");
            } else {
                path = l[2];
                out.content[path] = [];
            }
        } else if(matchCmd([
            "path",
            "end"
        ], l, true, path, true, i)){
            path=undefined;
        } else if(matchCmd([
            "scene",
            "begin",
            "<a>"
        ], l, false, path, true, i)){
            if(path != undefined){
                rip(i,"cannot define scene inside of path");
            }
            path = "scene/"+l[2];
            out.content[path]=[];
        } else if(matchCmd([
            "scene",
            "end",
        ], l, true, path, true, i)){
            if(path.indexOf("scene/") != 0){
                rip(i,"cannot end non active scene");
            }
            path=undefined;
        } else if(matchCmd([
            "scene",
            "run",
            "<a>"
        ], l, true, path, true, i)){
            out.content[path].push({
                "type": "scene",
                "target": l[2],
                "blocking": blockNext
            });
        } else if(matchCmd([
            "chars"
        ], l, true, path, 1, i)){
            let k = l.filter(a => l.indexOf(a) !== 0);
            if(k.length < 0){
                rip(i,"missing character params on chars");
            }
            chars=k;
            out.content[path].push({
                "type": "chars",
                "target": k,
                "blocking": blockNext
            });
        } else if(matchCmd([
            "sprite",
            "<a>",
            "<a>"
        ], l, true, path, true, i)){
            if(chars.indexOf(l[1]) == -1){
                rip(i,`${l[1]} not present in scene while attempting to set subsprite`);
            }
            out.content[path].push({
                "type": "subsprite",
                "target": l[1],
                "data": l[2],
                "blocking": blockNext
            });
        } else if(matchCmd([
            "back",
            "<a>"
        ], l, false, path, true, i)){
            let tg = l[1];
            if(tg.indexOf(".") == -1 && out.meta.defaultFileExtension != undefined){
                tg+="."+out.meta.defaultFileExtension;
            }
            out.content[path].push({
                "type": "background",
                "target": tg,
                "blocking": blockNext
            });
        } else if(matchCmd([
            "options"
        ], l, true, path, 1, i)){
            if(path.indexOf("scene/") == 0){
                rip(i,"cannot show options inside of scene");
            }
            let k = l.filter(a => l.indexOf(a) !== 0);
            if(k.length % 2 != 0){
                rip(i,"odd number of params on options");
            }
            let o = {};
            for(let i=0;i<k.length;i+=2){
                o[k[i]] = k[i+1];
            }
            out.content[path].push({
                "type": "options",
                "target": o,
                "blocking": true
            });
        } else if(matchCmd([
            "sound",
            "<a>",
            "<a>",
            "<a>",
            "<a>"
        ], l, false, path, true, i)){
            if(l[1] == "start"){
                if(sounds.indexOf(l[4]) != -1){
                    rip(i,"attempted to start sound with duplicate id");
                }
                sounds.push(l[4]);
                out.content[path].push({
                    "type": "sound",
                    "target": l[1],
                    "data": l[2],
                    "blocking": blockNext
                });
            } else if(l[1] == "end"){
                if(sounds.indexOf(l[2]) == -1){
                    rip(i,"attempted to end nonexistant sound");
                }
                sounds.splice(sounds.indexOf(l[2]), 1);
                out.content[path].push({
                    "type": "soundend",
                    "target": l[2],
                    "blocking": blockNext
                });
            } else {
                rip(i,"invalid sound mode paramter");
            }
            
        } else {
            if(chars.indexOf(l[0]) != -1){
                out.content[path].push({
                    "type": "dialog",
                    "target": l[0],
                    "data": l[1],
                    "blocking": true
                });
            } else {
                rip(i, "unknown command "+l[0]);
            }
        }
        blockNext=false;
    }
    return out;
}