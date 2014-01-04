$(document).ready(function(){
	window.io = io.connect();

	io.on('connect', function(){
		console.log('Connected to server');

		io.emit('hello?');
	});

	io.on('ready', function(data){
		console.log(data);
	});

	io.on('log-in', function(data){
		console.log(data);

		$('#users').append('<li>'+data.username+'</li>');
	});

	io.on('log-out', function(data){
		console.log(data);

		$('#users li').each(function (i, item) {
			if(item.innerText === data.username){
				$(item).remove();
			}
		});		
	});
});