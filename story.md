# Commands
### meta
document information is provided via meta command
```
meta keyname keyvalue
```
supported meta keys are
`storyParseTargetVersion` specify target parser version - will give warning if value is different than parser version
`defaultFileExtension` default filetype to append to files specified without filetype
'file' becomes 'file.value'
'file.other' remains 'file.other'
### path
paths are defined via this tag
```
path begin pathname
```
or
```
path end
```
you MUST define a path named 'default'
this is the path used by default

#### how to use paths
paths define the story
each "segment" is a seperate path
for example, default path gives two options: path1 and path2 - depending on what the user chooses they will either continue in path1 or path2
### block
```
block
chars joe bob dylan
```
makes the next command "blocking", or requiring the user to click/spacebar to advance to it
### chars
define visible characters in scene
requires an actively defined path
```
chars joe bob dylan
```
### sprite
sets character sub-sprite
```
sprite char sub
```
char must be a currently active character defined by `chars`
the character's image will become char-sub.png
### dialog
pretty important
```
char "text that is very informing"
```
char must be an character in the scene
this command is blocking
### back
defines current background
```
back image
```
or
```
back image.png
```
### options
shows options for switching paths
```
options pathname path pathname2 path2
```
this will effectively end the path and switches to the selected path
you still need to do `path end` after it to close the path
### sound
play a sound
```
sound start sound.mp3 duration tmpsoundname
```
and
```
sound end tmpsoundname
```
repeats a sound every x miliseconds
start a sound with `sound start file.mp3 duration name` and end the same sound with `sound stop name`
duration is the amount of miliseconds to wait after the sound ends to start it again
# Example
```
meta storyParseTargetVersion 0.0
meta defaultFileExtension png

path begin default
block
sound start sound.mp3 1000 0123456
chars bob joe
back menu
sprite bob angry
bob "this contains space so must put quotations"
joe "huh bingle.mp4"
options name path name2 path2
sound end 0123456
path end
path begin funny
chars bob joe
bob "how many cheeseburgers hit?"
joe "eleven"
bob "no, tweleve"
joe "ahahahhahah hahh aha hah ha hah ha BOOM"
```