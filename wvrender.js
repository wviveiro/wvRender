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
	 * @return controller        
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
		var checkTypes = [ 'checkbox' ];
		var radioTypes = [ 'radio' ];

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
			var counter = 0; //used to count how many objects are valid (IT IS NOT INDEX)

			
			controller = null;

			jsObj.forEach( function( e, i, a ){
				
				/**
				 * Self2 is used case user wants to render unique
				 */
				var self2 = {};

				self2.setter = {};

				/**
				 * get the object property from levels
				 * @author Wellington Viveiro <wellington@asmex.digital>
				 * @param  {string} property levels
				 * @param  {string} value case wants to give a value for the object
				 * @return {Object}          
				 */	
				var getObjLevel = function( property, value ){
					var obj = e;

					property = property.replace( name + '.', '' ).split( '.' );
					property.forEach( function( prop, i_prop ){
						if( obj.hasOwnProperty( prop ) ){
							if( i_prop == property.length - 1 ){
								if( typeof value != 'undefined' ) obj[ prop ] = value;
								obj = obj[ prop ];
							}else{
								obj = obj[ prop ];
							}
						}else{
							if( i_prop == property.length - 1 ){
								obj[ prop ] = value || false;
								obj = obj[ prop ];
							}else{
								obj[ prop ] = {};
								obj = obj[ prop ];
							}
						}
					} );
					return obj;
				}

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
					if( e.removed && e.removed !== 'false' ) return false;

					counter++;

					
					self2.ob = container.clone().removeAttr( 'wv-name' );

					self.children.push( self2.ob );

					if( 'undefined' != typeof name ){
						var input = {
							general : 'input[wv-parent="' + name + '"],select[wv-parent="' + name + '."]',
						}

						self2.ob.find( '[wv-inner^="' + name + '."]' ).each( function( i2 ){
							var inputObj = $( this );
							var inputName = inputObj.attr( 'wv-inner' );

							var wvInnerFunc = function(){
								var obj = getObjLevel( inputName );
								if( obj !== false ){
									inputObj.html( obj );
								}
							}
							wvInnerFunc();

							self2.setter[ inputName ] = self2.setter[ inputName ] || [];
							self2.setter[ inputName ].push( wvInnerFunc );

						} );

						self2.ob.find( '[wv-input^="' + name + '."]' ).each( function( i2 ){
							var inputObj = $( this );
							var inputName = inputObj.attr( 'wv-input' );

							if( $.inArray( inputObj.attr( 'type' ), textTypes ) > -1 || inputObj.is( 'select' ) ){
								
								//Function to add JSON value into DOM value
								var externalFunction = function(){
									var obj = getObjLevel( inputName );
									if( obj !== false ){
										inputObj.val( obj );
									}
								}

								//Function to add DOM value int JSON value
								var internFunction = function(){
									getObjLevel( inputName, inputObj.val() );
								}
							}else if( $.inArray( inputObj.attr( 'type' ), checkTypes ) > -1 ){
								//Function to add JSON value into DOM value
								var externalFunction = function(){
									var obj = getObjLevel( inputName );
									if( obj === 'false' || obj === '0' || obj === false || obj === 0 ){
										inputObj.prop( 'checked', false ).attr( 'checked', false );
									}else{
										inputObj.prop( 'checked', true ).attr( 'checked', true );
									}
								}

								//Function to add DOM value int JSON value
								var internFunction = function(){
									getObjLevel( inputName, inputObj.prop( 'checked' ) );
								}
							}else if( $.inArray( inputObj.attr( 'type' ), radioTypes ) > -1 ){
								
								var externalFunction = function(){
									var obj = getObjLevel( inputName );
									self2.ob.find( 'input[type="radio"][wv-input="' + inputName + '"]' )
												.prop( 'checked', false ).attr( 'checked', false );
									self2.ob.find( 'input[type="radio"][wv-input="' + inputName + '"][value="' + obj + '"]' )
												.prop( 'checked', true ).attr( 'checked', true );

								}

								var internFunction = function(){
									var obj = getObjLevel( inputName );
									getObjLevel( inputName, inputObj.val() );
									self2.ob.find( 'input[type="radio"][wv-input="' + inputName + '"]' )
									.prop( 'checked', false ).attr( 'checked', false );
									inputObj.prop( 'checked', true ).attr( 'checked', true );
								}
							}else{
								var externalFunction = function(){};
								var internFunction = function(){};
							}

							externalFunction();
							self2.setter[ inputName ] = self2.setter[ inputName ] || [];
							self2.setter[ inputName ].push( externalFunction );
							internBind( inputObj, 'wvinternbind', internFunction );
						} );

						/**
						 * Special treatment for radio buttons which need to receive an extra attribute to work
						 */
						self2.ob.find( 'input[type="radio"][wv-parent="' + name + '"]' ).each( function(){
							$( this ).attr( 'wv-radio-name', $( this ).attr( 'name' ) ).removeAttr( 'name' );
						} );

						/*
						 * Case find inputs with wv-parent, bind it automatically and 
						 * add the input name as property of the json object
						 */
						self2.ob.find( input.general ).each( function( i2 ){
							var inputObj = $( this );
							var inputName = inputObj.attr( 'name' );
							if( 'undefined' == typeof inputName ){
								inputName = inputObj.attr( 'wv-radio-name' ); //Verify if there is a radio name
								if( 'undefined' == typeof inputName ) return false;
							}

							/*
							 * In order to avoid error, force property to be string
							 */
							var arrTypeofValid = [ 'boolean', 'number', 'string' ];
							if( ! e.hasOwnProperty( inputName ) || ( ! $.inArray( typeof inputName, arrTypeofValid ) ) ){
								if( $.inArray( inputObj.attr( 'type' ), textTypes ) > -1 || inputObj.is( 'select' ) ){
									e[ inputName ] = inputObj.val();
								}else if( $.inArray( inputObj.attr( 'type' ), checkTypes ) > -1 ){
									if( inputObj.prop( 'checked' ) ){
										e[ inputName ] = true;
									}else{
										e[ inputName ] = false;
									}
								}else if( $.inArray( inputObj.attr( 'type' ), radioTypes ) > -1 ){
									e[ inputName ] = '';
									if( inputObj.prop( 'checked' ) ){
										e[ inputName ] = inputObj.val();
										self2.ob.find( 'input[type="radio"][wv-radio-name="' + inputName + '"]' )
											.prop( 'checked', false ).attr( 'checked', false );
										inputObj.prop( 'checked', true ).attr( 'checked', true );
									}
								}
							}

							/*
							 * Verify type of input to see the correct action
							 */
							if( $.inArray( inputObj.attr( 'type' ), textTypes ) > -1 || inputObj.is( 'select' ) ){
								
								externalFunction = function(){
									inputObj.val( e[ inputName ] );
								}

								externalFunction();

								internFunction = function(){
									e[ inputName ] = inputObj.val();
								}
							}else if( $.inArray( inputObj.attr( 'type' ), checkTypes ) > -1 ){
								externalFunction = function(){
									if( e[ inputName ] === 'false' || e[ inputName ] === '0' || e[ inputName ] === false || e[ inputName ] === 0 ){
										inputObj.attr( 'checked', false ).prop( 'checked', false );
									}else{
										inputObj.attr( 'checked', true ).prop( 'checked', true );
									}
								}

								externalFunction();

								internFunction = function(){
									e[ inputName ] = inputObj.prop( 'checked' );
								}
							}else if( $.inArray( inputObj.attr( 'type' ), radioTypes ) > -1 ){
								
								externalFunction = function(){
									if( e[ inputName ] == inputObj.val() ){
										self2.ob.find( 'input[type="radio"][wv-radio-name="' + inputName + '"]' )
												.prop( 'checked', false ).attr( 'checked', false );
											inputObj.prop( 'checked', true ).attr( 'checked', true );
									}
								}

								externalFunction();

								internFunction = function(){
									e[ inputName ] = inputObj.val();
									self2.ob.find( 'input[type="radio"][wv-radio-name="' + inputName + '"]' )
											.prop( 'checked', false ).attr( 'checked', false );
										inputObj.prop( 'checked', true ).attr( 'checked', true );
								}
							}

							/*
							 * Key the value of the input and the json property the same.
							 */
							internBind( inputObj, 'wvinternbind', internFunction );

							/*
							 * Create a setter to call the external function and bind back to the object
							 */
							externalFunction = externalFunction || function(){};
							self2.setter[ inputName ] = self2.setter[ inputName ] || [];

							self2.setter[ inputName ].push( externalFunction );
							
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
							internBind( self2.ob.find( 'input[name="' + inputName + '"], input[type="radio"][wv-radio-name="' + inputName + '"], select[name="' + inputName + '"]' ), 'wvBind', callback );
							var inputName2 = `${name}.${inputName}`;
							internBind( self2.ob.find( '[wv-input="' + inputName2 + '"]' ), 'wvBind', callback );
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

					/**
					 * Bind back to the DOM object
					 * @author Wellington Viveiro <wellington@asmex.digital>
					 * @param  {string} inputName input name
					 * @param  {string} value     new value (can be number, and boolean as well)
					 */
					var set = function( inputName, value ){
						inputName = `${name}.${inputName}`;


						var obj = getObjLevel( inputName, value );

						if( self2.setter.hasOwnProperty( inputName ) ){
							self2.setter[ inputName ].forEach( function( s ){
								s();
							} );
						}
					}



					/*
					 * object that will be sent in the callback
					 */
					controller = {
						json 			: e, 
						jq 				: self2.ob,
						index 			: i,
						counter 		: counter,
						reRender 		: self.executeRender,
						reRenderUnique 	: self2.renderInternal,
						removeChildren 	: self.removeChildren,
						bindAll 		: bindAll,
						bind 			: bind,
						remove 			: remove,
						add 			: add,
						set 			: set
					};


					callback( controller );

					container.before( self2.ob );
				}

				self2.renderInternal();

			} );

			return controller;
		}

		return self.executeRender();
		
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

	/**
	 * get storager saved in wvrender
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @return {json} storage
	 */
	var getStorage = function(){
		var ls = JSON.parse( localStorage.getItem( 'wvrender' ) );
		return ls;
	}

	/**
	 * set wvrender storage
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @param  {json} ls data to be saved
	 */
	var setStorage = function( ls ){
		localStorage.setItem( 'wvrender', JSON.stringify( ls ) );
	}

	/**
	 * Submit a form (like ajax but not ajax)
	 * @author Wellington Viveiro <wellington@asmex.digital>
	 * @param  {string} url    form url
	 * @param  {json} data   data to be sent
	 * @param  {string} method get or post
	 * @return {jquery DOM}        form
	 */
	var form = function(url, data, method) {
        if (method == null) method = 'POST';
        if (data == null) data = {};

        var auxForm = $('<form>').attr({
            method: method,
            action: url
         }).css({
            display: 'none'
         });

        var addData = function(name, data) {
            if ( $.isArray(data) ) {
                for (var i = 0; i < data.length; i++) {
                    var value = data[i];
                    addData(name + '[' + i + ']', value);
                }
            } else if (typeof data === 'object') {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        addData(name + '[' + key + ']', data[key]);
                    }
                }
            } else if (data != null) {
                auxForm.append($('<input>').attr({
                  type: 'hidden',
                  name: String(name),
                  value: String(data)
                }));
            }
        };

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                addData(key, data[key]);
            }
        }

        return auxForm;
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
		selectStorage : selectStorage,
		form : form
	}

	
	arg( result );
}