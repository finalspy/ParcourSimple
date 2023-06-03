// ==UserScript==
// @name         ParcourSimple
// @namespace    https://ypetit.net/
// @version      0.2
// @description  try to siplify PArcourSup display!
// @author       ypetit
// @match        https://dossierappel.parcoursup.fr/Candidat/admissions?ACTION=0
// @icon         https://www.google.com/s2/favicons?sz=64&domain=parcoursup.fr
// @grant GM_setValue
// @grant GM_getValue
// @grant    GM_addStyle
// @require http://userscripts-mirror.org/scripts/source/107941.user.js
// ==/UserScript==

(function() {
    'use strict';
    //GM_SuperValue.set ("test", 12);
    //var x = GM_SuperValue.get ("test",42);

    GM_addStyle ( `
        #parcoursimple {
            position:fixed;
            z-index: 9999;
            top:10px;
            right:10px;
            /*height:480px;
            width:800px;
            overflow:scroll;*/
            background-color: whitesmoke;
            padding: 10px;
            border: dotted dimgray 0.5px;
            box-shadow: 10px 8px 5px gray;
        }
        .right{
            text-align: right;
        }
        .bold{
            font-weight: bold;
        }
        .light{
            color: lightgrey;
        }
        table{
            border-collapse: collapse;
            vertical-align: middle;
        }
        th, td {
            border: 1px solid black;
            padding: 4px;
        }
        th{
            color: white;
            background-color: darkblue;
            font-weight: bold;
        }

        /* add other CSS here */
    ` );

    document.addEventListener('keydown', function(e){
        console.log(e.which);
        if(e.which == 83) {

            return false;
        }
    }, true);

    $("body").append('<div id="parcoursimple" name="parcoursimple">' +
                     '<table id="parcoursimple_table">'+
                     '<caption>Voeux en ATTENTE</caption>' +
                     '<thead><tr><th>Ecole</th><th>Cursus</th><th>Places</th><th>dernier</th><th>2022</th><th>classement</th><th>attente</th><th>total</th></tr></thead>' +
                     '<tbody id="parcoursimple_table_body"></tbody></table></div>');

    // get all wishes
    var cards = Array.from(document.querySelectorAll(".psup-wish-card--info"));
    const wishes = [];
    class Wish {
        constructor(school, course, id, waiting_position, waiting_total, places, ranking, last, lastLastYear){
            this.school=school;
            this.course=course;
            this.id=id;
            this.waiting_position=waiting_position;
            this.waiting_total=waiting_total;
            this.places=places;
            this.ranking=ranking;
            this.last=last;
            this.lastLastYear=lastLastYear;
        }
        show(){
            return "<tr>"
                + "<td>"+ this.school + "</td>"
                + "<td>" + this.course.substr(0,20) + "</td>"
                + "<td class='right'>" + this.places + "</td>"
                + "<td class='right'>" + this.last + "</td>"
                + "<td class='right'>" + this.lastLastYear + "</td>"
                + "<td class='right'>" + this.ranking + "</td>"
                + "<td class='right bold'>" + this.waiting_position + "</td>"
                + "<td class='right light'>" + this.waiting_total + "</td>"
                + "</tr>";
        }
    }
    cards.forEach(card => {
        const onclick = card.querySelectorAll('button')[0].getAttribute('onclick');
        const id = onclick.substring(onclick.indexOf("&") + 1, onclick.lastIndexOf("'"));
        const school = card.querySelectorAll('.psup-wish-card__school')[0].innerHTML;
        const course= card.querySelectorAll('.psup-wish-card__course')[0].innerHTML;
        //https://dossierappel.parcoursup.fr/Candidat/
        const URL = "admissions?ACTION=2&" +id + "&frOpened=false&frJsModalButton=true"
        $.ajax({
            url: URL,
            type: "GET",
            dataType: "html",
            success: function (h) {
                const template = document.createElement('div');
                template.innerHTML = h.trim();
                const waiting_position = template.querySelector("div ul li:nth-child(1) b").innerHTML;
                const waiting_total = template.querySelector("div ul li:nth-child(2) b").innerHTML;
                // --------------
                const places = template.querySelector(".fr-alert ul li:nth-child(1) b").innerHTML;
                const ranking = template.querySelector(".fr-alert ul li:nth-child(2) p b").innerHTML;
                const last = template.querySelector(".fr-alert ul li:nth-child(3) b").innerHTML;
                const lastYear = template.querySelector(".fr-alert ul li:nth-child(4) b");
                const lastLastYear = (lastYear)?lastYear.innerHTML:"?";
                let wish = new Wish(school,
                                    course,
                                    id,
                                    waiting_position,
                                    waiting_total,
                                    places,
                                    ranking,
                                    last,
                                    lastLastYear
                                   );
                wishes.push(wish);
            },
            error: function (h) { console.err(h); },
            complete: function () {
                const w = wishes[wishes.length -1];
                let r = document.getElementById("parcoursimple_table_body");
                r.innerHTML += w.show().trim();
            }
        })
    });

    //console.info(wishes);

})();
