const express = require("express");
const fs = require("fs"); //acest pachet vine la pachet cand am instalat node

const sharp = require("sharp"); //pentru redimensionarea imaginilor din cod
const ejs = require("ejs");
const sass = require("sass");
const { Client } = require("pg");  //{nume de variabila} 
const formidable = require("formidable"); //pentru fisiere
//nu body parser pentru formulare simple cu inputuri gen checkbox, radiobutton, text etc; tot ce e de tip file intra in campuriFisier
const session = require('express-session');
const path=require('path');



const { Utilizator } = require("./module/utilizator.js")
const AccesBD = require("./module/accesbd.js");
const utilizator = require("./module/utilizator.js");
const Drepturi = require("./module/drepturi.js");

var instantaBD = AccesBD.getInstanta({ init: "local" });
var client = instantaBD.getClient();

app = express(); //cream server

//tratez proprietatea body din cadrul fetch-ului si il pun sa il vada ca pe un obiect, nu ca pe un string cu express.json
app.use(["/produse_cos","/cumpara"],express.json({limit:'2mb'}));//obligatoriu de setat pt request body de tip json


//creare foldere necesare (populate de aplicatie si utilizator)
foldere=["temp", "poze_uploadate"]; //lista cu folderele
for (let folder of foldere){
    let calefolder=path.join(__dirname,folder);
    if (!fs.existsSync(calefolder)) //daca nu exista folderul il creaza, dar nu strica codul cu nimic aceasta bucata daca folderul exista deja pt ca nu intra in if
        fs.mkdirSync(calefolder);
}



//apeleaza session pe care il exporta modulul si primeste un obiect cu configuratii si aici ii spun cum sa imi creeze aceasta sesiune
app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    //un fel de parola de sesiune cu care cripteaza datele sesiunii
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));

app.set("view engine", "ejs"); //ca sa putem folosi ejs, ejs pentru template, restul de pagini ca sa nu facem copy-paste pentru meniu
console.log("Cale proiect: ", __dirname);  //__dirname este folderul proiectului
app.use("/resurse", express.static(__dirname + "/resurse")); //numai caile care incep cu /resurse sa fie tratate ca fisiere statice
//primul e cerere facuta de browser, index.html
//al doilea e folderul 


app.use("node_modules", express.static(__dirname + "/node_modules")); //bootstrap?

app.use("poze_uploadate", express.static(__dirname + "/poze_uploadate")); //asa l-am facut static

var optiuniPentruMeniu = "ceva!";


//    /* se aplica pentru orice query
app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = optiuniPentruMeniu;
    res.locals.Drepturi=Drepturi;
    //aici in res.locals.utilizator il pun pe ala din sesiune => acum o sa se transmita catre toate paginile
    
    
    
    //din sesiune ia utilizatorul si ii pun obiectul asociat intr-o propr noua a requestului req.utilizator
    if(req.session.utilizator){ //utilizator logat, creez un camp utilizator care chiar e obiectul utilizator, nu doar proprietatile lui salvate in session; il setez si in locals ca sa am acces la el pe toate paginile
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator); //o sa fie chiar un obiect de tip utilizator
        
        // console.log("req.utilizator:", req.utilizator);
        // console.log("Locals:", res.locals.utilizator);
        // console.log("Rol", req.utilizator.rol);
        // console.log("!!!!!!!!", req.utilizator.areDreptul(Drepturi.vizualizareUtilizatori));
    }
    // console.log("+++++", req.session.utilizator);




    next(); //trece mai departe cu res.locals imbogatit mai sus
});


//app.get daca avem /ceva, e doar /ceva
//app.use ca sa mearga inclusiv pentru accesari de tip post, poate vreau sa retin cand da sumbit unui formular de ex, app.get numai pentru accesari de tip get; putem sa avem mai multe /
//app.all la fel ca app.use, doar ca app.use nu vede tot url
app.all("/*", function(req, res, next){
    //verific daca exista utilizatorul si daca da, ii preiau id-ul
    let id_utiliz=req?.session?.utilizator?.id;
    id_utiliz=id_utiliz?id_utiliz:null; //daca e ceva in el, ramane chiar el
    AccesBD.getInstanta().insert({//inserez in tabel detaliile, data_accesare nu apare aici pentru ca are setat default timpul curent iar id e serial, cu auto-increment
       tabel:"accesari",
       campuri:["ip", "user_id", "pagina"],
       valori:[`'${getIp(req)}'`, `${id_utiliz}`, `'${req.url}'`]
       }, function(err, rezQuery){
           console.log(err);
       }
   )
    next(); //il trimite mai departe la app.get-ul care s-ar potrivi cu cerera utilizatorului
});



