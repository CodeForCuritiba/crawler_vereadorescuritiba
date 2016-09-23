var http = require('http');
var cheerio = require('cheerio');
var moment = require('moment');
var request = require('request');
var go = true;

if (go) {
	go = false;

	console.log('Starting at ' + moment().format('LTS'));
	fs = require('fs')
	fs.readFile('candidatos.html', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  var $ = cheerio.load(data);
	  var c = 0;
	  var requests = 0;
	  var delay = 500;
//	  var max = $('.lista-candidatos a').length;
	  var max = 4;
	  var candidatos = [];

	  var getCandidatos = function(a_list) {
	  	if (a_list && c < max) {

		  	var a = a_list.shift();
	  	  	var url = a.attribs.href;
		  	setTimeout(function(){

			  	console.log("" + (c+1) + " =>");
				request(url, function (error, response, body) {
				  requests = requests + 1;
				  if (!error && response.statusCode == 200) {

					var b = cheerio.load(body);

					var candidato = {
						"nome": b('.tab-candidato tr:nth-child(1) td').text(),
						"num": b('.tab-candidato tr:nth-child(2) td').text(),
						"situacao": b('.tab-candidato tr:nth-child(3) strong').text(),
						"municipio": b('.tab-candidato tr:nth-child(4) td').text(),
						"partido": b('.tab-candidato tr:nth-child(5) td').text(),
						"coalicao": b('.tab-candidato tr:nth-child(6) td').text(),
						"composicao": b('.tab-candidato tr:nth-child(7) td').text(),
						"email": b('.tab-candidato tr:nth-child(8) a').text(),

						"nome_completo": b('.tab-pessoais tr:nth-child(1) td').text(),
						"sexo": b('.tab-pessoais tr:nth-child(2) td').text(),
						"idade": b('.tab-pessoais tr:nth-child(3) td').text().replace( /^\D+/g, ''),
						"nascimento": b('.tab-pessoais tr:nth-child(4) td').text(),
						"ocupacao": b('.tab-pessoais tr:nth-child(5) td').text(),
						"instrucao": b('.tab-pessoais tr:nth-child(6) td').text(),
						"estado_civil": b('.tab-pessoais tr:nth-child(7) td').text(),
						"municipio_nascimento": b('.tab-pessoais tr:nth-child(9) td').text(),
					};

					candidatos[candidatos.length] = candidato;

					console.log("=> " + requests);
					if (requests == max) {

						fs.writeFile("candidatos.json", JSON.stringify(candidatos), function(err) {
						    if(err) {
						        return console.log(err);
						    }
						    console.log("The file candidatos.json was saved!");
						});

						var csv = '';
						var last = "municipio_nascimento";
						for (var idx in candidatos) {
							for(var key in candidatos[idx]) {
								csv = csv + candidatos[idx][key] + (( key != last ) ? ',' : '');
							}
							csv = csv + "\n";
						}

						fs.writeFile("candidatos.csv", csv, function(err) {
						    if(err) {
						        return console.log(err);
						    }
						    console.log("The file candidatos.csv was saved!");
						});

						console.log('Ending at ' + moment().format('LTS'));

					}

				  }
				});

			  	c = c + 1;
			  	getCandidatos(a_list);

		  	},delay);
	  	}
	  }

	  getCandidatos([].slice.call($('.lista-candidatos a')));

	});


}
