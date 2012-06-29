
!(function(global){

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

			this.players = $.map(gapi.getParticipants(), function(participant){
				return participant.id;
			});

			var sharedState = gapi.hangout.data.getState();
			if(sharedState['drawer']){
				gapi.hangout.data.setValue('drawer', this.participant.id);
			}

			if(gapi.hangout.data.getValue('drawer') == this.participant.id){
				//This is the current drawer
			}else{
				//This is a guesser
			}

			/*
			 * Monitor for client changes
			*/
			gapi.hangout.onParticipantsChanged.add(this.refreshParticipantsList.bind(this));

			/*
			 * Initially draw the participants
			*/
			this.displayParticipants();


			

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
	 * Return the instance
	*/
	return new Application();
})(window || {})