const AccesBD=require('./accesbd.js');
const crypto=require("crypto");
const nodemailer=require("nodemailer");
const parole = require('./parole.js');
const {RolFactory} = require('./roluri.js');


class Utilizator{
    static tipConexiune="local";
    static tabel="utilizatori";
    static parolaCriptare="prlCript";
    static lungimeCod = 64;
    static emailServer = "emma.elena.cobzariu2023@gmail.com";
    static numeDomeniu="localhost:8080";
    #eroare;

    constructor({id, username, nume, prenume, email, parola, rol, culoare_chat="black", poza}={}) {
        this.id=id;
        //optional acest try catch in constructor
        try{
            if(this.checkUsername(username))
                this.username = username;
            }
            catch(e){ this.#eroare=e.message}
            try{
                if(this.checkName(nume))
                    this.nume = nume;
                }
                catch(e){ this.#eroare=e.message}

                //ia toate proprietatile la rand din {} de la constructor si o sa le puna in this
        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop] //cu valorile lor ca zic arguments[0] adica obiectul primit ca parametru de [prop]
        }

        //astea dispar pentru ca am for-ul de mai sus
        // this.prenume = prenume;
        // this.email = email;
        // this.parola = parola;
        // this.rol=rol; //TO DO clasa Rol
        // this.culoare_chat=culoare_chat;
        // this.poza=poza;


        if(this.rol)
            this.rol=this.rol.cod? RolFactory.creeazaRol(this.rol.cod):  RolFactory.creeazaRol(this.rol);
        console.log(this.rol);

        this.#eroare="";
    }

    checkName(nume){ //returneaza un boolean
        //ma intai verifica daca e nenul
        return nume!= ""
    }

    set setareNume(nume){
        if (this.checkName(nume))
        this.nume = nume;
        else{
            throw new Error("Nume incorect")
        }
    }

    checkUsername(username){ 
        return username!= ""
    } 

    // folosit doar la inregistrare si modificare profil 
    set setareUsername(username){
        if (this.checkUsername(username))
        this.username = username;
        else{
            throw new Error("Username incorect")
        }    
    }

    //aici practic export functia ca sa o folosesc si in alte locuri
    static criptareParola(parola){
       return crypto.scryptSync(parola,Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }

    salvareUtilizator(){
        let parolaCriptata=Utilizator.criptareParola(this.parola);
        let utiliz=this;
        let token=parole.genereazaToken(100);

        AccesBD.getInstanta(Utilizator.tipConexiune).insert({tabel:Utilizator.tabel,campuri:["username","nume","prenume","parola","email","culoare_chat","cod","poza"],valori:[`'${this.username}'`,`'${this.nume}'`,`'${this.prenume}'`,`'${parolaCriptata}'`,`'${this.email}'`,`'${this.culoare_chat}'`,`'${token}'`,`'${this.poza}'`]}, function(err, rez){
            if(err) 
                console.log(err);
                
            utiliz.trimiteMail("Gata! Te-ai inregistrat cu succes","Username-ul este "+utiliz.username,
            `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`,
            )
        });
    }
   

    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]){
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:Utilizator.emailServer,
                pass:"lmghgmepfokpzhrp"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html
        await transp.sendMail({
            from:Utilizator.emailServer,
            to:this.email, //TO DO
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }


    static async  getUtilizDupaUsernameAsync(username){ //nu ii mai dau parametrii pentru callback si respectiv callback-ul pentru ca pot sa folosesc rezultatul returnat de functie direct in codul apelant daca e functie asincrona
            if(!username) return null; 
            try{
                let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                    {tabel:"utilizatori", 
                    campuri:["*"], 
                    conditiiAnd:[`username='${username}'`]
                });
                if(rezSelect.rowCount!=0){
                    return new Utilizator(rezSelect.rows[0])
                }
                else {
                    console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul"); 
                    return null
                };
            }
            catch(e){
               console.log(e); 
               return null;  //daca esueaza functia, nu va returna nimic; esueaza cand select-ul scris de noi are o eroare de sinaxa/ username-ul are o val dubioasa pe care BD nu o intelege
            }

    }


    //trimit username ca sa imi creeze acel u, trimit proceseazaUtiliz adica callback ca sa il apelez cu u-ul creat de el si cu eventualii parametrii pe care ii mai pun in obparam
    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz){ //selecteaza doar dupa username utilizatorul din BD si returneaza toate proprietatile, inclusiv parola aia criptata pe care o sa o folosim in mom in care vrem sa verificam ca e acel utilizator
        if(!username) return null; 
        let eroare = null;
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:"utilizatori", 
        campuri:["*"], 
        conditiiAnd:[`username='${username}'`]}, 
        function(err, rezSelect){ //utilizatorul se creaza aici si se apeleaza mult dupa ce s-a creat functia asta de mai sus cu getUtilizatorDupaUsername
                if(err){ //eroare BD
                    console.error("Utilizator:", err);  
                    console.log("Utilizator", rezSelect.rows.length);
                    eroare = -2;
                }
                else if(rezSelect.rowCount==0){ //nu e vorba de select, eroare ca nu a gasit utilizatorul
                    eroare = -1;
                }
                let u = new Utilizator(rezSelect.rows[0])
                // ({
                    
                //     //dupa for-ul de la inceput care itereaza prin toate elementele constructorului, poate sa nu ne mai intereseze fiecare camp in parte pentru ca el oricum o sa faca asocierea chiar daca nu le dau in aceeasi ordine 
                //     id:rezSelect.rows[0].id,   //u il creez in functia callback => rezolvam tot cu o functie callback, singura metoda prin care ii spunem ce sa faca cu utilizatorul
                //     username:rezSelect.rows[0].username, 
                //     nume:rezSelect.rows[0].nume, 
                //     prenume:rezSelect.rows[0].prenume, 
                //     email:rezSelect.rows[0].email, 
                //     parola:rezSelect.rows[0].parola, 
                //     rol:rezSelect.rows[0].rol, 
                //     culoare_chat:rezSelect.rows[0].culoare_chat,
                //     poza:rezSelect.rows[0].poza})
                    proceseazaUtiliz(u, obparam, eroare);  
        });
    }   

//verific daca are dreptul (completari 1 2:56:00)
    areDreptul(drept){
        return this.rol.areDreptul(drept);
    }
}

//getUtilizDupaUsername apeleaza o metoda select, in AccesBD este cu un client.query care este async, nu este sincrona functia pentru ca ea are apelul asta catre baza de date si eu nu pot sa returnez utilizatorul pt ca in primul rand il calculez intr-o alta functie
module.exports={Utilizator:Utilizator}