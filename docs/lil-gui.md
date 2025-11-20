# lil-gui

Makes a floating panel for controllers on the web. Works as a drop-in replacement for dat.gui in most projects. See [Migrating][1] for a list of breaking changes.

[Basic Demo][2] • [Examples][3] • [Guide][4] • [API][5] • [GitHub][6]

```js
import GUI from 'lil-gui';

const gui = new GUI();

const myObject = {
	myBoolean: true,
	myFunction: function() { ... },
	myString: 'lil-gui',
	myNumber: 1
};

gui.add( myObject, 'myBoolean' );  // Checkbox
gui.add( myObject, 'myFunction' ); // Button
gui.add( myObject, 'myString' );   // Text Field
gui.add( myObject, 'myNumber' );   // Number Field

// Add sliders to number fields by passing min and max
gui.add( myObject, 'myNumber', 0, 1 );
gui.add( myObject, 'myNumber', 0, 100, 2 ); // snap to even numbers

// Create dropdowns by passing an array or object of named values
gui.add( myObject, 'myNumber', [ 0, 1, 2 ] );
gui.add( myObject, 'myNumber', { Label1: 0, Label2: 1, Label3: 2 } );

// Chainable methods
gui.add( myObject, 'myProperty' )
	.name( 'Custom Name' )
	.onChange( value => {
		console.log( value );
	} );

// Create color pickers for multiple color formats
const colorFormats = {
	string: '#ffffff',
	int: 0xffffff,
	object: { r: 1, g: 1, b: 1 },
	array: [ 1, 1, 1 ]
};

gui.addColor( colorFormats, 'string' );
```

[Built Source][7] • [Minified][8] = 29.4kb, **7.9kb** gzipped

# Examples

- [Basic Demo][9]
- [Kitchen Sink][10] - Exhaustive demonstration of features and styles.
- [three.js examples][11] - Many three.js examples feature lil-gui.
- [PixiJS Filters Demo][12] - Procedurally creates a lil-gui for every filter in PixiJS.

# Guide

**lil-gui** gives you an interface for changing the properties of any JavaScript object at runtime. It's intended as a drop-in replacement for [dat.gui][13], implemented with more modern web standards and some new quality of life features.

The [Migrating][1] section lists any breaking changes between the two libraries. The changes are limited to the lesser-used portions of the API, but you should read it before moving a project to lil-gui.

If you've used dat.gui before, the beginning of this guide will be review. New features are introduced beginning in the [Change Events][14] section.

## Installation

You can install lil-gui with npm for use with a bundler.

```sh
$ npm install lil-gui --save-dev
```

```js
import GUI from "lil-gui";
```

For quick sketches, you can import lil-gui directly from a CDN.

```html
<script type="module">
  import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm";
</script>
```

The library is also available in UMD format under the namespace `lil`.

```html
<script src="https://cdn.jsdelivr.net/npm/lil-gui@0.21"></script>
<script>
  var GUI = lil.GUI;
</script>
```

## Adding Controllers

This code creates an input that lets you change this page's title.

```js
const gui = new GUI();
gui.add(document, "title");
```

lil-gui will choose an appropriate controller based on the property's data type. Since `document.title` is a string, a text field is created.

Here are some more of the data types you can control:

```js
obj = {
  myBoolean: true,
  myString: "lil-gui",
  myNumber: 1,
  myFunction: function () {
    alert("hi");
  },
};

gui.add(obj, "myBoolean"); // checkbox
gui.add(obj, "myString"); // text field
gui.add(obj, "myNumber"); // number field
gui.add(obj, "myFunction"); // button
```

## Numbers and Sliders

Numbers can be constrained to a range using `min()` and `max()`. You can use `step()` to round values to multiples of a given number.

```js
obj = { hasMin: 1, hasMax: 99, hasStep: 50 };

gui.add(obj, "hasMin").min(0);
gui.add(obj, "hasMax").max(100);
gui.add(obj, "hasStep").step(10);
```

Number controllers with a minimum and a maximum automatically become sliders. You can use an abbreviated syntax to define them both at once.

