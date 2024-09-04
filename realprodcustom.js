exports.htmlreplace = function htmlreplace(template, product) {
    if (!product || !product.images) {
        return template; // Return the original template if product or images are undefined
    }
    let imagesHTML = '';
    if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
            imagesHTML += `<img src="${product.images[i].url}" height="120" width="120">`;
        }
    }
    let firstImage ='';
    if (product.images[0]) {
     firstImage=`<img src="${product.images[0].url}" height="120" width="120">`;
    }

    
    let output = template.replace('{{%VIDEO%}}', product.video);
    output = template.replace('{{%FIRST_IMAGE%}}', firstImage);
    output = output.replace('<div id="image-carousel" class="carousel"><!-- Images will be inserted here --></div>', `<div id="image-carousel" class="carousel">${imagesHTML}</div>`);
    //output = output.replace('{{%360_VIEW%}}', product['360_view']);

    // Replace other placeholders
    output = output.replace('{{%NAME%}}', product.name);
    output = output.replace('{{%category%}}', product.category);
    output = output.replace('{{%area%}}', product.area);
    output = output.replace('{{%length%}}', product.length);
    output = output.replace('{{%breadth%}}', product.breadth);
    output = output.replace('{{%Location%}}', product.location);
    output = output.replace('{{%Type%}}', product.type1);
    output = output.replace('{{%Specific%}}', product.specifications);
    output = output.replace('{{%PinCode%}}', product.pincode);
    output = output.replace('{{%price%}}', product.price);
    output = output.replace('{{%SOIL COLOR%}}', product.soilcolor);
    output = output.replace('{{%ID%}}', product._id);
    /*output = output.replace('{{%ROM%}}', product.ROM);
    output = output.replace('{{%DESC%}}', product.Description);*/
    //output = output.replace('{{%FIRST_IMAGE%}}', product.images[0]); // Add the first image to the placeholder
    return output;
}
