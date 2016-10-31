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

	/*
	Function to open loading when saving data.
	 */
	var loading = true;

	/*
	content of the loading, it user wants to add something
	 */
	var contentLoading = '';

	/*
	verify if the save function saved storage or not
	 */
	var storage = false;

	/*
	content of the storage saved
	 */
	var contentStorage = {};


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
		input types
		 */
		var textTypes = [ 'text', 'number', 'password' ];
		var checkTypes = [ 'checkbox', 'radio' ];

		/*
		 * Function calls another function inside, to be able to re render when necessary
		 */
		self.executeRender = function(){

			/*
			 * Case re render, it deletes the objects already created.
			 */
			self.removeChildren = function(){
				if( self.children.length > 0 ){
					self.children.forEach( function( e, i, a ){ e.remove(); } );
				}
			}
			self.removeChildren();

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

					/*
					 * If item is removed, do not render
					 */
					if( e.removed ) return false;

					
					self2.ob = container.clone().removeAttr( 'wv-name' );			
					self.children.push( self2.ob );

					if( 'undefined' != typeof name ){
						var input = {
							general : 'input[wv-parent="' + name + '"],select[wv-parent="' + name + '"]',
						}

						self2.ob.find( '*[wv-inner]' ).each( function( i2 ){
							var innerName = $( this ).attr( 'wv-inner' );
							if( e.hasOwnProperty( innerName ) ){
								$( this ).html( e[ innerName ] );
							}
						} );

						/*
						 * Case find inputs with wv-parent, bind it automatically and 
						 * add the input name as property of the json object
						 */
						self2.ob.find( input.general ).each( function( i2 ){
							var inputName = $( this ).attr( 'name' );
							if( 'undefined' == typeof inputName ) return false;

							/*
							 * In order to avoid error, force property to be string
							 */
							if( ! e.hasOwnProperty( inputName ) || ( 'string' != typeof e[ inputName ] && 'boolean' != typeof e[ inputName ] ) ){
								if( $.inArray( $( this ).attr( 'type' ), textTypes ) > -1 || $( this ).is( 'select' ) ){
									e[ inputName ] = $( this ).val();
								}else if( $.inArray( $( this ).attr( 'type' ), checkTypes ) > -1 ){
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
							if( $.inArray( $( this ).attr( 'type' ), textTypes ) > -1 || $( this ).is( 'select' ) ){
								$( this ).val( e[ inputName ] );
							
								internFunction = function(){
									e[ inputName ] = $( this ).val();
								}
							}else if( $.inArray( $( this ).attr( 'type' ), checkTypes ) > -1 ){
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
							internBind( self2.ob.find( 'input[name="' + inputName + '"], select[name="' + inputName + '"]' ), 'wvBind', callback );
						}
					}

					/**
					 * Remove item from the render
					 * @author Wellington Viveiro <wellington@asmex.digital>
					 * @return {null} 
					 */
					var remove = function(){
						e.removed = true;
						self.executeRender();
					}

					/**
					 * Add empty item to the render
					 * @author Wellington Viveiro <wellington@asmex.digital>
					 * @return {null} 
					 */
					var add = function( jsObj2 ){
						jsObj2.push( {} );
						self.executeRender();
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
						removeChildren 	: self.removeChildren,
						bindAll 		: bindAll,
						bind 			: bind,
						remove 			: remove,
						add 			: add
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

	/**
	 * bind click in button
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @param  {jquery}   jqObj    jquery dom object
	 * @param  {Function} callback function to be called when click. If undefined, it triggers the click
	 * @return {null}            
	 */
	var click = function( jqObj, callback ){
		if( ! callback ){
			jqObj.trigger( 'click.wvClick' );
			return false;
		}

		jqObj.unbind( 'click.wvClick' ).bind( 'click.wvClick', function( ev ){
			callback( ev );
			ev.preventDefault();
		} );
	}

	/**
	 * Change status of loading
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @param  {Boolean} isWorking
	 */
	var setLoad = function( isWorking ){
		loading = isWorking;
	}

	/**
	 * Set content of the loading it user wants
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @param  {jquery} content jquery DOM object or string.
	 */
	var setContentLoading = function( content ){
		contentLoading = content;
	}

	/**
	 * Open loading container
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @return {null} 
	 */
	var openLoading = function(){
		closeLoading();
		if( loading ){
			$( '<div>', { 'wv-loading' : 'true' } ).html( contentLoading ).appendTo( 'body' );
		}
	}

	/**
	 * Redirect user (only difference is that is opens the loading)
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @param  {string} url url to be redirected
	 * @return {null}  
	 */
	var redirect = function( url ){
		openLoading();
		window.location.href = url;
	}

	/**
	 * Remove loading container
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @return {null}
	 */
	var closeLoading = function(){
		$( 'div[wv-loading]' ).remove();
	}

	var valid = function( formName ){
		if( $( 'form[wv-form="' + formName + '"]' ).size() == 0 ) return false;
		var result = true;
	    $( 'form[wv-form="' + formName + '"]' ).find( 'input, textarea, select' ).each( function( i ){
	        if( ! $( this ).valid() ) result = false;
	    } );
	    return result;
	}

	var getIdStorage = function( cont ){
		cont = cont || 1;
		var found = false;
		ls = getStorage();

		ls.forEach( function( e, i, a ){
			if( ! found ){
				if( e.id == cont ){
					found = true;
				}
			}
		} );

		if( found ) return getIdStorage( cont + 1 );

		return cont;
	}

	var saveStorage = function( json ){
		if( ! storage ){
			if( 'undefined' == typeof Storage ) return false;
			

			if( localStorage.getItem( 'wvrender' ) == null ){
				localStorage.setItem( 'wvrender', '[]' );
			}


			ls = getStorage();

			contentStorage = {
				id : getIdStorage(),
				name : json.storage.name,
				content : json.data
			};

			if( json.nameStorage ){
				contentStorage.nameStorage = json.nameStorage;
			}

			ls.push( contentStorage );

			setStorage( ls );

			storage = true;
		}else{
			ls = getStorage();
			var found = false;
			ls.forEach( function( e, i, a ){
				if( e.id == contentStorage.id ){
					e.content = json.data;
					found = true;
				}
			} );
			if( found ){
				setStorage( ls );
			}else{
				storage = false;
				saveStorage( json );
			}
		}
	}

	var deleteStorage = function( id ){
		ls = getStorage();
		ls.forEach( function( e, i, a ){
			if( e.id == id ){
				ls.splice( i, 1 );
				storage = false;
				contentStorage = {};
			}
		} );
		setStorage( ls );
	}

	var selectStorage = function( id ){
		ls = getStorage();
		ls.forEach( function( e, i, a ){
			if( e.id == id ){
				storage = true;
				contentStorage = e;
			}
		} );
		return contentStorage;
	}


	/**
	 * Save function
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @param  {json} internArgs arguments to send to ajax function
	 * @return {null}            
	 */
	var save = function( internArgs ){
		openLoading();

		if( internArgs.storage ){
			saveStorage( internArgs );

			delete internArgs.storage
		}

		var defaultArgs = {
	        url : '/',
	        dataType : 'json',
	        method : 'post',
	        data : {}
	    } 

	    $.extend( defaultArgs, internArgs );

	    defaultArgs.success = function( result ){
	    	closeLoading();
	    	if( result.success ){
	    		if( contentStorage.id ){
    				deleteStorage( contentStorage.id );
    			}

	    		if( internArgs.success ){
	    			internArgs.success( result );
	    		}
	    	}else{
	    		if( internArgs.fail ){
	    			internArgs.fail( result );
	    		}
	    	}
	    }

	    defaultArgs.error = function( a, b, c ){
	    	closeLoading();
	    	console.log( 'An error has happened' );
	        console.log( a, b, c );
	        if( internArgs.error ){
    			internArgs.error( a, b, c );
    		}
	    }

	    $.ajax( defaultArgs );
	}

	var getStorage = function(){
		var ls = JSON.parse( localStorage.getItem( 'wvrender' ) );
		return ls;
	}

	var setStorage = function( ls ){
		localStorage.setItem( 'wvrender', JSON.stringify( ls ) );
	}



	var result = {
		render :  render,
		click : click,
		redirect : redirect,
		setLoad : setLoad,
		valid : valid,
		save : save,
		getStorage : getStorage,
		deleteStorage : deleteStorage,
		selectStorage : selectStorage
	}

	
	arg( result );
}