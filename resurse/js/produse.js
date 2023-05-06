window.addEventListener("load", function(){
    //    incarc datele din cosul virtual, preluarea din localStorage, ca si cum as avea iteme in cosul virtual


    //preluare date cos virtual (din local storage)
    //in localStorage vom memora cosul virtual ca o lista de id-uri separate prin virgula
    //am produsul 3,1,10,4,1 (nu am voie de doua ori 1) cand selectez l-am adaugat, cand debifez l-am sters, nu am de doua ori un produs
    
    //In localStorage   "cos_virtual":"3,1,10,4"
    //                      cheia       valoarea

    //pentru cantitate, in localStorage in loc sa memoram string-ul "3,1,10,4" care arata ca am produsul cu id-ul 3, dar nu stiu de cate ori, 
    //pot sa memorez cu un alt separator    "3|2" asta arata 2 bucati de produsul 3,  "3|2,5|1,1|7"


    let iduriProduse=localStorage.getItem("cos_virtual");

    //daca am ceva in iduriProduse, nu e null, getItem a returnat ceva, atunci facem split (ce era inainte string devine vector)
    iduriProduse=iduriProduse?iduriProduse.split(","):[];     //["3", "1", "10", "4"]
 
    //vreau sa trec prin fiecare checkbox corespunzator unui produs din cosul virtual pt ca as vrea sa se pastreze datele, produsele selectate   
    for(let idp of iduriProduse){
        let ch = document.querySelector(`[value='${idp}'].select-cos`);
        if(ch){
            ch.checked=true; //daca exista checkbox-ul atunci il bifam
        }
        else{
            console.log("Id cos virtual inexistent:", idp);
        }
    }





//adaugare date in cos virtual (din localStorage)
  //daca avem clasa select-cos pe mai multe elemente nu mai merge sa facem asa cu getElementsByClassName, facem cu un querySelectorAll, scriem asa ca sa nu depinda de tipul de input(checkbox)
    let checkboxuri = document.getElementsByClassName("select-cos");

    //let creeaza o instanta de fiecare data cand face o noua iteratie a for-ului
    for(let ch of checkboxuri){ 
        //ce se intampla la schimbarea unui astfel de checkbox
        ch.onchange=function(){
            //  bifat/nebifat
            //trebuie sa obtin vector de produse ca sa adaug sau sa sterg 

            let iduriProduse=localStorage.getItem("cos_virtual");
            iduriProduse=iduriProduse?iduriProduse.split(","):[];

            //verific daca in urma schimbarii starii checkbox-ului e bifat sau nu
            if(this.checked){ //daca e bifat vreau sa adaug in vectorul de produse si produsul curent
                iduriProduse.push(this.value);  //push adauga la final id-ul elementului
            }
            else{
                //sterg produsul dupa ce i-am gasit pozitia
                let poz=iduriProduse.indexOf(this.value);

                //daca pozitia e -1 inseamna ca nu a gasit valoarea in vectorul de id-uri
                if(poz != -1){ //daca chiar l-a gasit atunci ma apuc sa il sterg
                     iduriProduse.splice(poz,1); //splice pentru a sterge si pentru a adauga elemente
                            //pozitia de la care sterge elementul apoi cate elemente sa stearga, e un sg id pe care vreau sa il sterg; al treilea parametru imi arata ce sa pun in loc, dar in cazul asta nu e nevoie
                    }
            }

            //setez cosul virtual cu noua valoare din iduriProduse
            localStorage.setItem("cos_virtual", iduriProduse.join(","));    
            //o sa apara stringul cu tot cu [] si nu vreau sa le pastreze, pentru a evita sa mai fac un subsir care stere prima [, apoi ultima ]
            //din vector fac sir, fac cu opusul lui split care e join si ia toate elem din iduriProduse si concateneaza intre ele cu ,
        }
    }



 


    document.getElementById("inp-pret").onchange=function(){
        document.getElementById("infoRange").innerHTML = `(${this.value}) lei`
    }


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