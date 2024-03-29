const express = require("express");
const fs = require("fs"); //acest pachet vine la pachet cand am instalat node

const sharp = require("sharp"); //pentru redimensionarea imaginilor din cod
const ejs = require("ejs");
const sass = require("sass");
const { Client } = require("pg");  //{nume de variabila} 
const formidable = require("formidable"); //pentru fisiere
//nu body parser pentru formulare simple cu inputuri gen checkbox, radiobutton, text etc; tot ce e de tip file intra in campuriFisier
const session = require('express-session');
const path = require('path');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const mongodb = require('mongodb');

const helmet = require('helmet');
const xmljs = require('xml-js');


const { Utilizator } = require("./module/utilizator.js")
const AccesBD = require("./module/accesbd.js");
const utilizator = require("./module/utilizator.js");
const Drepturi = require("./module/drepturi.js");

var instantaBD = AccesBD.getInstanta({ init: "local" });
var client = instantaBD.getClient();

app = express(); //cream server
app.use(["/forum"], express.urlencoded({extended:true}));
//tratez proprietatea body din cadrul fetch-ului si il pun sa il vada ca pe un obiect, nu ca pe un string cu express.json
app.use(["/produse_cos", "/produse_favorite", "/cumpara"], express.json({ limit: '2mb' }));//obligatoriu de setat pt request body de tip json


