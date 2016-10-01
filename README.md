# wvRender

Contributors: wviveiro

License: GPLv2 or later

License URI: http://www.gnu.org/licenses/gpl-2.0.html

## Introduction

This plugin was created to create forms straight from a JSON object. With this plugin, you are able to create inputs that interacts straight to your JSON object, without the need of create functions to read the content of the input.

## Important

This plugin only works with jQuery. 

## How to use

First of all, you have to have a json object you want to render. The object has to be an array, as below:

```
var myObj = [ {
	name 	: 'John',
	surname : 'Doe',
	email 	: 'john@doe.com'
} ]
```

With the JSON created, you can create the html area which will receive this data:

```
<div wv-name="user">
	<p><label>Name: <input type="text" name="name" wv-parent="user"></label></p>
	<p><label>Surname: <input type="text" name="surname" wv-parent="user"></label></p>
	<p><label>Email: <input type="text" name="email" wv-parent="user"></label></p>
	<p><label>Age: <input type="text" name="age" wv-parent="user"></label></p>
</div>
```

Notice that the main div has an attribute called <strong>wv-name</strong> and all inputs have an attribute called <strong>wv-parent</strong>. It is necessary only if you want to have an automatic bind in your inputs. For this reason the json created will receive a new property called age. If I remove the <strong>wv-parent</strong> from the input age, the json will not receive it.

Now, all you need is to render with wvRender.

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ) );
} );
```

Remember, case there are two objects inside the array, the div will be created twice.

The function accepts a callback, where you can execute other functionalities:

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ), function( controller ){
		console.log( 'created' );
	} );
} );
```

### bind
With the function bind, you can add extra bind in a specific input inside container

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ), function( controller ){
		controller.bind( 'name', function(){
			console.log( 'executes only when input the name' );
		} );
	} );
} );
```

### bindAll
With the function bindAll, you can add extra bind in all inputs with wv-parent inside the container

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ), function( controller ){
		controller.bindAll( function(){
			console.log( 'executes in all inputs' );
		} );
	} );
} );
```

### jq
jq is the container that have all your inputs

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ), function( controller ){
		console.log( controller.jq.find( 'input' ).size() );
	} );
} );
```

### json
it is the object that is being rendered.

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ), function( controller ){
		console.log( controller.json );
	} );
} );
```

### index
index of the object that is being rendered

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ), function( controller ){
		console.log( controller.index );
	} );
} );
```

### reRender
Allows the user to re call the same render when an action happens

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ), function( controller ){
		controller.jq.find( 'input[name="age"]' ).unbind( 'click' ).bind( 'click', function(){
			controller.json.name = 'Robert';
			controller.reRender();
		} );
	} );
} );
```


## Update 0.0.1

In this version, you can create multiple inputs from one single element from your HTML. you can also bind individual inputs and all of them, case you want to do an specific action that the plugin does not do.