```js
obj = { number1: 1, number2: 50 };

gui.add(obj, "number1", 0, 1); // min, max
gui.add(obj, "number2", 0, 100, 10); // min, max, step
```

## Dropdowns

You can create a dropdown for any data type by providing an array of accepted values. If you pass an object, its keys will be used as labels for the options.

```js
obj = { size: "Medium", speed: 1 };

gui.add(obj, "size", ["Small", "Medium", "Large"]);
gui.add(obj, "speed", { Slow: 0.1, Normal: 1, Fast: 5 });
```

Small

Slow

## Colors

lil-gui recognizes colors in a number of formats: CSS strings, RGB objects or integer hex values to name a few. You can use `addColor()` to create a color picker for controlling these values.

```js
obj = {
  color1: "#AA00FF",
  color2: "#a0f",
  color3: "rgb(170, 0, 255)",
  color4: 0xaa00ff,
};

gui.addColor(obj, "color1");
gui.addColor(obj, "color2");
gui.addColor(obj, "color3");
gui.addColor(obj, "color4");
```

lil-gui uses an `rrggbb` format for display, but it honors the original _data type_ when writing colors (numbers remain numbers, strings remain strings). However, all string-based colors are normalized to `#rrggbb` format on update.

### RGB Objects & Arrays

Some libraries use objects or arrays of RGB values to describe colors. These can also be controlled by `addColor()`. The color channels are assumed to be between 0 and 1, but you can also set your own range. Color objects and arrays are never replaced—only their components are modified.

```js
obj = {
  colorObject: { r: 0.667, g: 0, b: 1 },
  colorArray: [0.667, 0, 1],
};

gui.addColor(obj, "colorObject");
gui.addColor(obj, "colorArray");
```

### RGB Channel Ranges

The channel range for RGB objects and arrays can be overriden per controller by passing a third parameter to `addColor()`. If your colors are coming out too bright, you might need to set this to 255.

```js
obj = {
  colorObject: { r: 170, g: 0, b: 255 },
  colorArray: [170, 0, 255],
};

gui.addColor(obj, "colorObject", 255);
gui.addColor(obj, "colorArray", 255);
```

## Folders

You can organize controllers in collapsible groups using `addFolder()`. The method returns a new GUI instance representing the folder. You can add controllers to the folder just like you would with any GUI.

```js
// top level controller
gui.add(obj, "scale", 0, 1);

// nested controllers
const folder = gui.addFolder("Position");
folder.add(obj, "x");
folder.add(obj, "y");
folder.add(obj, "z");
```

## Change Events

If you want to call a function every time a controller is changed, you can pass it to the controller's `onChange` method. The new value will be passed to your function after every change (so long as it originates from that controller and not from code elsewhere).

```js
gui.add(params, "foo").onChange((value) => {
  console.log(value);
});
```

The `onFinishChange` handler fires after a controller changes and loses focus. This comes in handy if you're using a slow function with a controller that produces continuous change events (like a slider or color picker).

```js
gui.add(params, "foo").onFinishChange(complexFunction);
```

### Global Change Handlers

GUI also provides an `onChange` handler that fires after changes to any of its children. These handlers receive an event object with details about the controller that was modified.

```js
gui.onChange((event) => {
  event.object; // object that was modified
  event.property; // string, name of property
  event.value; // new value of controller
  event.controller; // controller that was modified
});
```

`GUI.onChange` events bubble upward. A handler applied to the root GUI will fire after every change. Handlers applied to folders will only be called after changes to that folder or its descendents.

`GUI.onFinishChange` works just like `GUI.onChange`, but it only fires at the end of change events.

### Listening and Updating

If a value controlled by the GUI is changed in code anywhere outside of the GUI, the new value won't be reflected by the controller's display. You can call `listen()` to update the controller's display every frame.

```js
gui.add( params, 'feedback', -1, 1 )
   .listen()
   .disable();

animate() {
	params.feedback = Math.sin( Date.now() / 1000 );
}
```

You can also call `controller.updateDisplay()` at any time to manage this behavior yourself.

## Saving

Using `gui.save()`, you can create an object that saves the current value of all properties added to the GUI. You can pass that object to `gui.load()` to restore the saved values.

