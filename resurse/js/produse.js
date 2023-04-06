window.addEventListener("load", function(){
    
    document.getElementById("filtrare").onclick = function(){
        conditieValidare = true;

        //selectam input-ul dupa id, vrem valoarea din el, continutul input-ului il accesam cu value
        var inputNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        
        //verificare inputuri  
        conditieValidare = conditieValidare && inputNume.match(new RegExp("^[a-zA-Z]*$"));

        if(!conditieValidare){
            alert("Inputuri gresite");
            return;
        }

        var inputCategorie = document.getElementById("inp-categorie").value;

        //luam pe rand fiecare produs, selectam elementele de tip produs din pagina
        //toate acestea au in comun clasa "produs"
        var produse = document.getElementsByClassName("produs");

        //luam fiecare element si verificam daca contine ce am scris in input
        //iteram prin ele
        for (let produs of produse){
            //facem produsul invizibil
            var conditieNume = false, conditieCategorie = false; 
            produs.style.display = "none";


            //obtinem numele din produs
            let nume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();

            //vreau sa contina inputNume, deci verific daca nume include inputNume
            if(nume.includes(inputNume)){
                conditieNume = true;
            }



            let categorie = produs.getElementsByClassName("val-categorie")[0].innerHTML;

            if(inputCategorie == "toate" || categorie == inputCategorie){
                conditieCategorie = true;
            }


            if(conditieNume && conditieCategorie){
                produs.style.display = "block";
            }
        }   
    }



    document.getElementById("resetare").onclick=function(){
        //resetare produse
        
        //le selectam dupa clasa
        var produse = document.getElementsByClassName("produs");

        for (let produs of produse){
            var conditieNume = false, conditieCategorie = false; 
            produs.style.display = "block";        
        } 
        //



        //resetare filtre
        document.getElementById("inp-nume").value = "";

        //aici selectez optuiunea pe care vreau sa o bifez
        document.getElementById("sel-toate").value.selected = true;
    }
    

   


    //sortare
    document.getElementById("sortCrescPret").onclick=function(){
        var produse = document.getElementsByClassName("produs");
        var vector_produse = Array.from(produse);
        
        vector_produse.sort(function(a,b){
             var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
             var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
 
             return pret_a - pret_b;
        }) 
        
        for (let produs of vector_produse){
             produs.parentNode.appendChild(produs);
         } 
     }

     document.getElementById("sortDescrescPret").onclick=function(){
        var produse = document.getElementsByClassName("produs");
        var vector_produse = Array.from(produse);
        
        vector_produse.sort(function(a,b){
             var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
             var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
  
             return pret_b - pret_a;
        }) 
        
        for (let produs of vector_produse){
             produs.parentNode.appendChild(produs);
         } 
     }




     document.getElementById("sortCrescNume").onclick=function(){
        var produse = document.getElementsByClassName("produs");
        var vector_produse = Array.from(produse);
        
        vector_produse.sort(function(a,b){
            var nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
               var nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
 
               return nume_a.localeCompare(nume_b);
        }) 
        
        for (let produs of vector_produse){
             produs.parentNode.appendChild(produs);
         } 
     }


     document.getElementById("sortDescrescNume").onclick=function(){
        var produse = document.getElementsByClassName("produs");
        var vector_produse = Array.from(produse);
        
        vector_produse.sort(function(a,b){
            var nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
            var nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
 
               return nume_b.localeCompare(nume_a);
        }) 
        
        for (let produs of vector_produse){
             produs.parentNode.appendChild(produs);
         } 
     }

});