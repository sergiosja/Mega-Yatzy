/* Dice relevant */
const diceroller = document.querySelector("#diceroller")
const die = document.getElementsByClassName("die");
const locked = [false, false, false, false, false, false]

/* Categories relevant */
const categories = document.getElementsByClassName("categories");


/* Roll dice */
function rolldice() {

    for (let i = 0; i < 6; i++) {
        if (!locked[i]) {
            die[i].value = Math.ceil(Math.random()*6);
            die[i].innerHTML = die[i].value;
        }
    }
}


/* Lock dice */
function lock(index) {
    if (locked[index]) {
        locked[index] = false;
        die[index].style.background = "#e0dbcd";
    } else {
        locked[index] = true;
        die[index].style.background = "#b1b0a5";
        die[index].style.border = "3px solid #2c2d2b";
    }
}


/* Opens and closes categories */
function collapse(index) {
    categories[index].classList.toggle("active");
    const content = categories[index].nextElementSibling;
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    }

    for (let i = 0; i < categories.length; i++) {
        if (i != index) {
            categories[i].nextElementSibling.style.maxHeight = null;
        }
    }
}