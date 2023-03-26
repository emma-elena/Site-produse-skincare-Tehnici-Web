window.onload = function(){
    
    document.getElementById("filtrare").onclick = function(){
        //selectam input-ul dupa id, vrem valoarea din el, continutul input-ului il accesam cu value
        var inputNume = document.getElementById("inp-nume").value.toLowerCase().trim();

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
}