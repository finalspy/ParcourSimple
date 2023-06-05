// ==UserScript==
// @name         ParcourSup Obfuscate
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Obfuscate sensitive data on parcoursup screen
// @author       ypetit
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

    document.querySelector(".psup-user-menu-btn--logged").innerHTML = "Candidat XYZ";

})();