The following creates a GUI that can save a preset. Press the savePreset button, then modify any controller. Pressing the loadPreset button restores the values you saved.

```js
let preset = {};

const obj = {
  value1: "original",
  value2: 1996,
  savePreset() {
    // save current values to an object
    preset = gui.save();
    loadButton.enable();
  },
  loadPreset() {
    gui.load(preset);
  },
};

gui.add(obj, "value1");
gui.add(obj, "value2");

gui.add(obj, "savePreset");

const loadButton = gui.add(obj, "loadPreset");
loadButton.disable();
```

### Save Object Format

The following is an example of an object returned by `gui.save()`. The object will be JSON compatible. It can be saved to disk, _unless_ you're using non-primitive data types in a dropdown (color objects and arrays are fine).

```js
{
	controllers: {
		value1: 'original',
		value2: 1996,
	},
	folders: {
		// if GUI has folders ...
		folderName1: { controllers, folders },
		folderName2: { controllers, folders }
		...
	}
}
```

Both save and load accept a `recursive` parameter, which is true by default. Use `save( false )` and `load( data, false )` to ignore any folders within the GUI. The saved object will contain an empty folders object.

### Name Collisions

`save()` will throw an error if the GUI contains more than one controller or folder with the same name. You can avoid these collisions by renaming the controllers with `name()`.

```js
gui.add(position, "x").name("position.x");
gui.add(rotation, "x").name("rotation.x");
```

## Styling

By default, the GUI is added to `document.body` and attached to the top right of the window with fixed positioning. You can add the GUI to a different element by passing a `container` parameter to the constructor.

```js
const gui = new GUI({ container: $("#gui") });
```

Use `.lil-root` to target the GUI's root element.

### Width and Long Names

The GUI can be made wider by passing a pixel width to the constructor. This is usually done when controller names are too long to fit within the panel.

```js
const gui = new GUI({ width: 400 });
```

The library provides a few ways to manage this using CSS variables as well.

```
.lil-gui {
	--width: 400px;
	--name-width: 65%;
}
```

The `--width` property does the same thing as the one in the constructor, but allows us to use any valid CSS value. Adjusting `--name-width` allows you to increase the size of names relative to controllers, which might be better than enlarging the entire panel.

### CSS Variables and Custom Stylesheets

lil-gui exposes a number of CSS variables that allow you to customize colors and dimensions. You can see an exhaustive list of these variables in the [Kitchen Sink][10] demo.

```
.lil-gui {
	--background-color: #000;
	--widget-color: #0af;
	--padding: 2px;
}
```

If you want to start a new stylesheet from scratch, the default styles can be left out entirely with the `injectStyles` parameter.

```js
new GUI({ injectStyles: false });
```

### Touch Styles

Controllers are larger on touch devices to make them easier to use. By default, these styles are applied using a CSS query: `@media (pointer: coarse)`. You can disable this behavior with the `touchStyles` parameter.

```js
gui = new GUI({ touchStyles: false });
gui.domElement.classList.add("force-touch-styles");
```

You can then apply these styles at a time of your choosing by adding the `.force-touch-styles` CSS class to the GUI's root element.

# Migrating

For most projects, moving from dat.gui to lil-gui should be as simple as changing the import URL. The API is designed to be as backwards-compatible as is reasonably possible, but this section aims to address any breaking changes.

## API Changes

- `gui.__controllers` is now `gui.controllers`.
- `gui.__folders` is now `gui.folders` and it's an array, not a map.
- `gui.remove( controller )` is now `controller.destroy()`.
- `gui.removeFolder( folder )` is now `folder.destroy()`.
- Folders are open by default.

## DOM Structure

The DOM structure of the GUI has changed, so code that interacts with dat.gui's inner DOM elements is likely to break.

- `gui.__ul` is now `gui.$children`.
- `gui.__closeButton` is now `gui.$title`.
- `domElement` is still `domElement` for both Controller and GUI.

CSS class names are also different:

- `.dg.ac` is now `.lil-auto-place`.

## Color Controller Changes

There's one major difference in the way dat.gui and lil-gui handle color controllers: channel ranges for RGB objects and RGB arrays are assumed to be in the range of `[0-255]` in dat.gui and `[0-1]` in lil-gui.

