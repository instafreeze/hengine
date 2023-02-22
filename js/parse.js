const checks = {
    "meta": 2,
    "chars": 0
}
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
            if(parseInt(i)+1==command.length) return true;
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
            console.log(`meta ${l[1]} ${l[2]}`);
			out.meta[l[1]] = l[2];
        } else if(matchCmd([
            "path",
            "begin",
            "<a>"
        ], l, false, path, true, i)){
            if(path != undefined){
                rip(i, "path already defined");
            } else {
                console.log("set path to "+l[2]);
                path = l[2];
                out.content[path] = [];
            }
        } else if(matchCmd([
            "chars"
        ], l, true, path, 1, i)){
            let k = l.filter(a => l.indexOf(a) !== 0);
            console.log("chars", k);
            chars=k;
            out.content[path].push({
                "type": "chars",
                "target": k,
                "blocking": blockNext
            });
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