//creare foldere necesare (populate de aplicatie si utilizator)
foldere = ["temp", "poze_uploadate"]; //lista cu folderele
for (let folder of foldere){
    let calefolder = path.join(__dirname, folder);
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


app.use(helmet.frameguard());  //acum site-ul nu se va mai putea deschide in iframe


app.set("view engine", "ejs"); //ca sa putem folosi ejs, ejs pentru template, restul de pagini ca sa nu facem copy-paste pentru meniu
console.log("Cale proiect: ", __dirname);  //__dirname este folderul proiectului
app.use("/resurse", express.static(__dirname + "/resurse")); //numai caile care incep cu /resurse sa fie tratate ca fisiere statice
//primul e cerere facuta de browser, index.html
//al doilea e folderul 


app.use("node_modules", express.static(__dirname + "/node_modules")); //bootstrap?

app.use("/poze_uploadate", express.static(__dirname + "/poze_uploadate")); //asa l-am facut static

var optiuniPentruMeniu = "ceva!";




obGlobal = {
    erori: null,
    imagini: null,
    optiuniPentruMeniu: null,

    //ca sa imi creez calea pe bucatele
    protocol: "http://",
    numeDomeniu: "localhost:8080",


    clientMongo: mongodb.MongoClient,
    bdMongo: null

}




//var url = "mongodb://localhost:27017";//pentru versiuni mai vechi de Node
var url = "mongodb://127.0.0.1:27017";
//var url = "mongodb://0.0.0.0:27017";
//console.log("=====================================================================");
const config = {
    connectTimeoutMS: 1000,
    useUnifiedTopology: true,
    socketTimeoutMS: 1000
    }
obGlobal.clientMongo.connect(url, function (err, bd) {  //ma conectez la url-ul dat 
    if (err) 
        console.log("Eroare: ",err);
    else {
        console.log("Conexiune Mongo !!!!!!!!!!!!!!!!!!!!!!!!!!!");
        obGlobal.bdMongo = bd.db("site"); //setez baza de date curenta
        
    }
});

// setTimeout(function(){
//     obGlobal.bdMongo.collection("facturi").find({}).toArray(function (err, res){
//         console.log(err);
//         console.log(res);
//     });
// }, 1000);



//    /* se aplica pentru orice query
app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = optiuniPentruMeniu;
    res.locals.Drepturi = Drepturi;
    //aici in res.locals.utilizator il pun pe ala din sesiune => acum o sa se transmita catre toate paginile



    //din sesiune ia utilizatorul si ii pun obiectul asociat intr-o propr noua a requestului req.utilizator
    if (req.session.utilizator) { //utilizator logat, creez un camp utilizator care chiar e obiectul utilizator, nu doar proprietatile lui salvate in session; il setez si in locals ca sa am acces la el pe toate paginile
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator); //o sa fie chiar un obiect de tip utilizator

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


//UPDATE, nu mai inseram in BD decat in anumite situatii pt ca chinuie BD (atacuri DOS)

// app.all("/*", function(req, res, next){
//     //verific daca exista utilizatorul si daca da, ii preiau id-ul
//     let id_utiliz=req?.session?.utilizator?.id;
//     id_utiliz=id_utiliz?id_utiliz:null; //daca e ceva in el, ramane chiar el
//     AccesBD.getInstanta().insert({//inserez in tabel detaliile, data_accesare nu apare aici pentru ca are setat default timpul curent iar id e serial, cu auto-increment
//        tabel:"accesari",
//        campuri:["ip", "user_id", "pagina"],
//        valori:[`'${getIp(req)}'`, `${id_utiliz}`, `'${req.url}'`]
//        }, function(err, rezQuery){
//            console.log(err);
//        }
//    )
//     next(); //il trimite mai departe la app.get-ul care s-ar potrivi cu cerera utilizatorului
// });



//facem asa


//obiect cu ipurile active
//ip-uri active= cele care au facut o cerere de curand
//cheia e de forma ip|url iar valoarea e un obiect de forma {nr:numar_accesari, data:data_ultimei accesari}

var ipuri_active = {}; //user activ in momentul respectiv


app.all("/*", function (req, res, next) { //all pt toate tipurile de cereri
    let ipReq = getIp(req); //obtin ip-ul 
    let ip_gasit = ipuri_active[ipReq + "|" + req.url]; //il folosesc ip-ul si il pun concatenat(cu |) cu pagina pe care o cere ca sa vad de unde e pb
    //[ipReq+"|"+req.url]; asta va fi cheia intr-un dictionar ipuri_active(numele proprietatii)

    timp_curent = new Date();
    if (ip_gasit) { //verific daca aceasta cerere este in timpul limita pe care l-am impus 


        //ip_gasit obiect cu doua propr: data ultimei accesari a acelei pagini si de cate ori a accesat acea pagina in intervalul de 10 secunde
        if ((timp_curent - ip_gasit.data) < 10000) {//diferenta e in milisecunde; verific daca ultima accesare a fost pana in 10 secunde
            if (ip_gasit.nr > 15) {//mai mult de 10 cereri 
                res.send("<h1>Foarte multe cereri intr-un interval de timp prea scurt!</h1>");
                ip_gasit.data = timp_curent
                return;
            }
            else {  //nu am depasit numarul de cereri maxim

                ip_gasit.data = timp_curent; //setez data ultimei cereri
                ip_gasit.nr++; //cresc numarul de cereri
            }
        }
        else { //daca nu a mai accesat pagina mea de 10 secunde, consider ca e un user normal
            //console.log("Resetez: ", req.ip+"|"+req.url, timp_curent-ip_gasit.data)
            ip_gasit.data = timp_curent; //setez din nou timpul curent, timpul cererii 
            ip_gasit.nr = 1;//a trecut suficient timp de la ultima cerere; resetez
        }
    }


    //altfel ii fac o noua inregistrare
    else {
        ipuri_active[ipReq + "|" + req.url] = { nr: 1, data: timp_curent }; //cu numar de accesari 1
        //console.log("am adaugat ", req.ip+"|"+req.url);
        //console.log(ipuri_active);        

    }

    //aici inseram
    let comanda_param = `insert into accesari(ip, user_id, pagina) values ($1::text, $2,  $3::text)`;
    //console.log(comanda);
    if (ipReq) {
        var id_utiliz = req.session.utilizator ? req.session.utilizator.id : null;
        //console.log("id_utiliz", id_utiliz);
        client.query(comanda_param, [ipReq, id_utiliz, req.url], function (err, rez) {
            if (err) console.log(err);
        });
    }
    next();
});









function stergeAccesariVechi() {
    AccesBD.getInstanta().delete({
        tabel: "accesari",
        conditiiAnd: [" now()-data_accesare >= interval '15 minutes'"]
    },
        function (err, rez) {//la delete rezultatul spune cate randuri a sters si nu ne intereseaza
            console.log(err);
        })
}


//apelam aceasta functie cand pornim serverul si stergem accesarile vechi
stergeAccesariVechi();

//la fiecare 15 minute sa repetam procedeul
setInterval(stergeAccesariVechi, 15 * 60 * 1000);


//verific x-forwarded-for; pentru cine am forwardat mesajul
function getIp(req) {//pentru Heroku/Render
    var ip = req.headers["x-forwarded-for"];//ip-ul userului pentru care este forwardat mesajul
    if (ip) {
        let vect = ip.split(","); //split pentru ca e posibil sa fi trecut prin mai multe dispozitive care au facut forward
        return vect[vect.length - 1]; //din tot, noi luam ultimul ip
    }
    else if (req.ip) { //aici daca nu obtin ip-ul de mai sus
        return req.ip;
    }
    else {
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


// instantaBD.select({campuri:["nume","pret"],tabel:"produse", conditiiAnd:["pret>10", "pret<20"]}, function(err, rez){

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



function creazaGalerieImagini() {
    var continutulDinFisier = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf8");   //fs e modulul cu care facem chestii cu fisierul: ex citire, scriere
    var obiect = JSON.parse(continutulDinFisier);
    var dim_mediu = 200;
    var dim_mic = 100;

    obGlobal.imagini = obiect.imagini;

    obGlobal.imagini.forEach(function (elem) {
        [nume, extensieImagine] = elem.fisier.split(".")  //"briose-frisca.png" -> ["briose-frisca", "png"]

        if (!fs.existsSync(obiect.cale_galerie + "/mediu/")) {
            fs.mkdirSync(obiect.cale_galerie + "/mediu/");
        }

        if (!fs.existsSync(obiect.cale_galerie + "/mic/")) {
            fs.mkdirSync(obiect.cale_galerie + "/mic/");
        }

        elem.fisier_mediu = obiect.cale_galerie + "/mediu/" + nume + ".webp";
        elem.fisier_mic = obiect.cale_galerie + "/mic/" + nume + ".webp";
        elem.fisier = obiect.cale_galerie + "/" + elem.fisier;
        sharp(__dirname + "/" + elem.fisier).resize(dim_mediu).toFile(__dirname + "/" + elem.fisier_mediu);
        sharp(__dirname + "/" + elem.fisier).resize(dim_mic).toFile(__dirname + "/" + elem.fisier_mic);
    });
    console.log(obGlobal.imagini);
}
creazaGalerieImagini();



//citeste json si intoarce toate erorile intr-un obiect ca sa le putem folosi
function creeazaEroarea() {
    var continutulDinFisier = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf8");  //readFileSync, ReadFile nu returneaza un string, ci un buffer de octeti, deci la final trebuie sa punem toString() pentru a transforma incoding in utf8
    //console.log(continutulDinFisier);
    obGlobal.erori = JSON.parse(continutulDinFisier);
    //console.log(obErori.erori);
}
creeazaEroarea();

function randeazaError(res, identificator, titlu, text, imagine) {
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
    req.session.succesLogin = null; //dupa ce l-am folosit, i-am dat render, il fac inapoi nul


    client.query("select username, nume, prenume from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '15 minutes')",   //face conversia din minute in milisecunde el singur
        function (err, rez) { //rez nu e setat daca e setata eroarea
            let useriOnline = [];
            if (!err && res.rowCount != 0) //res.rowCount!=0 adica vine ceva din baza de date, am niste inregistrari
                useriOnline = rez.rows; //punem acele inregistrari; ma asigur ca e tot timpul vector

            //randam pagina dupa ce primim un rezultat de la client.query
            res.render("pagini/index", { ip: req.ip, ceva: 30, altceva: 20, imagini: obGlobal.imagini, succesLogin: sir, useriOnline: useriOnline }); //object literal 
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
                randeazaError(res, 2); //in caz ca am gresit query-ul sau baza de date nu merge din varii motive, va da aceasta eroare (2 din erori.json)
            }
            else
                res.render("pagini/produse", { produse: rez.rows, optiuni: rezCategorie.rows });
        });
    });
});






