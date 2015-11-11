// creating the object
var gimme = {
	// making everything false by default
	userInput : '',
	userInputIsValid : false,
	appId : '',
	$content : $('.content'),
	$form : $('form'),
	validate : function(){
		// check if it is valid by regex
		// check if it it has http://itunes in the beginning
		// check if it has /id followed by digits using regex and capture the digit
		var regUrl = /^(http|https):\/\/itunes/;
		var regId = /\/id(\d+)/i;
		if ( regUrl.test(this.userInput) && regId.test(this.userInput) ) {
            this.userInputIsValid = true;
            var id = regId.exec(this.userInput);
            this.appId = id[1];
        } else {
            this.userInputIsValid = false;
            this.appId = '';
        }

	},
	throwError : function(header,body){
		this.$content.html('<em>'+header+'</em><p>'+body+'</p>');
		this.$content.addClass('content-error');
		this.toggleLoading();

	},
	toggleLoading : function(){
		// selecting .content class and toggling to .content--loading class
		this.$content.toggleClass('content--loading');
		// Toggle the submit button so we don't get double submissions
        // http://stackoverflow.com/questions/4702000/toggle-input-disabled-attribute-using-jquery
        this.$form.find('button').prop('disabled', function(i, v) { return !v; });
	},
	render : function(response){
		var icon = new Image();
		icon.src = response.artworkUrl512;
		icon.onload = function(){
			gimme.$content
			.html(this)
			.append('<p><strong>'+response.trackName+'<strong></p><p><a href="'+response.artworkUrl512+'" Download="'+response.artworkUrl512+'"><button>Download</button></a>')
			.removeClass('content-error');
			gimme.toggleLoading();

		}
	}
}
jQuery(document).ready(function($) {
	gimme.$form.on('submit',function(e) {
		e.preventDefault();
		/* Act on the event */
		gimme.toggleLoading();
		// passing the userInput value to validate function
		gimme.userInput = $(this).find('input').val();
		// validating and getting the id
		gimme.validate();
		// checking if the userInput is correct 
		if(gimme.userInputIsValid){
			// make the api call if userinput is valid
			$.ajax({
				url: 'https://itunes.apple.com/lookup?id='+gimme.appId,
				dataType: 'JSONP'
			})
			.done(function(response) {
				var response = response.results[0];
				console.log(response.artworkUrl512);
				if(response && response.artworkUrl512 != null){
					gimme.render(response);
				}else{
					gimme.throwError('Invalid response','The url does not appear to be associated with an icon.');
				}
			})
			.fail(function(data) {
				gimme.throwError('iTunes api error','There was an error retrieving the info. Check the iTunes URL or try again later.')
			})
			.always(function() {
				console.log("complete");
			});
			


		}else{
			// throw an error
			gimme.throwError('invalid link','Please enter a valid itunes url');
		}


	});
});