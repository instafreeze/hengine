export class Game{
    constructor(){
        this.mode = "beforeload";
    }
    cache = {};
    size = {
        x: 0,
        y: 0
    };
	meta = {};
    processing = [];
    updateSize(x,y){
        this.size.x = x;
        this.size.y = y;
    }
    async preload(path){
        let st = new Date().getTime();
        this.processing.push(path);
        try{
            let d = await fetch("/project/"+path);
            d= await d.blob();
            this.cache[path] = await createImageBitmap(d);
            console.log(`cached ${path} in ${new Date().getTime()-st}`);
			return true;
        } catch(e){
            console.log("ENGNE");
            throw e;
        } finally {
            this.processing.splice(this.processing.indexOf(path), 1);
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