cale_qr = "./resurse/imagini/qrcode"; //care relativa pentru qrcode in resurse/imagini
if (fs.existsSync(cale_qr))//daca exista calea catre qrcode 
    fs.rmSync(cale_qr, { force: true, recursive: true });  //o sterg pt ca vreau sa regenerez imaginile pt ca poate intre timp am sters/adaugat niste produse; faca asa ca sa nu scriu mai mult sa verific daca am adaugat un produs nou sau l-am sters
fs.mkdirSync(cale_qr);//creez sincron din nou folderul
client.query("select id from produse", function (err, rez) {
    for (let prod of rez.rows) {
        let cale_prod = obGlobal.protocol + obGlobal.numeDomeniu + "/produs/" + prod.id;  //ii creez calea catre pagina produsului unic
        //console.log(cale_prod);
        QRCode.toFile(cale_qr + "/" + prod.id + ".png", cale_prod); //toFile care primeste calea paginii respective(linkul http/https) si il transforma in imagine QR
    }
});



// app.post("/cumpara", function (req, res){
//     if(req?.session?.utilizator && req?.session?.utilizator?.areDreptul(Drepturi.cumparareProduse)){ 

//     }
// });

app.post("/cumpara", function (req, res) {
    console.log(req.body);
    console.log("Utilizator:", req?.utilizator);
    console.log("Utilizator:", req?.utilizator?.rol?.areDreptul?.(Drepturi.cumparareProduse));
    console.log("Drept:", req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse));
    if (req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse)) { //verific daca e utilizator logat si daca are dreptul de a cumpara si daca are generez factura, salvez in Mongo
        AccesBD.getInstanta().select({
            tabel: "produse",
            campuri: ["*"],
            conditiiAnd: [`id in (${req.body.ids_prod})`]
        }, function (err, rez) {
            if (!err && rez.rowCount > 0) {
                console.log("produse:", rez.rows);

                rez.rows.forEach(function (produs) {
                    const updateQuery = `UPDATE produse SET stoc = stoc - 1 WHERE id = ${produs.id}`;
                    client.query(updateQuery, function (err, rezultat) {
                      if (err) {
                        console.log("Eroare la actualizarea stocului:", err);
                      }
                    });
                  });

                //obtin factura
                let rezFactura = ejs.render(fs.readFileSync("./views/pagini/factura.ejs").toString("utf-8"), {
                    protocol: obGlobal.protocol,
                    domeniu: obGlobal.numeDomeniu,
                    utilizator: req.session.utilizator,
                    produse: rez.rows
                });
                console.log(rezFactura);
                let numeFis = `./temp/factura${(new Date()).getTime()}.pdf`;
                genereazaPdf(rezFactura, numeFis, function (numeFis) {
                    let mesajText = `Dragă ${req.session.utilizator.username}, aveti mai jos datele de facturare.\n
                    \nDatele dumneavoastra de facturare:
                    \nNume: ${req.body.nume}
                    \nPrenume: ${req.body.prenume}
                    \nOras: ${req.body.oras}
                    \nStrada: ${req.body.strada}
                    \nNumarul strazii: ${req.body.numarulStrada}
                    \nBloc: ${req.body.bloc || '-'}
                    \nScara: ${req.body.scara || '-'}
                    \nEtaj: ${req.body.etaj || '-'}
                    \nApartament: ${req.body.apartament || '-'}
                    \nNumar de telefon: ${req.body.nrtel}
                    \nInformatii suplimentare: ${req.body.suplimentare || '-'}`;
                    
                    let mesajHTML = `<h2>Dragă ${req.session.utilizator.username}, aveti mai jos datele de facturare.</h2><br>
                    <br>Datele dumneavoastra sunt:
                    <br>Nume: ${req.body.nume}
                    <br>Prenume: ${req.body.prenume}
                    <br>Oras: ${req.body.oras}
                    <br>Strada: ${req.body.strada}
                    <br>Numarul strazii: ${req.body.numarulStrada}
                    <br>Bloc: ${req.body.bloc || '-'}
                    <br>Scara: ${req.body.scara || '-'}
                    <br>Etaj: ${req.body.etaj || '-'}
                    <br>Apartament: ${req.body.apartament || '-'}
                    <br>Numar de telefon: ${req.body.nrtel}
                    <br>Informatii suplimentare: ${req.body.suplimentare || '-'}`;

                    req.utilizator.trimiteMail("Factura", mesajText, mesajHTML, [{
                        filename: "facturaCumparaturi.pdf",
                        content: fs.readFileSync(numeFis)
                    }]);
                    res.send("Totul a functionat bine!");
                });
                rez.rows.forEach(function (elem) { elem.cantitate = 1 });
                let jsonFactura = {
                    data: new Date(),
                    username: req.session.utilizator.username,
                    produse: rez.rows
                }
                let dateFacturare = {
                    nume: req.body.nume,
                    prenume: req.body.prenume,
                    oras: req.body.oras,
                    strada: req.body.strada,
                    numarulStrada: req.body.numarulStrada,
                    bloc: req.body.bloc || '-',
                    scara: req.body.scara || '-',
                    etaj: req.body.etaj || '-',
                    apartament: req.body.apartament || '-',
                    nrtel: req.body.nrtel,
                    suplimentare: req.body.suplimentare || '-'
                  };
                //inseram factura in mongo
                if (obGlobal.bdMongo) {
                    obGlobal.bdMongo.collection("facturi").insertOne({
                        data: new Date(),
                        username: req.session.utilizator.username,
                        produse: rez.rows,
                        dateFacturare: dateFacturare
                    }, function (err, rezmongo) {
                        if (err) {
                            console.log(err)
                        }else {
                            console.log("Am inserat factura in mongodb");

                        obGlobal.bdMongo.collection("facturi").find({}).toArray(
                            function (err, rezInserare) {
                                if (err) {
                                    console.log(err)
                                } else {
                                     console.log(rezInserare);
                                    }
                            });
                        }
                    })
                }
            }
        })
    }
    else {
        res.send("Nu aveti posibilitatea de a achiziționa produsele din cos daca nu sunteti autentificat pe site sau nu aveti dreptul de a face asta!");
    }

});



