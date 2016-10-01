/**
 * wvRender is used to render HTML DOM from JSON objects. To read more, please go to http://github.com/wviveiro/wvRender
 * @author Wellington Viveiro <https://github.com/wviveiro>
 * @param  {function} arg IIFE environment to run the wvrender
 * @return {JSON}     the function does not have a return itself, however, the iife function receive a json objects
 *                    which is all the functions that wvRender can execute.
 */
var wvRender = function( arg ){

	/**
	 * wvRender does not work without jQuery
	 */
	if( 'undefined' == typeof jQuery ){
		console.warn( 'jQuery not found. wvRender only works with jQuery.' );
		return false;
	}

	var $ = jQuery;


	/**
	 * Render html based of json
	 * @author Wellington Viveiro <https://github.com/wviveiro>
	 * @param  {json}   jsObj     object that will be rendered
	 * @param  {jquery}   container jquery DOM that will be duplicated
	 * @param  {Function} callback  function that will be called in each object created
	 * @return {null}             
	 */
	var render = function( jsObj, container, callback ){
		var self = {};

		/**
		 * children created after rendering
		 */
		self.children = [];

		callback = callback || function( controller ){};

		/*
		 * Function calls another function inside, to be able to re render when necessary
		 */
		self.executeRender = function(){

			/*
			 * Case re render, it deletes the objects already created.
			 */
			if( self.children.length > 0 ){
				self.children.forEach( function( e, i, a ){ e.remove(); } );
			}

			var name = container.attr( 'wv-name' );
			jsObj.forEach( function( e, i, a ){
				
				/**
				 * Self2 is used case user wants to render unique
				 */
				var self2 = {};

				/*
				 * ob is the container that will be cloned and addes to the html
				 */
				
				self2.renderInternal = function(){
					if( 'undefined' != typeof self2.ob ){
						self2.ob.remove();
					}

					
					self2.ob = container.clone().removeAttr( 'wv-name' );			
					self.children.push( self2.ob );

					if( 'undefined' != typeof name ){
						var input = {
							general : 'input[wv-parent="' + name + '"],select[wv-parent="' + name + '"]',
						}

						/*
						 * Case find inputs with wv-parent, bind it automatically and 
						 * add the input name as property of the json object
						 */
						self2.ob.find( input.general ).each( function( e2, i2, a2 ){
							var inputName = $( this ).attr( 'name' );
							if( 'undefined' == typeof inputName ) return false;

							/*
							 * In order to avoid error, force property to be string
							 */
							if( ! e.hasOwnProperty( inputName ) || 'string' != typeof e[ inputName ] ){
								if( $( this ).attr( 'type' ) == 'text' || $( this ).is( 'select' ) ){
									e[ inputName ] = $( this ).val();
								}else if( $( this ).attr( 'type' ) == 'checkbox' || $( this ).attr( 'type' ) == 'radio' ){
									if( $( this ).prop( 'checked' ) ){
										e[ inputName ] = true;
									}else{
										e[ inputName ] = false;
									}
								}
							}

							/*
							 * Verify type of input to see the correct action
							 */
							if( $( this ).attr( 'type' ) == 'text' || $( this ).is( 'select' ) ){
								$( this ).val( e[ inputName ] );
							
								internFunction = function(){
									e[ inputName ] = $( this ).val();
								}
							}else if( $( this ).attr( 'type' ) == 'checkbox' || $( this ).attr( 'type' ) == 'radio' ){
								if( e[ inputName ] === 'false' || e[ inputName ] === '0' || e[ inputName ] === false || e[ inputName ] === 0 ){
									$( this ).attr( 'checked', false ).prop( 'checked', false );
								}else{
									$( this ).attr( 'checked', true ).prop( 'checked', true );
								}

								internFunction = function(){
									e[ inputName ] = $( this ).prop( 'checked' );
								}
							}

							/*
							 * Key the value of the input and the json property the same.
							 */
							internBind( $( this ), 'wvinternbind', internFunction );
							
						} );

						/**
						 * bind all inputs that uses wv-parent inside the object
						 * @author Wellington Viveiro <https://github.com/wviveiro>
						 * @param  {Function} callback function to be called when the event is triggered
						 * @return {null} 
						 */
						var bindAll = function( callback ){
							internBind( self2.ob.find( input.general ), 'wvBindAll', callback );
						}

						var bind = function( inputName, callback ){
							internBind( self2.ob.find( 'input[name="' + inputName + '"], select[name="' + inputName + '"]' ), 'wvBindAll', callback );
						}
					}



					/*
					 * object that will be sent in the callback
					 */
					var controller = {
						json 			: e, 
						jq 				: self2.ob,
						index 			: i,
						reRender 		: self.executeRender,
						reRenderUnique 	: self2.renderInternal,
						bindAll 		: bindAll,
						bind 			: bind
					};


					callback( controller );

					container.before( self2.ob );
				}

				self2.renderInternal();

			} );
		}

		self.executeRender();
		
	}

	/**
	 * Bind input with the name selected. Used in two occasions. First internally. when there are input[wv-parent]
	 * and second when user wants to add a custom bind
	 * @author Wellington Viveiro <https://github.com/wviveiro>
	 * @param  {jquery}   jqObj    jquery dom object to bind
	 * @param  {string}   bindName name of the bind to be able to unbind it
	 * @param  {Function} callback function to be called when the event is triggered
	 * @return {null}
	 */
	var internBind = function( jqObj, bindName, callback ){
		var trigger = 'input.';

		switch( jqObj.attr( 'type' ) ){
			case 'checkbox':
			case 'radio':
				trigger = 'change.'
				break;
			default: 
				if( jqObj.is( 'select' ) ){
					trigger = 'change.';
				}
		}

		jqObj.unbind( trigger + bindName ).bind( trigger + bindName, callback );
	}


	var result = {
		render :  render
	}

	
	arg( result );
}