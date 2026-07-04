
// Tile Types
type SizeType = "1x1" |"2x2" | "3x3"
export type TileColorPresets = "#4ecc45" | "#669db3" | "#d2d9b9"
export type Tile = {
    id:string,
    type?: SizeType
    width:number,
    height:number,
    x:number,
    y:number,
    fill:TileColorPresets | (string&{}),
    effect?:{ // Either tile wont have effect , or will have with min 1 and valid Resource
        radius:number
        percentModif:number
        targetResource:Resource
    }
    outputs:Output[]
}


// Resource Types
type UnitTime = "second" | "minute" | "hour" | "day"
type ResourceColourPresets = "#FFD700" | "#708090" | "#2F4F4F" | "#4682B4"
/** Type for globally set items other tiles can produce / consume */
export type Resource = {
    id:string
    name:string
    color:ResourceColourPresets | (string&{})
    unitTime:UnitTime
}
/** Type for item , which is a predefined item of Resource type, that a tile can produce */
export type Output = {
    id:string
    amount:number
    modifAmount:number
    refreshSeconds:number
}