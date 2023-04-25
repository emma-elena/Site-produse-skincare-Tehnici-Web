window.addEventListener("DOMContentLoaded", function(){
    temaCurenta = localStorage.getItem("tema");
    
    if (temaCurenta) {
      document.body.classList.add(temaCurenta);
      document.getElementById("checkbox").checked = temaCurenta === "dark";
    }
    
    document.getElementById("checkbox").addEventListener("change", function() {
      if (this.checked) {
        document.body.classList.add("dark");
        localStorage.setItem("tema", "dark");
      } else {
        document.body.classList.remove("dark");
        localStorage.removeItem("tema");
      }
    });
  });
  