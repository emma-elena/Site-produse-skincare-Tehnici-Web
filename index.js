const express= require("express");
const fs=require("fs"); //acest pachet vine la pachet cand am instalat node

const sharp=require("sharp"); //pentru redimensionarea imaginilor din cod
const ejs = require("ejs");
const sass = require("sass");


app=express(); //cream server

app.set("view engine","ejs"); //ca sa putem folosi ejs, ejs pentru template, restul de pagini ca sa nu facem copy-paste pentru meniu
console.log("Cale proiect: ", __dirname);  //__dirname este folderul proiectului
app.use("/resurse", express.static(__dirname+"/resurse")); //numai caile care incep cu /resurse sa fie tratate ca fisiere statice
//primul e cerere facuta de browser, index.html
//al doilea e folderul 


obGlobal={
    erori:null,
    imagini:null
}


function createImages(){
    var continutFisier=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf8");   //fs e modulul cu care facem chestii cu fisierul: ex citire, scriere
    var obiect = JSON.parse(continutFisier);
    var dim_mediu=200;
    var dim_mic=100;

    obGlobal.imagini = obiect.imagini;

    obGlobal.imagini.forEach(function (elem){
        [numeFisier,extensie]=elem.fisier.split(".")  //"briose-frisca.png" -> ["briose-frisca", "png"]
        
        if(!fs.existsSync(obiect.cale_galerie+"/mediu/")){
            fs.mkdirSync(obiect.cale_galerie+"/mediu/");
        }

        if(!fs.existsSync(obiect.cale_galerie+"/mic/")){
            fs.mkdirSync(obiect.cale_galerie+"/mic/");
        }

        elem.fisier_mediu=obiect.cale_galerie+"/mediu/"+numeFisier+".webp";
        elem.fisier_mic=obiect.cale_galerie+"/mic/"+numeFisier+".webp";
        elem.fisier=obiect.cale_galerie+"/"+elem.fisier;
        sharp(__dirname+"/"+elem.fisier).resize(dim_mediu).toFile(__dirname+"/"+elem.fisier_mediu);
        sharp(__dirname+"/"+elem.fisier).resize(dim_mic).toFile(__dirname+"/"+elem.fisier_mic);
    });



    console.log(obGlobal.imagini);
}
createImages();



//citeste json si intoarce toate erorile intr-un obiect ca sa le putem folosi
function createErrors(){
    var continutFisier=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf8");  //readFileSync, ReadFile nu returneaza un string, ci un buffer de octeti, deci la final trebuie sa punem toString() pentru a transforma incoding in utf8
    //console.log(continutFisier);
    obGlobal.erori = JSON.parse(continutFisier);
    //console.log(obErori.erori);
}
createErrors();

function renderError(res, identificator, titlu, text, imagine){
    //in var eroare o sa primesc elementul cu identificatorul cautat
    var eroare = obGlobal.erori.info_erori.find(function(elem){ //in elem intra fiecare obiect din vectorul info_erori din erori.json
        //verificam pentru fiecare element daca e cel din parametru si returnam o valoare booleana, true/false 
        return elem.identificator == identificator; 
    })
      titlu = titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
      text = text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
      imagine = imagine || (eroare && obGlobal.erori.cale_baza+"/"+eroare.imagine) || obGlobal.erori.cale_baza+"/"+obGlobal.erori.eroare_default.imagine;

      //eroare tip http
      //verific daca am status
      if(eroare && eroare.status){
        //daca am status, trimit statusul si randez si pagina cu capmurile mele
            res.status(identificator).render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine});
        }
        else{
            res.render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine});
        }
    }

app.get(["/","/index","/home"], function(req, res){
    console.log("ceva");
    //res.sendFile(__dirname+ "/index.html");
    //res.write("nu stiu");
    //res.end();
    res.render("pagini/index", {ip: req.ip, ceva:30, altceva:20, imagini:obGlobal.imagini}); //object literal 
                                                                                             //obGlobal.imagini = vector
});

app.get("*/galerie-animata.css",function(req, res){

    var sirScss=fs.readFileSync(__dirname+"/resurse/scss/galerie_animata.scss").toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 
    rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
    console.log(rezScss);
    var caleScss=__dirname+"/temp/galerie_animata.scss"
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=__dirname+"/temp/galerie_animata.css";
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});


app.get("/*.ejs", function(req, res){
    renderError(res, 403);
});


app.get("/*", function(req, res){
    console.log("url:",req.url);
    //res.sendFile(__dirname+ "/index.html");
    //res.write("nu stiu");
    //res.end();                              //concateneaza url-ul si afiseaza pagina cautata
    res.render("pagini" + req.url, function(err, rezRandare){
         if(err){
                if(err.message.includes("Failed to lookup view")){
                    renderError(res, 404);
                }
                else{

                }
         }
         else{
            res.send(rezRandare);
         }
    }); 
});
console.log("Hello world!");

app.listen(8080);
console.log("Serverul a pornit!");