async function genereazaPdf(stringHTML, numeFis, callback) {
    const chrome = await puppeteer.launch();
    const document = await chrome.newPage();  //pentru engine am apelat metoda newPage care creeaza o fereastra noua pentru care am obtinut o referinta (acest document)
    console.log("inainte load")
    await document.setContent(stringHTML, { waitUntil: "load" });

    console.log("dupa load")
    await document.pdf({ path: numeFis, format: 'A4' });
    await chrome.close();
    if (callback)
        callback(numeFis);
}



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
            utilizNou.poza = campuriFisier.poza.originalFilename;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function (u, parametru, eroareUser) {
                if (eroareUser == -1) { //nu exista username-ul in BD
                    utilizNou.salvareDateUtilizatorNou();
                }
                else {
                    eroare += "Acest username exista deja";
                }

                if (!eroare) {
                    res.render("pagini/inregistrare", { raspuns: "Felicitari! Inregistrare cu succes!" });
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
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath = path.join(folderUser, fisier.originalFilename)
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
        Utilizator.getUtilizDupaUsername(campuriText.username, {
            //acesti parametrii sunt din obparam pe care pot sa il mai imbogatesc dupa   
            req: req,
            res: res,
            parola: campuriText.parola
        },
            function (u, obparam) {
                //obtin parola criptata iar acum utilizatorul este setat la username-ul cerut
                let parolaCriptata = Utilizator.criptareParola(obparam.parola);

                //verificam daca utilizatorul are acceasi parola cu cea criptata
                if (u.parola == parolaCriptata && u.confirmat_mail) { //daca parolele sunt egale si contul este confirmat
                    u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "/resurse/imagini/login.png";
                    obparam.req.session.utilizator = u; //l-am salvat pe utilizator in sesiune
                    obparam.req.session.succesLogin = "Felicitari! Te-ai logat!";
                    obparam.res.redirect("/index");
                } else { //daca parola este gresita
                    //adaugam 1 la numarul de incercari esuate pentru acest utilizator
                    if (!obparam.req.session.loginAttempts) {
                        obparam.req.session.loginAttempts = 1;
                    } else {
                        obparam.req.session.loginAttempts++;
                    }
                    //daca numarul de incercari a depasit 5, blocam contul pentru 5 minute
                    if (obparam.req.session.loginAttempts > 5) {
                        obparam.req.session.blocked = true;
                        obparam.req.session.blockedUntil = new Date().getTime() + 5 * 60 * 1000; //timpul actual + 5 minute exprimat in milisecunde
                        obparam.res.render("pagini/blockedpage", { imagini: obGlobal.imagini });
                    } else { //altfel afisam mesajul de eroare corespunzator
                        obparam.res.render("pagini/loginpage", { eroareLogin: "Date logare incorecte sau nu ati confirmat mail-ul!", imagini: obGlobal.imagini });
                    }
                }
            })
    })
});



