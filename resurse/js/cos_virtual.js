window.addEventListener("load", function () {
	prod_sel = localStorage.getItem("cos_virtual");
  
	if (prod_sel) {
	  var vect_ids = prod_sel.split(",");
  
	  fetch("/produse_cos", {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		mode: 'cors',
		cache: 'default',
		body: JSON.stringify({
		  a: 10,
		  b: 20,
		  ids_prod: vect_ids
		})
	  })
	  .then(function (rasp) { console.log(rasp); x = rasp.json(); console.log(x); return x })
	  .then(function (objson) {
		console.log(objson);
  
		let main = document.getElementsByTagName("main")[0];
  
		// Creează un element div pentru borderul separat
		let borderDiv = document.createElement("div");
		borderDiv.style.border = "0.5px solid black";
		borderDiv.style.padding = "10px";
		borderDiv.style.marginBottom = "10px";
  
		let btn = document.getElementById("cumpara");
		let sumaProduse = 0; // Variabila pentru stocarea sumei produselor
  
		for (let prod of objson) {
		  let article = document.createElement("article");
		  article.classList.add("cos-virtual");
		  var h2 = document.createElement("h2");
		  h2.innerHTML = prod.nume;
		  article.appendChild(h2);
  
		  let imagine = document.createElement("img");
		  imagine.src = "/resurse/imagini/produse/" + prod.imagine;
		  article.appendChild(imagine);
  
		  let descriere = document.createElement("p");
		  descriere.innerHTML = prod.descriere + " <b>Pret:</b>" + prod.pret;
		  article.appendChild(descriere);
		  main.insertBefore(article, btn);
  
		  sumaProduse += parseFloat(prod.pret); // Adăugați prețul la suma produselor
		}
  
		let transportCost = 0;
		if (sumaProduse > 100 && sumaProduse <= 150) {
		  transportCost = 0;
		} else if (sumaProduse <= 100) {
		  transportCost = 10;
		}
  
		let sumElement = document.createElement("p"); // Creează un element <p> pentru afișarea sumei totale
		let sumaTotala = sumaProduse + transportCost;
		sumElement.innerHTML = "Total partial: " + sumaProduse.toFixed(2) + " lei<br>Transport: " + transportCost.toFixed(2) + " lei<br>Suma totală: " + sumaTotala.toFixed(2) + " lei"; // Afiseaza sumele cu 2 zecimale
		borderDiv.appendChild(sumElement); // Adaugă elementul în div-ul pentru border
		main.insertBefore(borderDiv, btn); // Inserează div-ul înaintea butonului de cumpărare
	  })
	  .catch(function (err) { console.log(err) });
  
	  document.getElementById("cumpara").onclick = function () {
		prod_sel = localStorage.getItem("cos_virtual");
		if (prod_sel) {
		  var vect_ids = prod_sel.split(",");
		  fetch("/cumpara", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			mode: 'cors',
			cache: 'default',
			body: JSON.stringify({
			  ids_prod: vect_ids,
			  a: 10,
			  b: "abc"
			})
		  })
		  .then(function (rasp) { console.log(rasp); return rasp.text() })
		  .then(function (raspunsText) {
			console.log(raspunsText);
			if (raspunsText) {
			  localStorage.removeItem("cos_virtual")
			  let p = document.createElement("p");
			  p.innerHTML = raspunsText;
			  document.getElementsByTagName("main")[0].innerHTML = "";
			  document.getElementsByTagName("main")[0].appendChild(p);
			}
		  })
		  .catch(function (err) { console.log(err) });
		}
	  }
	} else {
	  document.getElementsByTagName("main")[0].innerHTML = "<h2 style='text-align: center'>Nu aveți nimic în coș!</h2>";
	}
  });
  