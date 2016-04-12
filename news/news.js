module.exports = function(RED) {

//	var cfEnv = require('cfenv');
//	var appEnv   = cfEnv.getAppEnv();

	var watson = require('watson-developer-cloud');

	function NewsNode(config) {

	RED.nodes.createNode(this,config);
	
	var node = this;

		this.name = config.name;
		this.key = config.key;
		this.start = config.start;
		this.end = config.end;
		this.max = config.max;
		this.mode = config.node;
		this.custom = config.custom;
		this.query = config.query;
		this.queries = config.queries;
		this.results = config.results;

		this.buildQuery = function(params) {
			var op1,op2;
			for (var i=0;i<node.queries.length;i++) {
				var q = node.queries[i];
				switch (q.op) {
					case 'cc':
						op1 = '[';
						op2 = ']';
						break;
					case 'nc':
						op1 = '-[';
						op2 = ']';
						break;
					case 'gt':
						op1 = '>';
						op2 = '';
						break;
					case 'ge':
						op1 = '>=';
						op2 = '';
						break;
					case 'lt':
						op1 = '<';
						op2 = '';
						break;
					case 'le':
						op1 = '<=';
						op2 = '';
						break;
				}
				params['q.'+q.field]=op1+q.value+op2;
			}	
		};

		this.buildCustomQuery = function(params) {
			var	values = node.query.split('&');
			for (var i=0;i<values.length;i++) {
				var value = values[i];
				var a = value.indexOf('=');
				var field = value.substr(0,a);
				params[field]=value.substr(a+1);
			}	
		};

		this.on('input', function (msg) {
			var alchemy_data_news = watson.alchemy_data_news({
				api_key: node.key
			});

			var params = {
				start: new Date(node.start).getTime()/1000, //'now-1d',
				end: new Date(node.end).getTime()/1000, //'now',
				maxResults: node.max,
				outputMode: node.mode,
				return: node.results.toString()
			};

			if (node.custom) {
				this.buildCustomQuery(params);
			} else {
				this.buildQuery(params);
			}

			alchemy_data_news.getNews(params, function (err, news) {
				if (err) {
					node.error(err);
				}
				else {
					node.send({'payload': news});
				}
			});
		});
	}

	RED.nodes.registerType('news',NewsNode);

}


