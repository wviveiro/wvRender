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
				
				/*
				 * [ob description]
				 */
				var ob = container.clone().removeAttr( 'wv-name' );			
				self.children.push( ob );

				if( 'undefined' != typeof name ){
					/*
					 * Case find inputs with wv-parent, bind it automatically and 
					 * add the input name as property of the json object
					 */
					ob.find( 'input[wv-parent="' + name + '"]' ).each( function( e2, i2, a2 ){
						var inputName = $( this ).attr( 'name' );
						if( 'undefined' == typeof inputName ) return false;

						/*
						 * In order to avoid error, force property to be string
						 */
						if( ! e.hasOwnProperty( inputName ) || 'string' != typeof e[ inputName ] ){
							e[ inputName ] = $( this ).val();
						}
						$( this ).val( e[ inputName ] );

						/*
						 * Key the value of the input and the json property the same.
						 */
						internBind( $( this ), 'wvinternbind', function(){
							e[ inputName ] = $( this ).val();
						} );
					} );

					/**
					 * bind all inputs that uses wv-parent inside the object
					 * @author Wellington Viveiro <https://github.com/wviveiro>
					 * @param  {Function} callback function to be called when the event is triggered
					 * @return {null} 
					 */
					var bindAll = function( callback ){
						internBind( ob.find( 'input[wv-parent="' + name + '"]' ), 'wvBindAll', callback );
					}

					var bind = function( inputName, callback ){
						internBind( ob.find( 'input[wv-parent="' + name + '"][name="' + inputName + '"]' ), 'wvBindAll', callback );
					}
				}



				/*
				 * object that will be sent in the callback
				 */
				var controller = {
					json 		: e, 
					jq 			: ob,
					index 		: i,
					reRender 	: self.executeRender,
					bindAll 	: bindAll,
					bind 		: bind
				};


				callback( controller );

				container.before( ob );
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
		jqObj.unbind( 'input.' + bindName ).bind( 'input.' + bindName, callback );
	}


	var result = {
		render :  render
	}

	
	arg( result );
}