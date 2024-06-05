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

// 모든 상품 조회 (+ 쿼리 조건 추가)
productController.getProducts = async (req, res) => {
    try {

        // body에서 가져온 쿼리(page, name)
        const { page, name } = req.body

        // 조건: name이라는 단어가 있을 경우, 대소문자 구분 없이
        const condition = name ? { name: { $regex: name, options: "i" } } : {};

        let query = Product.find(condition);
        
        // exec(): condition 찾을 때까지 기다렸다가 실행
        const productList = await query.exec();

        // if (name) {
        //     const products = await Product.find({ name: { $regex: name, $options: "i" } })
        // } else {
        //     // 없으면 모두 조회
        //     const products = await Product.find({});
        // }

        return res.status(200).json({ status: "success", productList })
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
}

module.exports = productController;