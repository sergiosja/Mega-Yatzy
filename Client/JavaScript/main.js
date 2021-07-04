const diceroller = document.querySelector("#diceroller")

const die = [ document.querySelector("#dice-one"), document.querySelector("#dice-two"),
              document.querySelector("#dice-three"), document.querySelector("#dice-four"),
              document.querySelector("#dice-five"), document.querySelector("#dice-six") ]


function rolldice() {

    for (let i = 0; i < 6; i++) {
        die[i].value = Math.ceil(Math.random()*6);
        die[i].innerHTML = die[i].value;
    }
}