export class Game{
    constructor(){
        this.mode = "beforeload";
    }
    cache = {}
    size = {
        x: 0,
        y: 0
    }
	meta = {};
    updateSize(x,y){
        this.size.x = x;
        this.size.y = y;
    }
    async preload(path){
        try{
            let d = await fetch("/project/"+path);
            d= await d.blob();
            this.cache[path] = await createImageBitmap(d);
			return true;
        } catch(e){
            throw e;
        }
    }
	async loadMeta(){
		let d = await fetch("/project/project.json");
		d = await d.json();
		this.meta = d;
		return true;
	}
    story = {}
    current = {
        background: "",
        chars: [],
        dialog: {
            owner: "",
            content: ""
        },
        depth: [], // starting a scene withing a scene within a path would result in ["scene/toplevel", "scene/bottomlevel", "rootlevel"];
        progression: [], //same senario = [5, 2, 11]
        blocked: false
    }
}