var disabled = false;

function toggle() {
    console.debug("Toggle");
    this.disabled = !this.disabled; 

    document.getElementById("disable-btn").innerText = this.disabled ? "Enable" : "Disable"; 
}