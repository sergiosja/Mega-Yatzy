/* Dice relevant */
const diceroller = document.querySelector("#diceroller")
const die = document.getElementsByClassName("die");
const dievalues = [0, 0, 0, 0, 0, 0]
const locked = [false, false, false, false, false, false]

/* Categories relevant */
const categories = document.getElementsByClassName("categories");
const category = document.getElementsByClassName("category");
const finished = [0, 0, 0, 0, 0, 0];

/* Total sum */
let totalsum = 0



/* Roll dice */
function rolldice() {
    for (let i = 0; i < 6; i++) {
        if (!locked[i]) {
            die[i].value = Math.ceil(Math.random()*6);
            die[i].innerHTML = die[i].value;
            dievalues[i] = die[i].value;
        }
    }
}


/* Lock die */
function lock(index) {
    if (locked[index]) {
        locked[index] = false;
        die[index].classList.remove("locked");
    } else {
        locked[index] = true;
        die[index].classList.add("locked");
    }
}


/* Unlocking die */
function unlock() {
    for (let i = 0; i < locked.length; i++) {
        die[i].innerHTML = 0;
        dievalues[i] = 0;

        if (locked[i]) {
            locked[i] = false;
            die[i].classList.remove("locked");
        }
    }
}


/* Check if a category is done */
function checkFinished() {
    for (let i = 0; i < finished.length; i++) {
        if (finished[i] == 6 || (i > 0 && finished[i] == 3)) {
            categories[i].disabled = true;
            categories[i].style.background = "#2c2d2b";
            categories[i].style.color = "#e0dbcd";
            finished[i] = 10;
            collapse(i);
        }
    }
}


/* Disables buttons */
function disable(e) {
    category[e].disabled = true;
    category[e].style.background = "#a76932";
    category[e].style.color = "#010103";
    window.scroll({ top: 0, behavior: "smooth" });

    checkFinished();
    unlock();
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