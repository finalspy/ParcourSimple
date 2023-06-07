// ==UserScript==
// @name         ParcourSup Obfuscate
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  Cache les informations sensibles a l'ecran (nom, prenom, etablissements, formation ..), permet de screen sans divulguer d'infos perso
// @author       ypetit
// @license      GNU GPLv3
// @match        https://dossierappel.parcoursup.fr/Candidat/authentification
// @match        https://dossierappel.parcoursup.fr/Candidat/admissions?ACTION=0
// @icon         https://www.google.com/s2/favicons?sz=64&domain=parcoursup.fr
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle ( `
        input.fr-input, .psup-wish-card__school, .psup-wish-card__course, #parcoursimple tbody td:first-child, #parcoursimple tbody td:nth-child(2) {
            color: transparent;
            text-shadow: 0 0 10px #000;
        }
    ` );

    document.querySelector(".psup-user-menu-btn--logged").innerHTML = "&lt;Prénom NOM&gt;";
    document.querySelectorAll(".psup-wish-card__school").forEach(e => {e.innerHTML = "&lt;Ecole/Université&gt;";});
    document.querySelectorAll(".psup-wish-card__course").forEach(e => {e.innerHTML = "&lt;Formation&gt;";});
    document.querySelectorAll("#parcoursimple tbody td:first-child").forEach(e => {e.innerHTML = "&lt;Ecole/Université&gt;";});
    document.querySelectorAll("#parcoursimple tbody td:nth-child(2)").forEach(e => {e.innerHTML = "&lt;Formation&gt;";});


})();