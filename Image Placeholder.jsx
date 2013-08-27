#target photoshop

function main() {
	// user settings
	var prefs = new Object();
	prefs.sourceFolder = File($.fileName).path+'/placeholders/';

    // get current selected layer
    var mainDocument = app.activeDocument;
    var mask = mainDocument.activeLayer;
    
    // get mask position and size
    bounds = mask.bounds;
    var maskTop = bounds[0]
    var maskLeft = bounds[1];
    var maskWidth = bounds[2] - bounds[0];
    var maskHeight = bounds[3] - bounds[1];

    // open random image from source folder
    var sourceFolder = Folder(prefs.sourceFolder);
    var imageFile = getPlaceholderFile(sourceFolder);
    var image = app.open(placeholderFile);

    // calculate ratios
    var maskRatio = maskWidth / maskHeight;
    var imageRatio = image.width / image.height;

    if(maskRatio >= imageRatio){

        // resize to the width
        image.resizeImage(maskWidth, null, null, ResampleMethod.BICUBIC);

        // calculate how much will be cropped out on top/bottom
        offsetTop = (image.height - maskHeight) / 2;
        offsetBottom = offsetTop+ maskHeight;

        // crop  - left, top, right, bottom
        image.crop([0, offsetTop, image.width, offsetBottom]);

    }else{

        // resize to the height
        image.resizeImage(null, maskHeight, null, ResampleMethod.BICUBIC);

        // calculate how much will be cropped out on left/right
        offsetLeft = (image.width - maskWidth) / 2;
        offsetRight = offsetLeft+ maskWidth;

        // crop  - left, top, right, bottom
        image.crop([offsetLeft, 0, offsetRight, image.height]);

    }

    // paste image in main document
    pastedImage = image.activeLayer.duplicate(mask, ElementPlacement.PLACEBEFORE);
    image.close(SaveOptions.DONOTSAVECHANGES);

    // move to same position as the original element and make a clipping mask
    pastedImage.translate(maskTop - pastedImage.bounds[0], maskLeft - pastedImage.bounds[1]);
    clippingMask();

}

function clippingMask() {
    var desc3 = new ActionDescriptor();
    var ref2 = new ActionReference();
    ref2.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
    desc3.putReference( charIDToTypeID('null'), ref2 );
    executeAction( charIDToTypeID('GrpL'), desc3, DialogModes.NO );
};

function getPlaceholderFile(sourceFolder) {
    
	// make sure the source folder is valid
	if (!sourceFolder) {
		return;
	} else if (!sourceFolder.exists) {
		alert('Source folder not found.', 'Script Stopped', true);
		return;
	}    
    
	// declare local variables
	var fileArray = new Array();
	var extRE = /\.(?:png|gif|jpg)$/i;

	// get all files in source folder
	var docs = sourceFolder.getFiles();
	var len = docs.length;
	for (var i = 0; i < len; i++) {
		var doc = docs[i];

		// only match files (not folders)
		if (doc instanceof File) {
			// store all recognized files into an array
			var docName = doc.name;
			if (docName.match(extRE)) {
				fileArray.push(doc);
			}
		}
	}

	// if files were found, proceed with import
	if (fileArray.length) {
        randno = Math.floor ( Math.random() * fileArray.length ); 
        placeholderFile = fileArray[randno];
        return placeholderFile;
	}
	// otherwise, diplay message
	else {
		alert("The selected folder doesn't contain any recognized images.", 'No Files Found', false);
	}

}

// Check if photoshop version is ok
function isCorrectVersion() {
	if (parseInt(version, 10) >= 9) {
		return true;
	}
	else {
		alert('This script requires Adobe Photoshop CS2 or higher.', 'Wrong Version', false);
		return false;
	}
}

// Display error message if something goes wrong
function showError(err) {
	if (confirm('An unknown error has occurred.\n' +
		'Would you like to see more information?', true, 'Unknown Error')) {
			alert(err + ': on line ' + err.line, 'Script Error', true);
	}
}


// Test initial conditions prior to running main function
if (isCorrectVersion()) {
	// remember ruler units; switch to pixels
	var originalRulerUnits = preferences.rulerUnits;
	preferences.rulerUnits = Units.PIXELS;

	try {
		main();
	}
	catch(e) {
		// don't report error on user cancel
		if (e.number != 8007) {
			showError(e);
		}
	}

	// restore original ruler unit
	preferences.rulerUnits = originalRulerUnits;
}
