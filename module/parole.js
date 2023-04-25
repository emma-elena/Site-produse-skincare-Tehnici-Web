sirAlphaNum="";

v_intervale=[[48,57],[65,90],[97,122]] //coduri ASCII; cifre, litere mari si litere mici; vector de obiecte de tip vector cu 2 elemente, capatul de inceput si capatul de final 
for(let interval of v_intervale){ //luam pe rand fiecare subinterval
    for(let i=interval[0]; i<=interval[1]; i++) // i porneste de la capatul din stanga al intervalului, de pe pozitia 0, capatul din dreapta pozitia 1; se duce pana la capatul din dreapta inclusiv si incrementeaza cu 1
        sirAlphaNum+=String.fromCharCode(i) //ia caracterul pentru codul ASCII dat
}

console.log(sirAlphaNum);

function genereazaToken(n){ //n este cate caractere vrem sa aiba parola 
    let token=""
    for (let i=0;i<n; i++){ //de n ori o sa concatenam la token
        token+=sirAlphaNum[Math.floor(Math.random()*sirAlphaNum.length)] // Math.random() returneaza un numar intre 0 si 1   *sirAlphaNum.length  ajunge intre 0 si lungimea numarului; Math.floor trunchiaza ca are virgula
    // concatenam cu caracterul din sirAlphaNum si iese token-ul
    }
    return token;
}

module.exports.genereazaToken=genereazaToken; //exportam functia genereazaToken; nu facem clasa pentru 1-2 functii