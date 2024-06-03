const Product = require('../models/Product');
const productController = {}

// 상품 생성
productController.createProduct = async (req, res) => {
    try {
        const {
            sku,
            name,
            image,
            category,
            description,
            // descriptionShort,
            // descriptionLong,
            price,
            stock,
            status,
            isDelete
        } = req.body;

        const product = new Product({
            sku,
            name,
            image,
            category,
            description,
            // descriptionShort,
            // descriptionLong,
            price,
            stock,
            // tags,
            // discount,
            status,
            isDelete
        })

        await product.save();
        return res.status(200).json({ status: "success", product })
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
}

module.exports = productController;