function stergeAccesariVechi(){
    AccesBD.getInstanta().delete({ tabel : "accesari", 
    conditiiAnd : [" now()-data_accesare >= interval '15 minutes'"]}, 
    function(err, rez) {//la delete rezultatul spune cate randuri a sters si nu ne intereseaza
        console.log(err);
    })
}


//apelam aceasta functie cand pornim serverul si stergem accesarile vechi
stergeAccesariVechi();

//la fiecare 15 minute sa repetam procedeul
setInterval(stergeAccesariVechi, 15*60*1000);


//verific x-forwarded-for; pentru cine am forwardat mesajul
function getIp(req){//pentru Heroku/Render
    var ip = req.headers["x-forwarded-for"];//ip-ul userului pentru care este forwardat mesajul
    if (ip){
        let vect=ip.split(","); //split pentru ca e posibil sa fi trecut prin mai multe dispozitive care au facut forward
        return vect[vect.length-1]; //din tot, noi luam ultimul ip
    }
    else if (req.ip){ //aici daca nu obtin ip-ul de mai sus
        return req.ip;
    }
    else{
     return req.connection.remoteAddress; //pot sa iau si de aici, din aceasta propr dar e foarte putin probabil. Asa ne asiguram ca indiferent de versiunea Node, suntem asigurati
    }
}




// {
// (function(a){console.log("in functie", a)})(10);
// //aici am definit o functie si am si apelat-o
// (async function(){
// let u = await Utilizator.getUtilizDupaUsernameAsync("abc");
// console.log("User async: ", u);
// })()
// }


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

app.get(["/", "/index", "/home", "/login"], function (req, res) {
    console.log("ceva");
    console.log(req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse));
    //res.sendFile(__dirname+ "/index.html");
    //res.write("nu stiu");
    //res.end();
    let sir = req.session.succesLogin;
    req.session.succesLogin=null; //dupa ce l-am folosit, i-am dat render, il fac inapoi nul

   
   client.query("select username, nume, prenume from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '15 minutes')",   //face conversia din minute in milisecunde el singur
    function(err, rez){ //rez nu e setat daca e setata eroarea
        let useriOnline=[]; 
        if(!err && res.rowCount!=0) //res.rowCount!=0 adica vine ceva din baza de date, am niste inregistrari
            useriOnline=rez.rows; //punem acele inregistrari; ma asigur ca e tot timpul vector

            //randam pagina dupa ce primim un rezultat de la client.query
        res.render("pagini/index", { ip: req.ip, ceva: 30, altceva: 20, imagini: obGlobal.imagini, succesLogin:sir, useriOnline:useriOnline}); //object literal 
    });   
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
    var username; //variabila definita la nivel de functie
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {//4
        console.log("Inregistrare: ", campuriText);
        console.log(campuriFisier);
        var eroare = "";

        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume;
            utilizNou.setareUsername = campuriText.username;
            utilizNou.email = campuriText.email;
            utilizNou.prenume = campuriText.prenume;

            utilizNou.parola = campuriText.parola;
            utilizNou.culoare_chat = campuriText.culoare_chat;
            utilizNou.poza= campuriFisier.poza.originalFilename;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru, eroareUser){
                if (eroareUser==-1){ //nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Acest username exista deja";
                }

                if (!eroare) {   
                    res.render("pagini/inregistrare", {raspuns:"Felicitari! Inregistrare cu succes!"});  
                }
                else
                    res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
                })
           
        }
        catch (e) {
            console.log(e.message);
            eroare += "Eroare site. Reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare })
        }


    });
    formular.on("field", function (nume, val) {  // 1 

        console.log(`--- ${nume}=${val}`);

        if (nume == "username")
            username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { //2
        console.log("fileBegin");

        console.log(nume, fisier);
        
        //in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser = path.join(__dirname, "poze_uploadate", username);
        console.log(folderUser);
        if(!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
    })
    formular.on("file", function (nume, fisier) {//3
        console.log("file");
        console.log(nume, fisier);
    });
});



