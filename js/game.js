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
}