In general, this shouldn't have much of an impact, as it's common practice to use hex values and an `onChange` handler when using dat.gui with a library like three.js that expects RGB `[0-1]`.

```js
// common three.js + dat.gui color pattern
params = { color: color.getHex() };

dat_gui.addColor(params, "color").onChange((v) => {
  color.setHex(v);
});
```

Since lil-gui and three.js agree on RGB ranges, this code can be simplified:

```js
params = { color };

lil_gui.addColor(params, "color");
```

The other differences in color handling are fairly minor:

- lil-gui always writes to `#rrggbb` format for strings, even those defined as `rgb()` or `#RGB`.
- lil-gui uses the native HTML `input[type=color]` tag instead of a custom color picker.
- lil-gui doesn't support any HSL or alpha color formats.

## Removed

- "Presets" and `gui.remember()` are gone in favor of `save/load()`, which also removes mention of `localStorage`.
- The static `GUI.toggleHide()` method and the H to hide hotkey.

# API

## [GUI][15]

- [constructor][16]
- [add()][17]
- [addColor()][18]
- [addFolder()][19]
- [load()][20]
- [save()][21]
- [open()][22]
- [close()][23]
- [show()][24]
- [hide()][25]
- [title()][26]
- [reset()][27]
- [onChange()][28]
- [onFinishChange()][29]
- [onOpenClose()][30]
- [destroy()][31]
- [controllersRecursive()][32]
- [foldersRecursive()][33]
- [children][34]
- [controllers][35]
- [domElement][36]
- [folders][37]
- [parent][38]
- [root][39]
- [$children][40]
- [$title][41]
- [\_closed][42]
- [\_hidden][43]
- [\_onChange][44]
- [\_onFinishChange][45]
- [\_title][46]

## [Controller][47]

- [name()][48]
- [onChange()][49]
- [onFinishChange()][50]
- [reset()][51]
- [enable()][52]
- [disable()][53]
- [show()][54]
- [hide()][55]
- [options()][56]
- [min()][57]
- [max()][58]
- [step()][59]
- [decimals()][60]
- [listen()][61]
- [getValue()][62]
- [setValue()][63]
- [updateDisplay()][64]
- [destroy()][65]
- [domElement][66]
- [initialValue][67]
- [object][68]
- [parent][69]
- [property][70]
- [$disable][71]
- [$name][72]
- [$widget][73]
- [\_disabled][74]
- [\_hidden][75]
- [\_listening][76]
- [\_name][77]
- [\_onChange][78]
- [\_onFinishChange][79]

# GUI

## new **GUI**( { autoPlace, container, width, title, closeFolders, injectStyles, touchStyles, parent } )

Creates a panel that holds controllers.

```js
new GUI();
new GUI({ container: document.getElementById("custom") });
```

- **autoPlace** - Adds the GUI to `document.body` and fixes it to the top right of the page.\
  Default: `true`
- **container** - Adds the GUI to this DOM element. Overrides `autoPlace`.\
  Optional: `Node`
- **width** - Width of the GUI in pixels, usually set when name labels become too long. Note that you can make name labels wider in CSS with `.lil‑gui { ‑‑name‑width: 55% }`.\
  Default: `245`
- **title** - Name to display in the title bar.\
  Default: `Controls`
- **closeFolders** - Pass `true` to close all folders in this GUI by default.\
  Optional: `boolean`
- **injectStyles** - Injects the default stylesheet into the page if this is the first GUI. Pass `false` to use your own stylesheet.\
  Default: `true`
- **touchStyles** - Makes controllers larger on touch devices. Pass `false` to disable touch styles.\
  Default: `true`
- **parent** - Adds this GUI as a child in another GUI. Usually this is done for you by `addFolder()`.\
  Optional: `GUI`

## gui.**add**( object, property, \[$1], \[max], \[step] )

Adds a controller to the GUI, inferring controller type using the `typeof` operator.

```js
gui.add(object, "property");
gui.add(object, "number", 0, 100, 1);
gui.add(object, "options", [1, 2, 3]);
```

- **object** - The object the controller will modify.\
  Required: `object`
