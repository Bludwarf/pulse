var pulse = function(module){

	module.MIDI_CLOCK = 248;
	module.MIDI_START = 250;
	module.PPQN = 24;
	
	module.beats = [];
	module.bpm = 120;
	module.mspb = 2000; 

	var socket = null;
	var clocks = 0;
	var latest = 0;

	function clock(){
		if (clocks == 0){
			module.tap()
		}
		clocks ++;
		if (clocks == module.PPQN){
			clocks = 0;
		}
	}

	function sync(){
		console.log('Synced.')
		clocks = 0;
		latest = 0;
	}

	module.tap = function(){
		module.beats.push((new Date).getTime());
		if (module.beats.length > 5){
			module.beats.shift()
			module.mspb = (module.beats[4] - module.beats[0]) / 4;
			// convert 'milliseconds per beats to 'beats per minute'
			module.bpm = 60000 / module.mspb;
		}
		latest = Math.round(latest) + 1;
	}

	

	/**
	* Get the current beat
	*/
	module.beat = function(){
		return latest + ((new Date).getTime() - module.beats[module.beats.length-1]) / module.mspb;
	}

	/**
	* Get a pulse on the beat
	*/
	module.pulse = function(){
		return Math.exp(-Math.pow( Math.pow(module.beat() % 1, 0.3) - 0.5, 2) / 0.05)
	}

	/**
	* Connect to a pulse server, get the socket.io script
	* and list its devices.
	*/
	module.connect = function(server, callback){
		if (socket){
			module.disconnect();
		}
		var script = document.createElement('script');
		script.src = server + '/socket.io/socket.io.js';
		console.log(script)
		
		script.onload = function () {	
    		socket = io.connect(server);
  			socket.on('midi', function (data) {
	    		if (data == module.MIDI_CLOCK){
	    			clock();
	    		}
	    		else if (data == module.MIDI_START){
	    			sync();
	    		}
  			});
		};

		document.head.appendChild(script);
	}

	/**
	* Disconnect from the pulse server
	*/
	module.disconnect = function(){
		if (socket){
			socket.disconnect();
			socket = null;
		}
	}

	return module;

}({})