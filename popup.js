let colorsArr = [];
const recent_box = document.querySelectorAll('.recent-box');
const hex = document.getElementById('hex');
const rgb = document.getElementById('rgb');
const selected_color = document.getElementById('selected-color');
const box = document.querySelectorAll('.box');
const pick_color = document.getElementById('pick-color');
const clear_colors = document.getElementById('clear-colors');
const delete_color = document.getElementById('delete');
const body = document.getElementsByTagName('body')[0];
const html = document.getElementsByTagName('html')[0];
const cover = document.getElementById('cover');

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

chrome.storage.sync.get('colorsArr', ({ colorsArr }) => {
    if(colorsArr===undefined){
        chrome.storage.sync.set({colorsArr: []});
    }
    else if(colorsArr.length === 0){
        cover.style.display = 'block';
    }
    else if(colorsArr.length >= 9){
        colorsArr = colorsArr.slice(-10);
    }
    else{
        for(let i = 0; i < colorsArr.length; i++){
            recent_box[i].style.backgroundColor = colorsArr[colorsArr.length -1 - i];
            recent_box[i].style.border = '2px solid ' + colorsArr[colorsArr.length -1 - i];
        }
    
        hex.textContent = colorsArr[colorsArr.length - 1];
        rgb.textContent = hexToRgb(colorsArr[colorsArr.length - 1]);
        selected_color.style.backgroundColor = colorsArr[colorsArr.length - 1];
    }
    
})

pick_color.addEventListener('click', () => {
    html.style.height = '25px';
    body.style.display = 'none';
    const resultElement = document.getElementById('hex');

    if (!window.EyeDropper) {
      resultElement.textContent = 'Your browser does not support the EyeDropper API';
      return;
    }

    recent_box.forEach(e => e.classList.remove('active'));

    setTimeout(() => {
        const eyeDropper = new EyeDropper();
        eyeDropper.open().then(result => {
            body.style.display = 'block';
            html.style.height = '0px';
            cover.style.display = 'none';
            
            chrome.storage.sync.get('colorsArr', ({ colorsArr }) => {
                colorsArr.push(result.sRGBHex);
                if(colorsArr.length >= 9) colorsArr = colorsArr.slice(-10);
                chrome.storage.sync.set({ colorsArr });
                for(let i = 0; i < colorsArr.length; i++){
                    recent_box[i].style.backgroundColor = colorsArr[colorsArr.length - 1 - i];
                    recent_box[i].style.border = '2px solid ' + colorsArr[colorsArr.length -1 - i];
                }
            })
    
            resultElement.textContent = result.sRGBHex;
            selected_color.style.backgroundColor = result.sRGBHex;
            rgb.textContent = hexToRgb(result.sRGBHex);

        }).catch(e => {
            body.style.display = 'block';
            html.style.height = '0px';
        });

        document.addEventListener('visibilitychange', () => {
            window.close();
        })

        document.addEventListener('keydown', (e) => {
            if(["AltLeft", "AltRight", "MetaLeft", "MetaRight", "OSLeft", "OSRight"].includes(e.code))
                window.close();
        })
    }, 50);
    
});

box.forEach(el => {
    el.addEventListener('click', (e) => {
        if(e.target.textContent !== ''){
            navigator.clipboard.writeText(e.target.textContent);
        }
    });
})

clear_colors.addEventListener('click', () => {
    cover.style.display = 'block';
    chrome.storage.sync.set({colorsArr: []});
    for(let i = 0; i < 10; i++){
        recent_box[i].style.backgroundColor = 'transparent';
        recent_box[i].style.border = '2px solid ' + getComputedStyle(recent_box[i] ).getPropertyValue('--recent-box-border');
        selected_color.style.backgroundColor = 'white';
    }
    box.forEach(e => e.textContent = '');
});

delete_color.addEventListener('click', () => {
    chrome.storage.sync.get('colorsArr', ({ colorsArr }) => {
        recent_box.forEach((el, index) => {
            if(el.classList.contains('active')){
                colorsArr.splice(colorsArr.length - 1 - index, 1);
                let color;
                if(colorsArr.length === 0){
                    cover.style.display = 'block';
                }
                else{
                    color = colorsArr[colorsArr.length - 1 - index];
                    if(!color) color = colorsArr[colorsArr.length - index];

                    hex.textContent = color;
                    rgb.textContent = hexToRgb(color);
                    selected_color.style.backgroundColor = color;
                }
                


                
                
                for(let i = 0; i < 10; i++){
                    recent_box[i].style.backgroundColor = '';
                    recent_box[i].style.borderColor = '';
                }
                
                for(let i = 0; i < colorsArr.length; i++){
                    recent_box[i].style.backgroundColor = colorsArr[colorsArr.length - 1 - i];
                    recent_box[i].style.border = '2px solid ' + colorsArr[colorsArr.length -1 - i];
                }

                chrome.storage.sync.set({ colorsArr });

            }
        })
    })
});

function rgbToHex(color) {
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
        recent_box.forEach(e => e.classList.remove('active'));
        e.classList.add('active');

        hex.textContent = rgbToHex(e.style.backgroundColor);
        rgb.textContent = e.style.backgroundColor;
        selected_color.style.backgroundColor = e.style.backgroundColor;
    });
});