- **property** - Name of the property to control.\
  Required: `string`
- **$1** - Minimum value for number controllers, or the set of selectable values for a dropdown.\
  Optional: `number` or `object` or `Array`
- **max** - Maximum value for number controllers.\
  Optional: `number`
- **step** - Step value for number controllers.\
  Optional: `number`

**Returns**: `Controller`

## gui.**addColor**( object, property, rgbScale=1 )

Adds a color controller to the GUI.

```js
params = {
  cssColor: "#ff00ff",
  rgbColor: { r: 0, g: 0.2, b: 0.4 },
  customRange: [0, 127, 255],
};

gui.addColor(params, "cssColor");
gui.addColor(params, "rgbColor");
gui.addColor(params, "customRange", 255);
```

- **object** - The object the controller will modify.\
  Required: `object`
- **property** - Name of the property to control.\
  Required: `string`
- **rgbScale** - Maximum value for a color channel when using an RGB color. You may need to set this to 255 if your colors are too bright.\
  Default: `1`

**Returns**: `Controller`

## gui.**addFolder**( title )

Adds a folder to the GUI, which is just another GUI. This method returns the nested GUI so you can add controllers to it.

```js
const folder = gui.addFolder("Position");
folder.add(position, "x");
folder.add(position, "y");
folder.add(position, "z");
```

- **title** - Name to display in the folder's title bar.\
  Required: `string`

**Returns**: `GUI`

## gui.**load**( obj, recursive=true )

Recalls values that were saved with `gui.save()`.

- **obj**\
  Required: `object`
- **recursive** - Pass false to exclude folders descending from this GUI.\
  Default: `true`

**Returns**: `this`

## gui.**save**( recursive=true )

Returns an object mapping controller names to values. The object can be passed to `gui.load()` to recall these values.

```js
{
	controllers: {
		prop1: 1,
		prop2: 'value',
		...
	},
	folders: {
		folderName1: { controllers, folders },
		folderName2: { controllers, folders }
		...
	}
}
```

- **recursive** - Pass false to exclude folders descending from this GUI.\
  Default: `true`

**Returns**: `object`

## gui.**open**( open=true )

Opens a GUI or folder. GUI and folders are open by default.

```js
gui.open(); // open
gui.open(false); // close
gui.open(gui._closed); // toggle
```

- **open** - Pass false to close.\
  Default: `true`

**Returns**: `this`

## gui.**close**()

Closes the GUI.

**Returns**: `this`

## gui.**show**( show=true )

Shows the GUI after it's been hidden.

```js
gui.show();
gui.show(false); // hide
gui.show(gui._hidden); // toggle
```

- **show**\
  Default: `true`

**Returns**: `this`

## gui.**hide**()

Hides the GUI.

**Returns**: `this`

## gui.**title**( title )

Change the title of this GUI.

- **title**\
  Required: `string`

**Returns**: `this`

## gui.**reset**( recursive=true )

Resets all controllers to their initial values.

- **recursive** - Pass false to exclude folders descending from this GUI.\
  Default: `true`

**Returns**: `this`

## gui.**onChange**( callback )

Pass a function to be called whenever a controller in this GUI changes.

```js
gui.onChange((event) => {
  event.object; // object that was modified
  event.property; // string, name of property
  event.value; // new value of controller
  event.controller; // controller that was modified
});
```

- **callback**\
  Required: `function`

**Returns**: `this`

## gui.**onFinishChange**( callback )

Pass a function to be called whenever a controller in this GUI has finished changing.

```js
gui.onFinishChange((event) => {
  event.object; // object that was modified
  event.property; // string, name of property
  event.value; // new value of controller
  event.controller; // controller that was modified
});
```

- **callback**\
  Required: `function`

**Returns**: `this`

## gui.**onOpenClose**( callback )

Pass a function to be called when this GUI or its descendants are opened or closed.

```js
gui.onOpenClose((changedGUI) => {
  console.log(changedGUI._closed);
});
```

- **callback**\
  Required: `function`

**Returns**: `this`

## gui.**destroy**()

Destroys all DOM elements and event listeners associated with this GUI.

## gui.**controllersRecursive**()

