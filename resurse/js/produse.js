window.onload = function(){
    x = 100;
    document.getElementById("filtrare").onclick = function(){
        //selectam input-ul dupa id, vrem valoarea din el, continutul input-ului il accesam cu value
        var inputNume = document.getElementById("inp-nume").value;

        //luam pe rand fiecare produs, selectam elementele de tip produs din pagina
        //toate acestea au in comun clasa "produs"
        var produse = document.getElementsByClassName("produs");

        //luam fiecare element si verificam daca contine ce am scris in input
        //iteram prin ele
        for (let produs of produse){
            //facem produsul invizibil
            var cond1 = false;
            produs.style.display = "none";


            //obtinem numele din produs
            let nume = produs.getElementsByClassName("val-nume")[0].innerHTML;

            //vreau sa contina inputNume, deci verific daca nume include inputNume
            if(nume.includes(inputNume)){
                cond1 = true;
            }
        }

        if(cond1){
            produs.style.display = "block";
        }
    };
}