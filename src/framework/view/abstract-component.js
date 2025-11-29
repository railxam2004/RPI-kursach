import { createElement } from "../render.js";

export class AbstractComponent{
 #element=null;
 constructor(){
  if(new.target===AbstractComponent){
   throw new Error("Can't instantiate abstract");
  }
 }
 get element(){
  if(!this.#element){
   this.#element=createElement(this.template);
  }
  return this.#element;
 }
 get template(){throw new Error("No template");}
 removeElement(){this.#element=null;}
}