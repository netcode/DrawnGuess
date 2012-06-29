(function(global, $, gapi){

	var Application = function(){
		
		if(!global["gapi"]) {
			throw "Unable to load application, gapi not available";
		}

		gapi.hangout.onApiReady.add(this.onApiReady.bind(this));

		this.currentPlayerIndex = 0;
		this.players = [];

	};

	/**
	 * @onApiReady - Fired by gapi when RPC layer is ready.
	*/
	Application.prototype.onApiReady = function(event) {
		if(event.isApiReady == true)
		{
			/*
			 * Ready to start our application.
			*/
			console.log("Application is ready to run!");
			this.participant = {};
			this.participant.id = gapi.hangout.getParticipantId();

			try{
				this.players = global.$.map(gapi.hangout.getParticipants(), function(participant){
					return participant.id;
				});

				var sharedState = gapi.hangout.data.getState();
				if(sharedState['drawer']){
					gapi.hangout.data.setValue('drawer', this.participant.id);
				}

				if(gapi.hangout.data.getValue('drawer') == this.participant.id){
					//This is the current drawer
					this.DrawCanvas.start();
				}else{
					//This is a guesser
					this.DrawCanvas.updateMe();
				}

				/*
				 * Monitor for client changes
				*/
				gapi.hangout.onParticipantsChanged.add(this.refreshParticipantsList.bind(this));

				/*
				 * Initially draw the participants
				*/
				this.displayParticipants();
			}catch(e){
				console.log(e);
			}

			

		}
	};

	/*
	 * refreshParticipantsList
	*/
	Application.prototype.refreshParticipantsList = function(event)
	{
		/*
		 * recall the draw method
		*/
		this.displayParticipants();
	}

	/*
	 * Display participants
	*/
	Application.prototype.displayParticipants = function()
	{
		/*
		 * Remove the UL Container
		*/
		$("#container").html('');

		/*
		 * Get enabled participants
		*/
		var clients = gapi.hangout.getParticipants();

		/*
		 * Ul Container
		*/
		var container = document.createElement("ul");

		/*
		 * Loop the participants
		*/
		for(var i = 0; i < clients.length; i++)
		{
			var currentClient = clients[i];
			var li = document.createElement("li");

			if(currentClient.hasAppEnabled == true)
			{
				var image = "<img src=\"" + currentClient.person.image.url + "\"  width=\"32\" height=\"32\" />";
				li.innerHTML = image + " " + currentClient.person.displayName;
			}
			else
			{
				li.innerHTML = "Unknown Participant";
				li.setAttribute("class", "unknown");
			}

			container.appendChild(li);
		}

		$('#container').append(container);
		//document.getElementById("container").appendChild(container);
	}


	/*
	* Canvas Module
	*/
	Application.prototype.DrawCanvas = {
		'drawStart':false,
		'cpx' : [],
		'cpy' : [],		
		'drawObj':'canvas',
		'canvas':'',
		'ctx':'',
		'CanvasMessageCount':0,
		'start':function(){
			//alert(this.drawObj);
			this.canvas = document.getElementById(this.drawObj);
			this.ctx = this.canvas.getContext("2d"); 
			
			this.ctx.strokeStyle = "#000000";
			this.ctx.lineJoin = "round";
			this.ctx.lineWidth = 5;
			//init Events
			this.initEvents();
		},
		'initEvents':function(){
			var that = this;
			$('#'+this.drawObj).mousedown(function(e){
				
				that.drawStart = true;
				
				var px = e.pageX;
				var py = e.pageY;
				var rpx = px - $(this).offset().left;
				var rpy = py - $(this).offset().top ;
				
				that.ctx.beginPath();
			    that.ctx.moveTo(rpx, rpy);
			    
			    that.cpx.push(rpx);
			    that.cpy.push(rpy);
			});
			$('#'+this.drawObj).mousemove(function(e){
				if(that.drawStart){
					var px = e.pageX;
					var py = e.pageY;
					
					var rpx = px - $(this).offset().left;
					var rpy = py - $(this).offset().top;
					//console.log(rpx+'x'+rpy);
					that.ctx.lineTo(rpx, rpy);
					that.ctx.stroke();
					that.cpx.push(rpx);
				    that.cpy.push(rpy);
				    
				    //update to users
				    that.updateToUsers();
				    
				    
				}
			});
			
			$('#'+this.drawObj).mouseup(function(e){
				that.drawStart = false;
			});
		},
		'updateToUsers':function(){
			gapi.hangout.data.sendMessage(
	          JSON.stringify([this.CanvasMessageCount,
	                          this.cpx,this.cpy]));
		},
		'updateMe':function(){
			gapi.hangout.data.onMessageReceived.add(function(event){
				//this is when message received
				try {
				    var data = JSON.parse(event.message);
				    var msgNO = data[1];
					var cpx = data[2];
					var cpy = data[3];

				    this.renderCanvas();
				  } catch (e) {
				    console.log(e);
				  }
			});
		},
		'renderCanvas':function(cpx,cpy){
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.beginPath();
			for(i=0;cpx.length;$i++){
				this.ctx.moveTo(cpx[i], cpy[i]);
				this.ctx.lineTo(cpx[i], cpy[i]);
				this.ctx.stroke();
			}
		}
	}

	/*
	 * Return the instance
	*/
	return new Application();
})(window || {}, jQuery, gapi)
