window.onload=function(){
    document.getElementById("tema").onclick=function(){
        if(document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
        }
        else{
            document.body.classList.add("dark");
        }
    }

}
