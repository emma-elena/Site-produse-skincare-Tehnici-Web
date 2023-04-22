const express = require("express");
const fs = require("fs"); //acest pachet vine la pachet cand am instalat node

const sharp = require("sharp"); //pentru redimensionarea imaginilor din cod
const ejs = require("ejs");
const sass = require("sass");
const { Client } = require("pg");  //{nume de variabila} 
const formidable = require("formidable");

const { Utilizator } = require("./module/utilizator.js")
const AccesBD = require("./module/accesbd.js")

var instantaBD = AccesBD.getInstanta({ init: "local" });
var client = instantaBD.getClient();

app = express(); //cream server

app.set("view engine", "ejs"); //ca sa putem folosi ejs, ejs pentru template, restul de pagini ca sa nu facem copy-paste pentru meniu
console.log("Cale proiect: ", __dirname);  //__dirname este folderul proiectului
app.use("/resurse", express.static(__dirname + "/resurse")); //numai caile care incep cu /resurse sa fie tratate ca fisiere statice
//primul e cerere facuta de browser, index.html
//al doilea e folderul 


app.use("node_modules", express.static(__dirname + "/node_modules"));


var optiuniPentruMeniu = "ceva!";

app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = optiuniPentruMeniu;
    next();
});




// instantaBD.select({campuri:["nume","pret"],tabel:"prajituri", conditiiAnd:["pret>10", "pret<20"]}, function(err, rez){

//     console.log("====================================");
//     if(err)
//         console.log("Eroare:" ,err);
//     else
//         console.log(rez);
// })

//conexiunea la baza de date
var client = new Client({
    database: "site",
    user: "emma_cobzariu",
    password: "parola_1234_5678",
    host: "localhost",
    port: 5432
});
client.connect();
/*


// client.query("select * from unnest(enum_range(null::categorie_produs))", function(err, rez){
//     if(err)
//         console.log(err);
//     else
//         console.log(rez);
// });
*/
obGlobal = {
    erori: null,
    imagini: null,
    optiuniPentruMeniu: null
}


function createImages() {
    var continutFisier = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf8");   //fs e modulul cu care facem chestii cu fisierul: ex citire, scriere
    var obiect = JSON.parse(continutFisier);
    var dim_mediu = 200;
    var dim_mic = 100;

    obGlobal.imagini = obiect.imagini;

    obGlobal.imagini.forEach(function (elem) {
        [numeFisier, extensie] = elem.fisier.split(".")  //"briose-frisca.png" -> ["briose-frisca", "png"]

        if (!fs.existsSync(obiect.cale_galerie + "/mediu/")) {
            fs.mkdirSync(obiect.cale_galerie + "/mediu/");
        }

        if (!fs.existsSync(obiect.cale_galerie + "/mic/")) {
            fs.mkdirSync(obiect.cale_galerie + "/mic/");
        }

        elem.fisier_mediu = obiect.cale_galerie + "/mediu/" + numeFisier + ".webp";
        elem.fisier_mic = obiect.cale_galerie + "/mic/" + numeFisier + ".webp";
        elem.fisier = obiect.cale_galerie + "/" + elem.fisier;
        sharp(__dirname + "/" + elem.fisier).resize(dim_mediu).toFile(__dirname + "/" + elem.fisier_mediu);
        sharp(__dirname + "/" + elem.fisier).resize(dim_mic).toFile(__dirname + "/" + elem.fisier_mic);
    });
    console.log(obGlobal.imagini);
}
createImages();



//citeste json si intoarce toate erorile intr-un obiect ca sa le putem folosi
function createErrors() {
    var continutFisier = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf8");  //readFileSync, ReadFile nu returneaza un string, ci un buffer de octeti, deci la final trebuie sa punem toString() pentru a transforma incoding in utf8
    //console.log(continutFisier);
    obGlobal.erori = JSON.parse(continutFisier);
    //console.log(obErori.erori);
}
createErrors();

