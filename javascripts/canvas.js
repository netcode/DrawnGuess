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
			gapi.hangout.data.onMessageReceived(function(event){
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