// login simplu, fara dupa un numar de incercari sa blocheze utilizatorul
// app.post("/login", function (req, res) {
//     var username;
//     var formular = new formidable.IncomingForm()
//     formular.parse(req, function (err, campuriText, campuriFisier) {
//         Utilizator.getUtilizDupaUsername(campuriText.username,{
//             //acesti parametrii sunt din obparam pe care pot sa il mai imbogatesc dupa   
//             req:req,
//             res:res,
//             parola:campuriText.parola}, 
//                 function(u, obparam){
//                     //obtin parola criptata iar acum utilizatorul este setat la username-ul cerut
//                     let parolaCriptata=Utilizator.criptareParola(obparam.parola);

//                     //aici verificam daca utilizatorul are acceasi parola cu cea criptata
//                     if(u.parola==parolaCriptata && u.confirmat_mail){ //daca parolele(cea introdusa la login cu cea la inregistrare) sunt egale vreau sa imi salvez utilizatorul in request session + && u.confirmat_mail care verifica daca e confirmat mail-ul
//                         //
//                         u.poza=u.poza?path.join("poze_uploadate",u.username,u.poza):"/resurse/imagini/login.png";

//                         obparam.req.session.utilizator = u; //l-am salvat pe utilizator in sesiune
//                         obparam.req.session.succesLogin="Felicitari! Te-ai logat!";
//                         obparam.res.redirect("/index");
//                         //obparam.res.redirect("/login");
//                         obparam.req.session.succesLogin="Felicitari! Te-ai logat!";
//                     }
//                     //daca nu se logheaza bine trimit mesajul asta de eroare si nu salvez nimic
//                     else{
//                         obparam.res.render("pagini/loginpage", {eroareLogin:"Date logare incorecte sau nu ati confirmat mail-ul!", imagini:obGlobal.imagini})
//                     }
//                 })
//     })
// });


