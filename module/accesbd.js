const { Client } = require("pg");


class AccesBD {
    static #instanta = null;
    static #initializat = false;

    constructor() {
        if (AccesBD.#instanta) {
            throw new Error("Deja a fost instantiat");
        }
        else if (!AccesBD.#initializat) {
            throw new Error("Trebuie apelat doar din getInstanta; fara sa fi aruncat vreo eroare");
        }
    }


    initLocal() {
        this.client = new Client({
            database: "site",
            user: "emma_cobzariu",
            password: "parola_1234_5678",
            host: "localhost",
            port: 5432
        });
        this.client.connect();
    }

    getClient() {
        if (!AccesBD.#instanta) {
            throw new Error("Nu a fost instantiata clasa");
        }
        return this.client;
    }



    static getInstanta({ init = "local" } = {}) {
        console.log(this); //this e clasa nu instanta pt ca e metoda statica
        if (!this.#instanta) {
            this.#initializat = true;
            this.#instanta = new AccesBD();
            try {
                switch (init) {
                    case "local": this.#instanta.initLocal();
                }
            }
            catch (e) {
                console.error("Eroare la initializarea bazei de date!");
            }
        }
        return this.#instanta;
    }

    select({ tabel = "", campuri = [], conditiiAnd = [] } = {}, callback) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;

        let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error(comanda);
        this.client.query(comanda, callback)
    }

    insert({ tabel = "", campuri = [], valori = [] } = {}, callback) {
        if (campuri.length != valori.length)
            throw new Error("Numarul de campuri difera de nr de valori")

        let comanda = `insert into ${tabel}(${campuri.join(",")}) values ( ${valori.join(",")})`;
        console.log(comanda);
        this.client.query(comanda, callback)
    }

    update({ tabel = "", campuri = [], valori = [], conditiiAnd = [] } = {}, callback) {
        if (campuri.length != valori.length)
            throw new Error("Numarul de campuri difera de nr de valori")
        let campuriActualizate = [];
        for (let i = 0; i < campuri.length; i++)
            campuriActualizate.push(`${campuri[i]}='${valori[i]}'`); //string-urile de forma camp=valoare, iau pe rand toate campurile si de pe exact aceeasi pozitie (i) valorile coresp.
        let conditieWhere = "";
        if (conditiiAnd.length > 0) //la conditiiWhere (asa am facut si la select), daca chiar am conditii ca poate e vectorul vid, si daca am atunci pun un where in conditieWhere si fac un join dupa el: ${conditiiAnd.join(" and ")} pentru ca asa cum am facut query builder, pot sa am doar conditii legate cu and (dar nu e obligatoriu, mai exista o varianta: video1 9:00)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;  //virgula pentru string pentru camp-valoare la join
        let comanda = `update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback) //aici apelez normal cu client query, clientul fiind ala de SQL din AccesBD(unde definim la inceput database, user, password etc)
    }

    delete({ tabel = "", conditiiAnd = [] } = {}, callback) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;

        let comanda = `delete from ${tabel} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback)
    }
}


module.exports = AccesBD;