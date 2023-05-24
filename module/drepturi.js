
/**
 @typedef Drepturi
 @type {Object}
 @property {Symbol} vizualizareUtilizatori Dreptul de a intra pe  pagina cu tabelul de utilizatori.
 @property {Symbol} stergereUtilizatori Dreptul de a sterge un utilizator
 @property {Symbol} cumparareProduse Dreptul de a cumpara

 @property {Symbol} stergeMesaj 
 @property {Symbol} vizualizareForum 
 */



//obiect cu proprietati, astea sunt drepturile pe care pot sa le aiba utilizatorii; daca vreau sa fac ceva anume, trebuie sa am acel drept de mai jos
//symbol = un fel de unique; valoarea(cea din Symbol) o accesam decat din proprietate; daca scriem in consola Symbol("abc")==Symbol("abc") da fals


/**
 * @name module.exports.Drepturi
 * @type Drepturi
 */
const Drepturi = {
	vizualizareUtilizatori: Symbol("vizualizareUtilizatori"),
	stergereUtilizatori: Symbol("stergereUtilizatori"),
	cumparareProduse: Symbol("cumparareProduse"),
	stergeMesaj: Symbol("stergeMesaj"),
	vizualizareForum: Symbol("vizualizareForum")
}

module.exports=Drepturi;