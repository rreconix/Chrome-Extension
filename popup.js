let colorsArr = [];
const recent_box = document.querySelectorAll('.recent-box');
let boxes = Array.from(recent_box);
const hex = document.getElementById('hex');
const rgb = document.getElementById('rgb');
const selected_color = document.getElementById('selected-color');
const box = document.querySelectorAll('.box');
const pick_color = document.getElementById('pick-color');
const clear_colors = document.getElementById('clear-colors');
const body = document.getElementsByTagName('body')[0];
const html = document.getElementsByTagName('html')[0];

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

chrome.storage.sync.get('colorsArr', ({ colorsArr }) => {
    if(colorsArr===undefined){
        chrome.storage.sync.set({colorsArr: []});
        return;
    }
    else if(colorsArr.length === 0) return;

    for(let i = 0; i < colorsArr.length; i++){
        boxes[i].style.backgroundColor = colorsArr[colorsArr.length - 1 - i];
        boxes[i].style.border = '2px solid ' + colorsArr[colorsArr.length - 1 - i];
    }

    hex.textContent = colorsArr[colorsArr.length - 1];
    rgb.textContent = hexToRgb(colorsArr[colorsArr.length - 1]);
    selected_color.style.backgroundColor = colorsArr[colorsArr.length - 1];
})

//focusout, visibility change,
const abortController = new AbortController();  
document.addEventListener('keydown', (e) => {
    if(["AltLeft", "AltRight", "MetaLeft", "MetaRight", "OSLeft", "OSRight"].includes(e.code))
    abortController.abort();
    window.close()
})

document.addEventListener('visibilitychange', () => {
    abortController.abort();
    window.close()
})



pick_color.addEventListener('click', () => {
    html.style.height = '25px';
    body.style.display = 'none';
    const resultElement = document.getElementById('hex');

    if (!window.EyeDropper) {
      resultElement.textContent = 'Your browser does not support the EyeDropper API';
      return;
    }
    
    setTimeout(() => {
        const eyeDropper = new EyeDropper();
        

        eyeDropper.open({ signal: abortController.signal }).then(result => {
            body.style.display = 'block';
            html.style.height = '378px';
    
            chrome.storage.sync.get('colorsArr', ({ colorsArr }) => {
                colorsArr.push(result.sRGBHex);
                if(colorsArr.length > 9) colorsArr.slice(-10);
                chrome.storage.sync.set({ colorsArr });
                
                for(let i = 0; i < colorsArr.length; i++){
                    boxes[i].style.backgroundColor = colorsArr[colorsArr.length - 1 - i];
                    boxes[i].style.border = '2px solid ' + colorsArr[colorsArr.length - 1 - i];
                }
            })
    
    
            resultElement.textContent = result.sRGBHex;
            selected_color.style.backgroundColor = result.sRGBHex;
            rgb.textContent = hexToRgb(result.sRGBHex);

        }).catch(e => {
            body.style.display = 'block';
            html.style.height = '378px';
        });

    }, 50)
    
});

box.forEach(el => {
    el.addEventListener('click', (e) => {
        if(e.target.textContent !== ''){
            navigator.clipboard.writeText(e.target.textContent);
        }
    })
})

clear_colors.addEventListener('click', () => {
    colorsArr = [];
    chrome.storage.sync.set({ colorsArr });
    for(let i = 0; i < 10; i++){
        boxes[i].style.backgroundColor = 'transparent';
        boxes[i].style.border = '2px solid ' + getComputedStyle( boxes[i] ).getPropertyValue('--recent-box-border');
        selected_color.style.backgroundColor = 'white';
        
    }
    box.forEach(e => e.textContent = '');
})

function parseColor(color) {
    var arr=[]; color.replace(/[\d+\.]+/g, function(v) { arr.push(parseFloat(v)); });
    return "#" + arr.slice(0, 3).map(toHex).join("");
}

function toHex(int) {
    var hex = int.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

recent_box.forEach(e => {
    e.addEventListener('click', () => { 
        if(e.style.backgroundColor === 'transparent' || e.style.backgroundColor === '') return;
        hex.textContent = parseColor(e.style.backgroundColor);
        rgb.textContent = e.style.backgroundColor;
        selected_color.style.backgroundColor = e.style.backgroundColor;
    })
})