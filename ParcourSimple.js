// ==UserScript==
// @name         ParcourSimple
// @namespace    https://ypetit.net/
// @version      0.6.3
// @description  Simplification de l'affichage des voeux en attente sur ParcourSup!
// @author       ypetit
// @match        https://dossierappel.parcoursup.fr/Candidat/admissions?ACTION=0
// @icon         https://www.google.com/s2/favicons?sz=64&domain=parcoursup.fr
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle ( `
        #psimple{
            position:absolute;
            top:0;
            left:0;
            display:block;
            z-index: 99999;
            height: 40px;
            padding: 4px 10px;
            background-color: var(--background-active-blue-france);
            color: #FFF;
        }
        #psimple img{
            margin: 0 10px;
        }
                #psimple .key{
            font-family: Courrier;
            background-color: lightgrey;
            color: #000;
            font-weight: bold;
            border: 1px solid black;
            border-radius: 3px;
            display: inline-block;
            padding: 0px 8px 2px;
        }
        #psimple .help{
            display: inline-block;
            padding: 0 10px;
        }
        #parcoursimple {
            position:fixed;
            z-index: 9999;
            top:40px;
            left:10px;
            max-height: 98%;
            overflow-y: auto;
            background-color: whitesmoke;
            margin: 10px;
            border: dotted dimgray 0.5px;
            box-shadow: 10px 8px 5px gray;
        }
        #parcoursimple table{
            border-collapse: collapse;
            vertical-align: middle;
            background-color: #FFF;
        }
        #parcoursimple thead{
            position: sticky;
            top: 0px;
        }
        #parcoursimple tr{
             line-height: 14px;
        }
        #parcoursimple th{
            color: #FFF;
            background-color: var(--background-active-blue-france);
            font-weight: bold;
        }
        #parcoursimple th, #parcoursimple td{
            border: 1px solid black;
            padding: 4px;
        }
        #parcoursimple .right{
            text-align: right;
        }
        #parcoursimple .bold{
            font-weight: bold;
        }
        #parcoursimple .light{
            color: lightgrey;
        }
        #parcoursimple .ok{
            color: darkgreen;
            font-weight: bold;
        }
        #parcoursimple .nan{
            color: #CCC;
        }
        #parcoursimple .ko{
            color: darkred;
            font-style: italic;
        }
        #parcoursimple .max{
            background-color: lightpink;
            border: dashed 1px black;
            width:100%;
            text-align: right;
        }
        #parcoursimple .propal{
            position:relative;
            left:0;
            top:-16px;
            dispay:block;
            background-color: lightgreen;
            border: solid 1px black;
            text-align: left;
        }
        #parcoursimple .blur{
            color: transparent;
            text-shadow: 0 0 20px #002;
        }
        .hide{
            display: none;
        }
        .show{
            display: block;
        }
        /* add other CSS here */
    ` );

    let show = true;
    document.addEventListener('keyup', function(e){
        // if click on a
        if(65 === e.which){
            const x = document.getElementById('parcoursimple');
            x.style.display = (x.style.display === "none")?"block":"none";
        }
        // if click r
        else if(82 === e.which){
            // sort by nb places liste attente
            wishes.sort((a,b) => a.waiting_position - b.waiting_position);
            let r = document.getElementById("parcoursimple_table_body");
            r.innerHTML='';
            for(let w in wishes){
                r.innerHTML += wishes[w].show().trim();
            }
        }
        // if click t
        else if(84 === e.which){
            // sort by % progression
            wishes.sort((a,b) => b.last/(b.last+b.waiting_position) - a.last/(a.last+a.waiting_position));
            let r = document.getElementById("parcoursimple_table_body");
            r.innerHTML='';
            for(let w in wishes){
                r.innerHTML += wishes[w].show().trim();
            }
        }else if(66 === e.which){
            document.querySelectorAll("#parcoursimple tbody td:first-child").forEach(x=>x.classList.add('blur'));
            document.querySelectorAll("#parcoursimple tbody td:nth-child(2)").forEach(x=>x.classList.add('blur'));
        }else if(67 === e.which){
            document.querySelectorAll("*[name='useless']").forEach(x=> x.classList.toggle('hide'));
        }
    });

    $("body").prepend('<div id="psimple"><img src="/favicon.ico"> '+
        'Clavier : ' +
        '<div class="help"><div class="key">a</div> affiche/cache le tableau</div>' +
        '|<div class="help"><div class="key">r</div> tri par position en liste d\'attente</div>' +
        '|<div class="help"><div class="key">t</div> tri par % de progression dans le classement</div>' +
        '</div>');
    $("body").append(
        '<div id="parcoursimple" name="parcoursimple">' +
        '<table id="parcoursimple_table">'+
        '<thead><tr>' +
        ' <th>Ecole</th>' +
        ' <th>Cursus</th>' +
        ' <th>Places<br/>Disponibles</th>' +
        ' <th>Dernier<br/>2022</th>' +
        ' <th>Position au<br/>Classement</th>' +
        ' <th>Dernière<br/>Proposition</th>' +
        ' <th>Place en<br/>Liste</th>' +
        ' <th>--Graphique--</th>'+
        ' <th>% progression<br/>100% = proposition</th>'+
        ' <th name="useless" class="hide">Total Attente</th>' +
        '</tr></thead>' +
        '<tbody id="parcoursimple_table_body"></tbody></table></div>'
    );

    // get all wishes
    const cards = Array.from(document.querySelectorAll(".psup-wish-card--info"));
    const wishes = [];
    class Wish {
        constructor(school, course, id, waiting_position, waiting_total, places, ranking, last, lastLastYear){
            this.school=school;
            this.course=course;
            this.id=id;
            this.waiting_position=Number(waiting_position);
            this.waiting_total=Number(waiting_total);
            this.places=Number(places);
            this.ranking=Number(ranking);
            this.last=Number(last);
            this.lastLastYear=Number(lastLastYear);
        }
        show(){
            return "<tr>"
                + "<td>"+ this.school + "</td>"
                + "<td>" + this.course + "</td>"
                + "<td class='right'>" + this.places + "</td>"
                + "<td class='right'>" + this.lastLastYear + "</td>"
                + "<td class='right " + this.rankColor() + "'>" + this.ranking + "</td>"
                + "<td class='right'>" + this.last + "</td>"
                + "<td class='right bold'>" + this.waiting_position + "</td>"
                + "<td><div class='max'>"+this.waiting_position+"</div><div class='propal' style='width:"+(this.last/(this.last+this.waiting_position)*100)+"%'>"+this.last+"</div></td>"
                + "<td class='right bold'>" + Math.round(this.last/(this.last+this.waiting_position)*100) + "%</td>"
                + "<td name='useless' class='right light hide'>" + this.waiting_total + "</td>"
                + "</tr>";
        }
        rankColor(){
            return isNaN(this.lastLastYear)?"nan":this.lastLastYear > this.ranking ? "ok" : "ko";
        }
    }
    const promises = [];
    cards.forEach(card => {
        const onclick = card.querySelectorAll('button')[0].getAttribute('onclick');
        const id = onclick.substring(onclick.indexOf("&") + 1, onclick.lastIndexOf("'"));
        const school = card.querySelectorAll('.psup-wish-card__school')[0].innerHTML;
        const course= card.querySelectorAll('.psup-wish-card__course')[0].innerHTML;
        //https://dossierappel.parcoursup.fr/Candidat/
        const URL = "admissions?ACTION=2&" +id + "&frOpened=false&frJsModalButton=true";
        promises.push($.ajax({
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
                wishes.push(new Wish(school,
                    course,
                    id,
                    waiting_position,
                    waiting_total,
                    places,
                    ranking,
                    last,
                    lastLastYear
                ));
            },
            error: function (h) { console.err(h); },
            complete: function () {}
        }));
    });
    $.when.apply($, promises).then(function() {
        wishes.sort((a,b) => a.waiting_position - b.waiting_position);
        let r = document.getElementById("parcoursimple_table_body");
        for(let w in wishes){
            r.innerHTML += wishes[w].show().trim();
        }
    });
})();