app.post("/profil", function (req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        randeazaError(res, 403,)
        res.render("pagini/eroare_generala", { text: "Nu sunteti logat." });
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {

        var parolaCriptata = Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {
                tabel: "utilizatori",
                campuri: ["nume", "prenume", "email", "culoare_chat"],
                valori: [`${campuriText.nume}`, `${campuriText.prenume}`, `${campuriText.email}`, `${campuriText.culoare_chat}`],
                conditiiAnd: [`parola='${parolaCriptata}'`]
            },
            function (err, rez) {
                if (err) {
                    console.log(err);
                    randeazaError(res, 2);
                    return;
                }
                console.log(rez.rowCount);
                if (rez.rowCount == 0) {
                    res.render("pagini/profil", { mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa." });
                    return;
                }
                else {
                    //actualizare sesiune
                    console.log("ceva");
                    req.session.utilizator.nume = campuriText.nume;
                    req.session.utilizator.prenume = campuriText.prenume;
                    req.session.utilizator.email = campuriText.email;
                    req.session.utilizator.culoare_chat = campuriText.culoare_chat;
                    res.locals.utilizator = req.session.utilizator;
                }


                res.render("pagini/profil", { mesaj: "Update-ul s-a realizat cu succes." });

            });


    });
});

// Admistrare utilizatori
app.get("/useri", function (req, res) {



    //req?.utilizator?  daca utilizatorul curent din request utilizator, apoi verific daca are metoda areDreptul si dupa verific daca o pot apela cu dreptul vizualizareUtilizatori
    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().select({ tabel: "utilizatori", campuri: ["*"] }, function (err, rezQuery) { //selectez pe toata lumea
            console.log(err);
            res.render("pagini/useri", { useri: rezQuery.rows }); //apoi randez cu userii din rezQuery
        });
    }
    else {
        randeazaError(res, 403);
    }
});