Returns an array of controllers contained by this GUI and its descendents.

**Returns**: `Controller[]`

## gui.**foldersRecursive**()

Returns an array of folders contained by this GUI and its descendents.

**Returns**: `GUI[]`

## gui.**children** : Array\<GUI|Controller>

The list of controllers and folders contained by this GUI.

## gui.**controllers** : Controller\[]

The list of controllers contained by this GUI.

## gui.**domElement** : HTMLElement

The outermost container element.

## gui.**folders** : GUI\[]

The list of folders contained by this GUI.

## gui.**parent** : GUI

The GUI containing this folder, or `undefined` if this is the root GUI.

## gui.**root** : GUI

The top level GUI containing this folder, or `this` if this is the root GUI.

## gui.**$children** : HTMLElement

The DOM element that contains children.

## gui.**$title** : HTMLElement

The DOM element that contains the title.

## gui.**\_closed** : boolean

Used to determine if the GUI is closed. Use `gui.open()` or `gui.close()` to change this.

## gui.**\_hidden** : boolean

Used to determine if the GUI is hidden. Use `gui.show()` or `gui.hide()` to change this.

## gui.**\_onChange** : function

Used to access the function bound to `onChange` events. Don't modify this value directly. Use the `gui.onChange( callback )` method instead.

## gui.**\_onFinishChange** : function

Used to access the function bound to `onFinishChange` events. Don't modify this value directly. Use the `gui.onFinishChange( callback )` method instead.

## gui.**\_title** : string

Current title of the GUI. Use `gui.title( 'Title' )` to modify this value.

# Controller

## controller.**name**( name )

Sets the name of the controller and its label in the GUI.

- **name**\
  Required: `string`

**Returns**: `this`

## controller.**onChange**( callback )

Pass a function to be called whenever the value is modified by this controller. The function receives the new value as its first parameter. The value of `this` will be the controller.

For function controllers, the `onChange` callback will be fired on click, after the function executes.

```js
const controller = gui.add(object, "property");

controller.onChange(function (v) {
  console.log("The value is now " + v);
  console.assert(this === controller);
});
```

- **callback**\
  Required: `function`

**Returns**: `this`

## controller.**onFinishChange**( callback )

Pass a function to be called after this controller has been modified and loses focus.

```js
const controller = gui.add(object, "property");

controller.onFinishChange(function (v) {
  console.log("Changes complete: " + v);
  console.assert(this === controller);
});
```

- **callback**\
  Required: `function`

**Returns**: `this`

## controller.**reset**()

Sets the controller back to its initial value.

**Returns**: `this`

## controller.**enable**( enabled=true )

Enables this controller.

```js
controller.enable();
controller.enable(false); // disable
controller.enable(controller._disabled); // toggle
```

- **enabled**\
  Default: `true`

**Returns**: `this`

## controller.**disable**( disabled=true )

Disables this controller.

```js
controller.disable();
controller.disable(false); // enable
controller.disable(!controller._disabled); // toggle
```

- **disabled**\
  Default: `true`

**Returns**: `this`

## controller.**show**( show=true )

Shows the Controller after it's been hidden.

```js
controller.show();
controller.show(false); // hide
controller.show(controller._hidden); // toggle
```

- **show**\
  Default: `true`

**Returns**: `this`

## controller.**hide**()

Hides the Controller.

**Returns**: `this`

## controller.**options**( options )

Changes this controller into a dropdown of options.

Calling this method on an option controller will simply update the options. However, if this controller was not already an option controller, old references to this controller are destroyed, and a new controller is added to the end of the GUI.

```js
// safe usage

gui.add(obj, "prop1").options(["a", "b", "c"]);
gui.add(obj, "prop2").options({ Big: 10, Small: 1 });
gui.add(obj, "prop3");

// danger

const ctrl1 = gui.add(obj, "prop1");
gui.add(obj, "prop2");

// calling options out of order adds a new controller to the end...
const ctrl2 = ctrl1.options(["a", "b", "c"]);

// ...and ctrl1 now references a controller that doesn't exist
assert(ctrl2 !== ctrl1);
```

- **options**\
  Required: `object` or `Array`

