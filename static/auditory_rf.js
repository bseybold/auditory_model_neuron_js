$(document).ready(function(){
	
		
	function box_respond(jqobj){
		i = jqobj.data('i');
		j = jqobj.data('j');
		old_val = document.rf_array[i][j]
		switch(old_val){
			case -1:
				$('#rf_box_'+i+'_'+j).toggleClass('rf_box_blue').toggleClass('rf_box_grey');
				document.rf_array[i][j] = 0;
				break;
			case 0:
				$('#rf_box_'+i+'_'+j).toggleClass('rf_box_grey').toggleClass('rf_box_red');
				document.rf_array[i][j] = 1;
				break;
			case 1:
				$('#rf_box_'+i+'_'+j).toggleClass('rf_box_red').toggleClass('rf_box_blue');
				document.rf_array[i][j] = -1;
				break;
		}
	};

	document.times = [-200, -150, -100, -50, 0];
	str = "<div id='rf_x_axis' style='position: relative; left: 150px; height: 50px;'>";
	for (i = 0; i < document.times.length; i++){
		str += "<span id='rf_x_axis_label_"+i+"' class='rf_x_axis' style='position:absolute;left:"+i*100+"px;'>"+document.times[i]+"</span>";
	};
	str +="<span id='rf_x_axis_label' style='position:absolute;left:130px;top:25px;'>Time Before Spike (ms)</span>";
	str += "</div>";
	$('#rf_boxes').after(str);

	document.frequencies = [50    ,    210,    450,    850, 1450,   2450,   3950,   6350, 10100, 16000];
	//set up our grid
	var dims = 10;
	var size = 40;
	$('#rf_boxes').append("<div id='rf_y_axis_label' style='position:absolute;left:-140px;top:200px;'>Frequency(Hz)</div>");
	document.rf_array = new Array();
  	for (i = 0; i < dims; i++){
		//add frequency label
		$('#rf_boxes').append("<div id='rf_y_axis_label_"+i+"' class='rf_y_axis' style='top:"+((i*size)+5)+"px;'>"+document.frequencies[dims-i-1]+"</div>");
		document.rf_array[i] = new Array();
		for (j=0; j < dims; j++){
			//create a 2d array
			document.rf_array[i][j] = 0;
			//create all the boxes
			//$('#rf_boxes').append("<div id='rf_box_"+i+"_"+j"' class='rf_box rf_box_grey' style='min-width:"+size+"px;min-height:"+size+"px;left:"+i*size+"px;top:"+j*size+"px;'></div>").click(box_respond(i,j));
			$('#rf_boxes').append("<div id='rf_box_"+i+"_"+j+"' class='rf_box rf_box_grey' style='min-width:"+size+"px;min-height:"+size+"px;left:"+i*size+"px;top:"+j*size+"px;'></div>")
			$('#rf_box_'+i+'_'+j).data('i',i).data('j',j).click(function(){
				//console.log('clicked: '+$(this).attr('id'));
				box_respond($(this));
			})
		}
	};
	//for debug purposes
	//quick_setup()
	//function quick_setup()
//	for (i = 0; i < dims; i++){
//		//toggle these once to be excitatory
//		box_respond($('#rf_box_'+(dims-1)+'_'+i));
//		box_respond($('#rf_box_'+(dims-2)+'_'+i));
//		//toggle these twice to be inhibitory;
//		box_respond($('#rf_box_'+(dims-3)+'_'+i));
//		box_respond($('#rf_box_'+(dims-3)+'_'+i));
//		box_respond($('#rf_box_'+(dims-4)+'_'+i));
//		box_respond($('#rf_box_'+(dims-4)+'_'+i));
//	};
	//};

        //progress bar for uploads
	function progressHandlingFunction(e){
		if(e.lengthComputable){
			$('progress').attr({value:e.loaded,max:e.total});
		}
	};
	
	//after response from ajax, do something
	//show picture of neural response, then transition blocker across
	function completeHandler(rval){
		$('progress').hide();
		//console.log(rval);
		document.rval = rval
		//$('#upload_target').html(rval)
		document.rval = JSON.parse(rval);
		alert('UPLOAD COMPLETE');
		plot_specgram(document.rval['stim_matrix']);
		plot_nl_output(document.rval['non_linearity_output']);
		plot_spike_output(document.rval['spike_output']);
	};

	function plot_specgram(specgram){
		var data = specgram,
		    w = 800,
		    h = 400,
		    margin = 60,
		    x_len = data[0].length,
		    y_len = data.length,
		    y = d3.scale.linear().domain([0, y_len]).range([0 + margin, h-margin]),
		    x = d3.scale.linear().domain([0, x_len]).range([0 + margin, w-margin]),
		    x_label = d3.scale.linear().domain([0, x_len]).range([0, d3.max(document.rval['time_list'])]),
		    box_height = y(1) - y(0),
	  	    box_width  = x(1) - x(0),
		    data_min = d3.min(d3.min(data)),
		    data_max = d3.max(d3.max(data));

		//console.log('min and max');
		//console.log(data_min);
		//console.log(data_max);

		$('#specgram_target').html('');
		
		var vis = d3.select('#specgram_target')
			.append("svg:svg")
			.attr("width", w)
			.attr("height", h);

		var g = vis.append("svg:g")
		    	.attr("transform", "translate(0, 400)");

		for (i = 0; i < x_len; i++){
			for (j = 0; j < y_len; j++){
				val = Math.round((data[j][i]-data_min)/(data_max-data_min)*255); // i,j are reversed and convert to RGB value for greyscale
				g.append("rect")
				 .style("stroke","none")
				 .style("fill","rgb("+val+","+val+","+val+")")
				 .style("display","inline")
				 .attr("height",box_height)
				 .attr("width",box_width)
				 .attr("x",x(i))
				 .attr("y",-1*y(j)-box_height);
			};
		};
		
		g.append("svg:line")
		    .attr("x1", x(0))
		    .attr("y1", -1 * y(0))
		    .attr("x2", x(x_len))
		    .attr("y2", -1 * y(0));
		
		g.append("svg:line")
		    .attr("x1", x(0))
		    .attr("y1", -1 * y(0))
		    .attr("x2", x(0))
		    .attr("y2", -1 * y(y_len));
		
		g.selectAll(".xLabel")
		    .data(x.ticks(5))
		    .enter().append("svg:text")
		    .attr("class", "xLabel")
		    .text(function(d) {return d3.round(x_label(d),2)})
		    //.text(String)
		    .attr("x", function(d) { return x(d) })
		    .attr("y", -40)
		    .attr("text-anchor", "middle")
		
		g.selectAll(".yLabel")
		    .data(y.ticks(4))
		    .enter().append("svg:text")
		    .attr("class", "yLabel")
		    //.text(String)
		    .text(function(d) {return document.frequencies[d]})
		    .attr("x", 55)
		    .attr("y", function(d) { return -1 * y(d) - box_height/2 })
		    .attr("text-anchor", "end")
		    .attr("dy", 4)
		
		g.selectAll(".xTicks")
		    .data(x.ticks(5))
		    .enter().append("svg:line")
		    .attr("class", "xTicks")
		    .attr("x1", function(d) { return x(d); })
		    .attr("y1", -1 * y(0))
		    .attr("x2", function(d) { return x(d); })
		    .attr("y2", -1 * y(-0.3))
		
		g.selectAll(".yTicks")
		    .data(y.ticks(4))
		    .enter().append("svg:line")
		    .attr("class", "yTicks")
		    .attr("y1", function(d) { return -1 * y(d); })
		    .attr("x1", x(-0.3))
		    .attr("y2", function(d) { return -1 * y(d); })
		    .attr("x2", x(0))
		
		g.append("svg:text")
			.text("Spectrogram of the Sound File")
			.attr("x",400)
			.attr("y",-360)
			.attr("text-anchor","middle")

		g.append("svg:text")
			.text("time (seconds)")
			.attr("x",400)
			.attr("y",-15)
			.attr("text-anchor","middle")

		g.append("svg:text")
			.text("frequency (Hz)")
			.attr("x",15)
			.attr("y",-150)
			.attr("transform","rotate(-90,15,-150)")

		g.append("svg:rect")
			.attr("x",0)
			.attr("y",-h)
			.attr("width",w)
			.attr("height",h)
			.attr("fill","white")
			.transition()
				.duration(5000)
				.ease('linear')
				.attr("x",w)
	};

	function plot_nl_output(nlo){
		var data = nlo,
		w = 800,
		h = 300,
		margin = 60,
		y = d3.scale.linear().domain([0, d3.max(data)]).range([0 + margin, h - margin]),
		x = d3.scale.linear().domain([0, data.length]).range([0 + margin, w - margin]),
		x_label = d3.scale.linear().domain([0, data.length]).range([0, d3.max(document.rval['time_list'])]);
		
		//clear previous plot
		$('#nlo_target').html('');		
		
		var vis = d3.select("#nlo_target")
		    .append("svg:svg")
		    .attr("width", w)
		    .attr("height", h);
		
		var g = vis.append("svg:g")
		    .attr("transform", "translate(0, 300)");
		
		var line = d3.svg.line()
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return -1 * y(d); })
		
		g.append("svg:path").attr("d", line(data));
		
		g.append("svg:line")
		    .attr("x1", x(0))
		    .attr("y1", -1 * y(0))
		    .attr("x2", x(data.length))
		    .attr("y2", -1 * y(0))
		
		g.append("svg:line")
		    .attr("x1", x(0))
		    .attr("y1", -1 * y(0))
		    .attr("x2", x(0))
		    .attr("y2", -1 * y(d3.max(data)))
		
		g.selectAll(".xLabel")
		    .data(x_label.ticks(5))
		    .enter().append("svg:text")
		    .attr("class", "xLabel")
		    .text(function(d) {return d3.round(x_label(d),2)})
		    .attr("x", function(d) { return x(d) })
		    .attr("y", -30)
		    .attr("text-anchor", "middle")
		
		    //.text(String)
		    
		g.selectAll(".yLabel")
		    .data(y.ticks(4))
		    .enter().append("svg:text")
		    .attr("class", "yLabel")
		    .text(String)
		    .attr("x", 55)
		    .attr("y", function(d) { return -1 * y(d) })
		    .attr("text-anchor", "end")
		    .attr("dy", 4)
		
		g.selectAll(".xTicks")
		    .data(x.ticks(5))
		    .enter().append("svg:line")
		    .attr("class", "xTicks")
		    .attr("x1", function(d) { return x(d); })
		    .attr("y1", -1 * y(0))
		    .attr("x2", function(d) { return x(d); })
		    .attr("y2", -1 * y(-0.3))
		
		g.selectAll(".yTicks")
		    .data(y.ticks(4))
		    .enter().append("svg:line")
		    .attr("class", "yTicks")
		    .attr("y1", function(d) { return -1 * y(d); })
		    .attr("x1", x(-0.3))
		    .attr("y2", function(d) { return -1 * y(d); })
		    .attr("x2", x(0))
		
		g.append("svg:text")
			.text("Firing Rate of the Model Neuron")
			.attr("x",400)
			.attr("y",-260)
			.attr("text-anchor","middle")

		g.append("svg:text")
			.text("time (seconds)")
			.attr("x",400)
			.attr("y",-15)
			.attr("text-anchor","middle")

		g.append("svg:text")
			.text("firing rate (Hz)")
			.attr("x",15)
			.attr("y",-100)
			.attr("transform","rotate(-90,15,-100)")
	
		g.append("svg:rect")
			.attr("x",0)
			.attr("y",-h)
			.attr("width",w)
			.attr("height",h)
			.attr("fill","white")
			.transition()
				.duration(5000)
				.ease('linear')
				.attr("x",w)
	};

	function plot_spike_output(spikes){
		console.log('spikes');
	};


	//upload file via ajax, modern browsers only
	$('#upload_button').click(function(){
		//get file and rf
		//code based on http://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously-with-jquery
		console.log('upload button click running...')
		var formData = new FormData($('form')[0]);
		formData.append('json_rf',JSON.stringify(document.rf_array));
		$('progress').show()
		$.ajax({
			url: '/django/auditory_model_neuron/test', //need server script'
			type: 'POST',
			xhr: function() {
				myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){ //check that we can upload
					myXhr.upload.addEventListener('progress',progressHandlingFunction,false);
				}
				return myXhr;
			},
			//Ajax events
			//beforeSend: beforeSendHandler,
			success: completeHandler,
			error: function(){$('progress').hide();alert('failed to upload file and rf');},
			//add data
			data: formData,
			//options for JQuery to do less work
			cache: false,
			contentType: false,
			processData: false,
		});
	});
	
	//upload file via ajax, modern browsers only
	$('#upload_button_default_T').click(function(){
		//get file and rf
		//code based on http://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously-with-jquery
		console.log('upload button click running...')
		var formData = new FormData($('form')[0]);
		formData.append('json_rf',JSON.stringify(document.rf_array));
		$('progress').show()
		$.ajax({
			url: '/django/auditory_model_neuron/test_T', //need server script'
			type: 'POST',
			xhr: function() {
				myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){ //check that we can upload
					myXhr.upload.addEventListener('progress',progressHandlingFunction,false);
				}
				return myXhr;
			},
			//Ajax events
			//beforeSend: beforeSendHandler,
			success: completeHandler,
			error: function(){$('progress').hide();alert('failed to upload file and rf');},
			//add data
			data: formData,
			//options for JQuery to do less work
			cache: false,
			contentType: false,
			processData: false,
		});
	});
	
	//upload file via ajax, modern browsers only
	$('#upload_button_default_A').click(function(){
		//get file and rf
		//code based on http://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously-with-jquery
		console.log('upload button click running...')
		var formData = new FormData($('form')[0]);
		formData.append('json_rf',JSON.stringify(document.rf_array));
		$('progress').show()
		$.ajax({
			url: '/django/auditory_model_neuron/test_A', //need server script'
			type: 'POST',
			xhr: function() {
				myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){ //check that we can upload
					myXhr.upload.addEventListener('progress',progressHandlingFunction,false);
				}
				return myXhr;
			},
			//Ajax events
			//beforeSend: beforeSendHandler,
			success: completeHandler,
			error: function(){$('progress').hide();alert('failed to upload file and rf');},
			//add data
			data: formData,
			//options for JQuery to do less work
			cache: false,
			contentType: false,
			processData: false,
		});
	});
	
	
	//a test file
	//$('$test_upload_button').click(function(){
	//});
});