app.post("/sterge_utiliz", function (req, res) {
    if (req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)) { //verific daca are dreptul sa stearga utilizatori si abia dupa preiau datele din formular; daca foloseste postman sa intre altfel ii va da eroare 403
        var formular = new formidable.IncomingForm();


        formular.parse(req, function (err, campuriText, campuriFile) {

            AccesBD.getInstanta().delete({ tabel: "utilizatori", conditiiAnd: [`id=${campuriText.id_utiliz}`] }, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        randeazaError(res, 403);
    }
})




caleXMLMesaje="resurse/xml/forum.xml";
headerXML=`<?xml version="1.0" encoding="utf-8"?>`;
function creeazaXMlforumDacaNuExista(){
    if (!fs.existsSync(caleXMLMesaje)){
        let initXML={
            "declaration":{
                "attributes":{
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name":"forum",
                    "elements": [
                        {
                            "type": "element",
                            "name":"mesaje",
                            "elements":[]                            
                        }
                    ]
                }
            ]
        }
        let sirXml=xmljs.js2xml(initXML,{compact:false, spaces:4});//obtin sirul xml (cu taguri)
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje,sirXml);
        return false; //l-a creat
    }
    return true; //nu l-a creat acum
}


function parseazaMesaje(){
    let existaInainte=creeazaXMlforumDacaNuExista();
    let mesajeXml=[];
    let obJson;
    if (existaInainte){
        let sirXML=fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson=xmljs.xml2js(sirXML,{compact:false, spaces:4});
        

        let elementMesaje=obJson.elements[0].elements.find(function(el){
                return el.name=="mesaje"
            });
        let vectElementeMesaj=elementMesaje.elements?elementMesaje.elements:[];// conditie ? val_true: val_false
        console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        }))
        let mesajeXml=vectElementeMesaj.filter(function(el){return el.name=="mesaj"});
        return [obJson, elementMesaje,mesajeXml];
    }
    return [obJson,[],[]];
}


app.get("/forum", function(req, res){
    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareForum)) {
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();

    res.render("pagini/forum",{ utilizator:req.session.utilizator, mesaje:mesajeXml})
    } else {
        randeazaError(res, 4);
    }
});

app.post("/forum", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();
        
    let u= req.session.utilizator?req.session.utilizator.username:"anonim";
    let mesajNou={
        type:"element", 
        name:"mesaj", 
        attributes:{
            username:u, 
            data:new Date()
        },
        elements:[{type:"text", "text":req.body.mesaj}]
    };
    if(elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else 
        elementMesaje.elements=[mesajNou];
    console.log(elementMesaje.elements);
    let sirXml=xmljs.js2xml(obJson,{compact:false, spaces:4});
    console.log("XML: ",sirXml);
    fs.writeFileSync("resurse/xml/forum.xml",sirXml);
    
    res.render("pagini/forum",{ utilizator:req.session.utilizator, mesaje:elementMesaje.elements})  
    
});





