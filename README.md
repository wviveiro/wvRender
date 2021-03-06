# wvRender

Contributors: wviveiro

License: GPLv2 or later

License URI: http://www.gnu.org/licenses/gpl-2.0.html

## Introduction

This plugin was created to create forms straight from a JSON object. With this plugin, you are able to create inputs that interacts straight to your JSON object, without the need of create functions to read the content of the input.

## Important

This plugin only works with jQuery. 

## Version 0.1.0

Now you don't need wv-parent anymore, you can just use wv-input! Check at the end of the documentation how to use it.

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

### reRenderUnique
Allows the user to re call the same render when an action happens. The difference between this and the function <strong>reRender</strong> is that this one renders only on specific interation. the other render all the object.

```
wvRender( function( wv ){
	wv.render( myObj, $( 'div[wv-name="user"]' ), function( controller ){
		controller.jq.find( 'input[name="age"]' ).unbind( 'click' ).bind( 'click', function(){
			if( controller.index == 0 ){
				controller.json.name = 'Robert';
				controller.reRenderUnique();
			}
		} );
	} );
} );
```

### save
Call an ajax function to save the object. Arguments are the same as in $.ajax function. the default args are:

{
    url : '/',
    dataType : 'json',
    method : 'post',
    data : {}
} 

Success function is only called with a json object is received with a variable success == true.

```
wvRender( function( wv ){
	wv.save( args );
} );
```

### click
Same as .bind( 'click' ). However it unbind first and create a custom bind not to mess with other clicks.

```
wvRender( function( wv ){
	wv.click( $( '.obj' ), function(){} );
} );
```

### removeChildren
remove all children created by the render.

```
wvRender( function( wv ){
	wv.render( jsObj, $( 'div[wv-name="test"]' ), function( controller ){
		wv.click( controller.jq.find( '.remove' ), function(){
			controller.removeChildren();
		} );
	}  );
} );
```

### redirect
Same as window.location.href, the difference is that it opens the loading if set up.

```
wvRender( function( wv ){
	wv.redirect( 'http://google.com' );
} );
```


### form
simulate form to send POST or GET data to another page. So, there is no reason to create inputs. ( From: http://stackoverflow.com/a/8284150/4936992 )

```
wvRender( function( wv ){
	wv.form( '/page', { title : 'Hellow World' } );
} );
```

### wv-input
It is similar to wv-parent, however, you don't need to add name anymore and it accepts multi level

```
<div wv-name="user">
	<p><label>Name: <input type="text" wv-input="user.name"></label></p>
	<p><label>Surname: <input type="text" wv-input="user.surname"></label></p>
	<p><label>Email: <input type="text" wv-input="user.email"></label></p>
	<p><label>Age: <input type="text" wv-input="user.age"></label></p>
	<p><label>Is tall? <input type="checkbox" wv-input="user.is_tall"></label></p>
	<p><label>Male <input type="radio" wv-input="user.sex" value="male"></label> <label>Female <input type="radio" wv-input="user.sex" value="female"></label></p>
</div>
```

### set
binds back the value to the DOM object

```
wvRender( function( wv ){
	wv.render( [ user ], $( '[wv-name="user"]' ), function(){
		c.set( 'sex', 'male' );
	} );
} );
```



## Update 0.1.0


Attribute wv-input with multi levels
Attribute wv-inner with multi levels to render HTML
Function set to bind back to DOM


multi level objects

## Update 0.0.9

Fix problem with new feature to delete child

## Update 0.0.8

Fix problem with new feature to delete child

## Update 0.0.7

Add function to remove child automatically even without using reRender

## Update 0.0.6

Fix issue with form

## Update 0.0.5

Add form function

## Update 0.0.4

Add redirect function

## Update 0.0.3

Add function to save data.

Add function to click

Add function to remove children

## Update 0.0.2

Add the function to render unique interation.

## Update 0.0.1

In this version, you can create multiple inputs from one single element from your HTML. you can also bind individual inputs and all of them, case you want to do an specific action that the plugin does not do.