function renderError(res, identificator, titlu, text, imagine) {
    //in var eroare o sa primesc elementul cu identificatorul cautat
    var eroare = obGlobal.erori.info_erori.find(function (elem) { //in elem intra fiecare obiect din vectorul info_erori din erori.json
        //verificam pentru fiecare element daca e cel din parametru si returnam o valoare booleana, true/false 
        return elem.identificator == identificator;
    })
    titlu = titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
    text = text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
    imagine = imagine || (eroare && obGlobal.erori.cale_baza + "/" + eroare.imagine) || obGlobal.erori.cale_baza + "/" + obGlobal.erori.eroare_default.imagine;

    //eroare tip http
    //verific daca am status
    if (eroare && eroare.status) {
        //daca am status, trimit statusul si randez si pagina cu capmurile mele
        res.status(identificator).render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine });
    }
    else {
        res.render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine });
    }
}

app.get(["/", "/index", "/home"], function (req, res) {
    console.log("ceva");
    //res.sendFile(__dirname+ "/index.html");
    //res.write("nu stiu");
    //res.end();
    res.render("pagini/index", { ip: req.ip, ceva: 30, altceva: 20, imagini: obGlobal.imagini }); //object literal 
    //obGlobal.imagini = vector
});


//pentru produse
app.get(["/produse"], function (req, res) {
    console.log(req.query);
    client.query("select * from unnest(enum_range(null::categorie_produs))", function (err, rezCategorie) {

        //verificam daca exista proprietatea sau nu 
        continuareQuery = ""
        if (req.query.tip)
            continuareQuery += `and tip_produs='${req.query.tip}'`;  //"tip='"+req.query.tip+"'"

        client.query("select * from  produse where 1=1 " + continuareQuery, function (err, rez) {
            if (err) {
                console.log(err);
                renderError(res, 2); //in caz ca am gresit query-ul sau baza de date nu merge din varii motive, va da aceasta eroare (2 din erori.json)
            }
            else
                res.render("pagini/produse", { produse: rez.rows, optiuni: rezCategorie.rows });
        });
    });
});



app.post("/inregistrare", function (req, res) {
    var username;
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {//4
        console.log(campuriText);

        var eroare = "";

        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume;
            utilizNou.setareUsername = campuriText.username;
            utilizNou.email = campuriText.email
            utilizNou.prenume = campuriText.prenume

            utilizNou.parola = campuriText.parola;
            utilizNou.culoare_chat = campuriText.culoare_chat
            utilizNou.salvareUtilizator();
        }
        catch (e) {
            eroare += e.message;
            console.log(eroare);
        }

        if (!eroare) {   
                res.render("pagini/inregistrare", {raspuns:"Felicitari! Inregistrare cu succes!"});  

        }
        else
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
    });
    formular.on("field", function (nume, val) {  // 1 

        console.log(`--- ${nume}=${val}`);

        if (nume == "username")
            username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { //2
        console.log("fileBegin");

        console.log(nume, fisier);
        //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului

    })
    formular.on("file", function (nume, fisier) {//3
        console.log("file");
        console.log(nume, fisier);
    });
});



//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'

app.get("/cod:username/:token", function (req, res){
    console.log(req.params);   
    let u= new Utilizator()
});


//pentru produs
app.get(["/produs/:id"], function (req, res) {
    client.query("select * from produse where id=" + req.params.id, function (err, rez) {
        if (err) {
            console.log(err);
            renderError(res, 2); //in caz ca am gresit query-ul sau baza de date nu merge din varii motive, va da aceasta eroare (2 din erori.json)
        }
        else
            res.render("pagini/produs", { prod: rez.rows[0] });
    });
});




app.get('/favicon.ico', function (req, res) {

});


app.get("/*.ejs", function (req, res) {
    renderError(res, 403);
});


app.get("/*", function (req, res) {
    console.log("url:", req.url);
    //res.sendFile(__dirname+ "/index.html");
    //res.write("nu stiu");
    //res.end();                              //concateneaza url-ul si afiseaza pagina cautata
    res.render("pagini" + req.url, function (err, rezRandare) {
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                renderError(res, 404);
            }
            else {

            }
        }
        else {
            res.send(rezRandare);
        }
    });
});
console.log("Hello world!");

app.listen(8080);
console.log("Serverul a pornit!");