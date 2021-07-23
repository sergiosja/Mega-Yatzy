# Mega-Yatzy

This is a replica of the familiar Yatzy-game, based on the [Maxi-Yatzy version](https://en.wikipedia.org/wiki/Yatzy#Maxi_Yatzy). Here you can create a password-protected user, play rounds of Yatzy, and save your scores in a database. Thereafter you will have access to your score (and other relevant info) in a local table. In addition, you will be able to compete in the global table, where everyone can fight for their honour. You will also find a tutorial for how to play the game. <br>

If you do not care much for saving your scores, you can play singles [here](https://github.com/sergiosja/Yatzy). On this page you can also read up on the rules of the game. <br>

This is a fullstack project I developed with JavaScript, HTML/EJS and CSS for the frontend (client-side), and JavaScript in Node.js for the backend (server-side). Users and scores are saved in a PostgreSQL database. The passwords are salted and hashed upon saving, though I would still recommend you use a strong password. <br>

As of right now, the project only runs locally on my machine, but I plan on putting it up somewhere this fall :)