**Returns**: `Controller`

## controller.**min**( min )

Sets the minimum value. Only works on number controllers.

- **min**\
  Required: `number`

**Returns**: `this`

## controller.**max**( max )

Sets the maximum value. Only works on number controllers.

- **max**\
  Required: `number`

**Returns**: `this`

## controller.**step**( step )

Values set by this controller will be rounded to multiples of `step`. Only works on number controllers.

- **step**\
  Required: `number`

**Returns**: `this`

## controller.**decimals**( decimals )

Rounds the displayed value to a fixed number of decimals, without affecting the actual value like `step()`. Only works on number controllers.

```js
gui.add(object, "property").listen().decimals(4);
```

- **decimals**\
  Required: `number`

**Returns**: `this`

## controller.**listen**( listen=true )

Calls `updateDisplay()` every animation frame. Pass `false` to stop listening.

- **listen**\
  Default: `true`

**Returns**: `this`

## controller.**getValue**()

Returns `object[ property ]`.

**Returns**: `any`

## controller.**setValue**( value )

Sets the value of `object[ property ]`, invokes any `onChange` handlers and updates the display.

- **value**\
  Required: `any`

**Returns**: `this`

## controller.**updateDisplay**()

Updates the display to keep it in sync with the current value. Useful for updating your controllers when their values have been modified outside of the GUI.

**Returns**: `this`

## controller.**destroy**()

Destroys this controller and removes it from the parent GUI.

## controller.**domElement** : HTMLElement

The outermost container DOM element for this controller.

## controller.**initialValue** : any

The value of `object[ property ]` when the controller was created.

## controller.**object** : object

The object this controller will modify.

## controller.**parent** : GUI

The GUI that contains this controller.

## controller.**property** : string

The name of the property to control.

## controller.**$disable** : HTMLElement

The DOM element that receives the disabled attribute when using disable().

## controller.**$name** : HTMLElement

The DOM element that contains the controller's name.

## controller.**$widget** : HTMLElement

The DOM element that contains the controller's "widget" (which differs by controller type).

## controller.**\_disabled** : boolean

Used to determine if the controller is disabled. Use `controller.disable( true|false )` to modify this value.

## controller.**\_hidden** : boolean

Used to determine if the Controller is hidden. Use `controller.show()` or `controller.hide()` to change this.

## controller.**\_listening** : boolean

Used to determine if the controller is currently listening. Don't modify this value directly. Use the `controller.listen( true|false )` method instead.

## controller.**\_name** : string

The controller's name. Use `controller.name( 'Name' )` to modify this value.

## controller.**\_onChange** : function

Used to access the function bound to `onChange` events. Don't modify this value directly. Use the `controller.onChange( callback )` method instead.

## controller.**\_onFinishChange** : function

Used to access the function bound to `onFinishChange` events. Don't modify this value directly. Use the `controller.onFinishChange( callback )` method instead.

