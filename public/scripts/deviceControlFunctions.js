
function ledToggle(board, state) {
    	console.log('sending led='+state+' to board ' + board );
    	var mode = 'off';
    	if(state){
    		mode = 'on'
    	}
	httpPut('/devices/'+board+'/led/'+mode, null, function(){});
}
