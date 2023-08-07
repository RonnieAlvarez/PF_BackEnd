export const generateProductErrorInfo = (product) => {
    //return
    return `The product Information is not valid or imcomplete.
    Product Information requires:
        * id: type Number, required: ${product.id}
        * Title: type String, required : ${product.Title}
        * Price: type Number, required : ${product.Price}
    `
};