app.get("/logout", function (req, res) {
    req.session.destroy(); //distruge obiectul cu sesiunea, adica cu datele utilizatorului salvate; la fiecare cerere luam utilizatorul din sesiune si il punem in locals 
    res.locals.utilizator = null; //seteaza utilizatorul din locals sa fie nul
    res.render("pagini/logout"); // ma trimite catre o pagina care ma anunta ca m-am delogat
});


//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'

app.get("/cod/:username/:token", function (req, res) {
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username, { res: res, token: req.params.token }, function (u, obparam) {
            AccesBD.getInstanta().update(
                {
                    tabel: "utilizatori",
                    campuri: ['confirmat_mail'],
                    valori: ['true'],
                    conditiiAnd: [`cod='${obparam.token}'`]
                },
                function (err, rezUpdate) {
                    if (err || rezUpdate.rowCount == 0) {
                        console.log("Cod:", err);
                        randeazaError(res, 3); //il trimite pe pagina de eroare daca nu e corect
                    }

                    else {
                        res.render("pagini/confirmare.ejs"); //intra pe confirmare.ejs
                    }
                })
        })
    }
    catch (e) {
        console.log(e);
        randeazaError(res, 2);
    }
});


//pentru produs
app.get(["/produs/:id"], function (req, res) {
    client.query("select * from produse where id=" + req.params.id, function (err, rez) {
        if (err) {
            console.log(err);
            randeazaError(res, 2); //in caz ca am gresit query-ul sau baza de date nu merge din varii motive, va da aceasta eroare (2 din erori.json)
        }
        else
            res.render("pagini/produs", { prod: rez.rows[0] });
    });
});


//Cos virtual

//- pentru a primi date pentru produsele din cosul virtual:
app.post("/produse_cos", function (req, res) {
    console.log(req.body);//ce era in fetch
    if (req.body.ids_prod.length != 0) {
        //TO DO : cerere catre AccesBD astfel incat query-ul sa fi `select nume, descriere, pret, gramaj, imagine from produse where id in (lista de id-uri)`
        AccesBD.getInstanta().select({ tabel: "produse", campuri: "nume,descriere,pret,gramaj,imagine".split(","), conditiiAnd: [`id in (${req.body.ids_prod})`] },
            function (err, rez) {
                if (err)
                    res.send([]);
                else
                    res.send(rez.rows);
            });
    }
    else {
        res.send([]);
    }


});






//- pentru a primi date pentru produsele din cosul virtual:
app.post("/produse_favorite", function (req, res) {
    console.log(req.body);//ce era in fetch
    if (req.body.ids_prod.length != 0) {
        //TO DO : cerere catre AccesBD astfel incat query-ul sa fi `select nume, descriere, pret, gramaj, imagine from produse where id in (lista de id-uri)`
        AccesBD.getInstanta().select({ tabel: "produse", campuri: "nume,descriere,pret,gramaj,imagine".split(","), conditiiAnd: [`id in (${req.body.ids_prod})`] },
            function (err, rez) {
                if (err)
                    res.send([]);
                else
                    res.send(rez.rows);
            });
    }
    else {
        res.send([]);
    }


});


























app.get('/favicon.ico', function (req, res) {
    res.sendFile(__dirname + "/resurse/ico/favicon.ico")
});


app.get("/*.ejs", function (req, res) {
    randeazaError(res, 403);
});


app.get("/*", function (req, res) {
    console.log("url:", req.url);
    //res.sendFile(__dirname+ "/index.html");
    //res.write("nu stiu");
    //res.end();                              //concateneaza url-ul si afiseaza pagina cautata
    res.render("pagini" + req.url, function (err, rezRandare) {
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                randeazaError(res, 404);
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