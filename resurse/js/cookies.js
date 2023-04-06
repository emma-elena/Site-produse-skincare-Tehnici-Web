function setCookie(nume, valoare, timpExp){ 
    data = new Date();
    data.setTime(data.getTime() + timpExp)
    document.cookie = `${nume} = ${valoare}; expires=${data.toUTCString()}`;
} 

function getCookie(nume){
   vectorParametri =  document.cookie.split(";") // ["a=10", "b=ceva"]
   for(let parametru of vectorParametri)
    if (parametru.trim().startsWith(nume+"=")){
        return parametru.split("=")[1];
    }

    return null;
}

function removeCookie(nume){
    document.cookie = `${nume}=0; expires=${(new Date()).toUTCString()}`;
}

/* 
function deleteAllCookies(nume){
    vectorParametri =  document.cookie.split(";")
    for(let parametru of vectorParametri)
    if (parametru.trim().startsWith(nume+"=")){
        return parametru.split("=")[0];
    }
}
*/

window.addEventListener("load", function(){
    if(getCookie("acceptat_banner")){
          document.getElementById("banner").style.display = "none";
    }

    this.document.getElementById("cookies").onclick = function(){
        setCookie("acceptat_banner", true, 60000);
        document.getElementById("banner").style.display = "none";
    }
})