app.post("/login", function (req, res) {
    var username;
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {
        Utilizator.getUtilizDupaUsername(campuriText.username,{
            //acesti parametrii sunt din obparam pe care pot sa il mai imbogatesc dupa   
            req:req,
            res:res,
            parola:campuriText.parola}, 
                function(u, obparam){
                    //obtin parola criptata iar acum utilizatorul este setat la username-ul cerut
                    let parolaCriptata=Utilizator.criptareParola(obparam.parola);

                    //aici verificam daca utilizatorul are acceasi parola cu cea criptata
                    if(u.parola==parolaCriptata && u.confirmat_mail){ //daca parolele(cea introdusa la login cu cea la inregistrare) sunt egale vreau sa imi salvez utilizatorul in request session + && u.confirmat_mail care verifica daca e confirmat mail-ul
                        //
                        u.poza=u.poza?path.join("poze_uploadate",u.username,u.poza):"/resurse/imagini/login.png";
                        
                        obparam.req.session.utilizator = u; //l-am salvat pe utilizator in sesiune
                        obparam.req.session.succesLogin="Felicitari! Te-ai logat!";
                        obparam.res.redirect("/index");
                        //obparam.res.redirect("/login");
                        obparam.req.session.succesLogin="Felicitari! Te-ai logat!";
                    }
                    //daca nu se logheaza bine trimit mesajul asta de eroare si nu salvez nimic
                    else{
                        obparam.res.render("pagini/loginpage", {eroareLogin:"Date logare incorecte sau nu ati confirmat mail-ul!", imagini:obGlobal.imagini})
                    }
                })
    })
});


app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        randeazaEroare(res,403,)
        res.render("pagini/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }

    
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola);
        AccesBD.getInstanta().update(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat"],
            valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
            conditiiAnd:[`parola='${parolaCriptata}'`]
        },  function(err, rez){
            if(err){
                console.log(err);
                randeazaEroare(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume;
                req.session.utilizator.prenume= campuriText.prenume;
                req.session.utilizator.email= campuriText.email;
                req.session.utilizator.culoare_chat= campuriText.culoare_chat;
                res.locals.utilizator=req.session.utilizator;
            }
 
 
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});

// Admistrare utilizatori
app.get("/useri", function(req, res){
   


    //req?.utilizator?  daca utilizatorul curent din request utilizator, apoi verific daca are metoda areDreptul si dupa verific daca o pot apela cu dreptul vizualizareUtilizatori
    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){ //selectez pe toata lumea
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows}); //apoi randez cu userii din rezQuery
        });
    }
    else{
        renderError(res, 403);
    }
});


app.post("/sterge_utiliz", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){ //verific daca are dreptul sa stearga utilizatori si abia dupa preiau datele din formular; daca foloseste postman sa intre altfel ii va da eroare 403
        var formular= new formidable.IncomingForm();


        formular.parse(req,function(err, campuriText, campuriFile){
           
                AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        renderError(res,403);
    }
})






app.get("/logout", function(req, res){
    req.session.destroy(); //distruge obiectul cu sesiunea, adica cu datele utilizatorului salvate; la fiecare cerere luam utilizatorul din sesiune si il punem in locals 
    res.locals.utilizator=null; //seteaza utilizatorul din locals sa fie nul
    res.render("pagini/logout"); // ma trimite catre o pagina care ma anunta ca m-am delogat
});


//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'

app.get("/cod/:username/:token", function (req, res){
    console.log(req.params);
    try{
    Utilizator.getUtilizDupaUsername(req.params.username, {res:res, token:req.params.token}, function(u, obparam){
    AccesBD.getInstanta().update(
        {tabel : "utilizatori", 
        campuri: ['confirmat_mail'], 
        valori:['true'], 
        conditiiAnd : [`cod='${obparam.token}'`]}, 
        function(err, rezUpdate){
            if(err || rezUpdate.rowCount==0){
               console.log("Cod:", err);
                renderError(res,3); //il trimite pe pagina de eroare daca nu e corect
            }
            
            else{
                res.render("pagini/confirmare.ejs"); //intra pe confirmare.ejs
            }
        })
    })
    }
    catch(e){
        console.log(e);
        renderError(res,2); 
    }
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


//Cos virtual

//- pentru a primi date pentru produsele din cosul virtual:
app.post("/produse_cos",function(req, res){
    console.log(req.body);//ce era in fetch
    if(req.body.ids_prod.length!=0){
        //TO DO : cerere catre AccesBD astfel incat query-ul sa fi `select nume, descriere, pret, gramaj, imagine from produse where id in (lista de id-uri)`
        AccesBD.getInstanta().select({tabel:"produse", campuri:"nume,descriere,pret,gramaj,imagine".split(","), conditiiAnd:[`id in (${req.body.ids_prod})`]},
        function(err,rez){
            if(err)
                res.send([]);
            else
                res.send(rez.rows);
        });
    }
    else{
        res.send([]);
    }


});




app.get('/favicon.ico', function (req, res) {
 res.sendFile(__dirname+"/resurse/ico/favicon.ico")
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