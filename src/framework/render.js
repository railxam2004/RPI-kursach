const RenderPosition={BEFOREBEGIN:'beforebegin',AFTERBEGIN:'afterbegin',BEFOREEND:'beforeend',AFTEREND:'afterend'};

function createElement(template){
 const el=document.createElement('div');
 el.innerHTML=template;
 return el.firstElementChild;
}

function render(component,container,place=RenderPosition.BEFOREEND){
 container.insertAdjacentElement(place,component.element);
}

export {RenderPosition,createElement,render};