[1]: https://lil-gui.georgealways.com/#Migrating
[2]: https://lil-gui.georgealways.com/examples/basic/
[3]: https://lil-gui.georgealways.com/#Examples
[4]: https://lil-gui.georgealways.com/#Guide
[5]: https://lil-gui.georgealways.com/#API
[6]: https://github.com/georgealways/lil-gui
[7]: https://lil-gui.georgealways.com/dist/lil-gui.esm.js
[8]: https://lil-gui.georgealways.com/dist/lil-gui.esm.min.js
[9]: https://lil-gui.georgealways.com/examples/basic
[10]: https://lil-gui.georgealways.com/examples/kitchen-sink
[11]: https://threejs.org/examples/
[12]: https://filters.pixijs.download/main/demo/index.html
[13]: https://github.com/dataarts/dat.gui
[14]: https://lil-gui.georgealways.com/#Guide#Change-Events
[15]: https://lil-gui.georgealways.com/#GUI
[16]: https://lil-gui.georgealways.com/#GUI#constructor
[17]: https://lil-gui.georgealways.com/#GUI#add
[18]: https://lil-gui.georgealways.com/#GUI#addColor
[19]: https://lil-gui.georgealways.com/#GUI#addFolder
[20]: https://lil-gui.georgealways.com/#GUI#load
[21]: https://lil-gui.georgealways.com/#GUI#save
[22]: https://lil-gui.georgealways.com/#GUI#open
[23]: https://lil-gui.georgealways.com/#GUI#close
[24]: https://lil-gui.georgealways.com/#GUI#show
[25]: https://lil-gui.georgealways.com/#GUI#hide
[26]: https://lil-gui.georgealways.com/#GUI#title
[27]: https://lil-gui.georgealways.com/#GUI#reset
[28]: https://lil-gui.georgealways.com/#GUI#onChange
[29]: https://lil-gui.georgealways.com/#GUI#onFinishChange
[30]: https://lil-gui.georgealways.com/#GUI#onOpenClose
[31]: https://lil-gui.georgealways.com/#GUI#destroy
[32]: https://lil-gui.georgealways.com/#GUI#controllersRecursive
[33]: https://lil-gui.georgealways.com/#GUI#foldersRecursive
[34]: https://lil-gui.georgealways.com/#GUI#children
[35]: https://lil-gui.georgealways.com/#GUI#controllers
[36]: https://lil-gui.georgealways.com/#GUI#domElement
[37]: https://lil-gui.georgealways.com/#GUI#folders
[38]: https://lil-gui.georgealways.com/#GUI#parent
[39]: https://lil-gui.georgealways.com/#GUI#root
[40]: https://lil-gui.georgealways.com/#GUI#$children
[41]: https://lil-gui.georgealways.com/#GUI#$title
[42]: https://lil-gui.georgealways.com/#GUI#_closed
[43]: https://lil-gui.georgealways.com/#GUI#_hidden
[44]: https://lil-gui.georgealways.com/#GUI#_onChange
[45]: https://lil-gui.georgealways.com/#GUI#_onFinishChange
[46]: https://lil-gui.georgealways.com/#GUI#_title
[47]: https://lil-gui.georgealways.com/#Controller
[48]: https://lil-gui.georgealways.com/#Controller#name
[49]: https://lil-gui.georgealways.com/#Controller#onChange
[50]: https://lil-gui.georgealways.com/#Controller#onFinishChange
[51]: https://lil-gui.georgealways.com/#Controller#reset
[52]: https://lil-gui.georgealways.com/#Controller#enable
[53]: https://lil-gui.georgealways.com/#Controller#disable
[54]: https://lil-gui.georgealways.com/#Controller#show
[55]: https://lil-gui.georgealways.com/#Controller#hide
[56]: https://lil-gui.georgealways.com/#Controller#options
[57]: https://lil-gui.georgealways.com/#Controller#min
[58]: https://lil-gui.georgealways.com/#Controller#max
[59]: https://lil-gui.georgealways.com/#Controller#step
[60]: https://lil-gui.georgealways.com/#Controller#decimals
[61]: https://lil-gui.georgealways.com/#Controller#listen
[62]: https://lil-gui.georgealways.com/#Controller#getValue
[63]: https://lil-gui.georgealways.com/#Controller#setValue
[64]: https://lil-gui.georgealways.com/#Controller#updateDisplay
[65]: https://lil-gui.georgealways.com/#Controller#destroy
[66]: https://lil-gui.georgealways.com/#Controller#domElement
[67]: https://lil-gui.georgealways.com/#Controller#initialValue
[68]: https://lil-gui.georgealways.com/#Controller#object
[69]: https://lil-gui.georgealways.com/#Controller#parent
[70]: https://lil-gui.georgealways.com/#Controller#property
[71]: https://lil-gui.georgealways.com/#Controller#$disable
[72]: https://lil-gui.georgealways.com/#Controller#$name
[73]: https://lil-gui.georgealways.com/#Controller#$widget
[74]: https://lil-gui.georgealways.com/#Controller#_disabled
[75]: https://lil-gui.georgealways.com/#Controller#_hidden
[76]: https://lil-gui.georgealways.com/#Controller#_listening
[77]: https://lil-gui.georgealways.com/#Controller#_name
[78]: https://lil-gui.georgealways.com/#Controller#_onChange
[79]: https://lil-gui.georgealways.com/#Controller#_onFinishChange
