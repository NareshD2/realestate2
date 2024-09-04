exports.htmlreplace = function htmlreplace(template, product) {
    if (!product || !product.images) {
        return template; // Return the original template if product or images are undefined
    }
    let imagesHTML = `<img src="${product.images[0].url}" class="image">`;
    let imagesHTML1 = `<img src="${product.images[0].url}" class="image">`;

    if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
            if (product.images[i].url) {
                imagesHTML += `<img src="${product.images[i].url}" class="image">`;
                imagesHTML1 += `<img src="${product.images[i].url}" class="overlay-image">`;
            } else {
                console.error(`Image at index ${i} is missing URL`);
            }
        }
    }
    //console.log(imagesHTML);

    
    let output = template
    output=output.replace('{{%EXPERTRATING%}}',product.ExpertRating );
    output=output.replace('{{%CUSTOMERRATING%}}',product.CustomerRating );
    output=output.replace('{{%VIDEO%}}', product.video);
    output = output.replace('{{%360_VIEW%}}', product['360_view']);
    //output=output.replace('{{%IMAGE1_URL%}}',product.images[0]);
    //output=output.replace('{{%IMAGE2_URL%}}',product.productImage[1]);
    output = output.replace('{{%NAME%}}', product.name);
    output = output.replace('{{%Area%}}', product.area);
    output = output.replace('{{%Length%}}', product.length);
    output = output.replace('{{%Breadth%}}', product.breadth);
     output = output.replace('{{%Shape%}}', product.shape);
    output = output.replace('{{%Type%}}', product.type1);
    output = output.replace('{{%Specifications%}}', product.Specifications);
    output = output.replace('{{%Location%}}', product.loaction);
    output = output.replace('{{%Pincode%}}', product.pincode);
    output = output.replace('{{%PRICE%}}', product.price);
    output = output.replace('{{%SoilColor%}}', product.soilcolor);
    output = output.replace('{{%ID%}}', product._id);
    output = output.replace('{{%Category%}}', product.category);
    output = output.replace('{{%DESC%}}', product.description);
    output = output.replace('{{%VIDEO%}}', product.video);
    output = output.replace('{{%FIRST_IMAGE%}}',imagesHTML);
    output = output.replace('{{%FIRST_IMAGE1%}}',imagesHTML1); // Add the first image to the placeholder
    return output;
}
