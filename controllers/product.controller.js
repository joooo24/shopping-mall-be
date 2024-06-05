const { response } = require("express");
const Product = require("../models/Product");
const productController = {};
const PAGE_SIZE = 5;

// 상품 생성
productController.createProduct = async (req, res) => {
    try {
        const { sku, name, image, category, description, price, stock, status, isDelete } = req.body;

        const product = new Product({
            sku,
            name,
            image,
            category,
            description,
            price,
            stock,
            status,
            isDelete,
        });

        await product.save();
        return res.status(200).json({ status: "success", product });
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

// 상품 조회 (+ 쿼리 조건 추가)
productController.getProducts = async (req, res) => {
    try {
        // query에서 가져온 파라미터(page, name)
        const { page, name } = req.query;

        // 조건: name이라는 쿼리가 있다면 -> name을 포함하기만 하면 되고, 대소문자 구분하지 않겠다.
        const condition = name ? { name: { $regex: name, $options: "i" } } : {};
        // const condition = name ? { name: { $regex: new RegExp(name, "i") } } : {};

        // condition에 따라 상품을 조회 함
        let query = Product.find(condition);

        // 페이지네이션 로직
        // '(현재 페이지 - 한 페이지에 보여주고싶은 개수) * 한 페이지에 보여주고싶은 개수'만큼 제외하고,
        // 현재 페이지에 보여주고싶은 개수만큼만 보여주겠다
        if (page) {
            query.skip((page - PAGE_SIZE) * PAGE_SIZE).limit(PAGE_SIZE);
        }

        // 총 데이터 개수 -> 응답 데이터 추가
        const totalItemNum = await Product.find(condition).count();
        // response.totalItemNum = totalItemNum;

        // 총 페이지 개수 -> 응답 데이터 추가
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        // response.totalPageNum = totalPageNum;

        // condition 찾을 때까지 기다렸다가 실행 -> 응답 데이터 추가
        const productList = await query.exec(condition);
        // response.data = productList;

        // 응답 개체 생성
        const response = {
            status: "success",
            data: productList,
            totalItemNum: totalItemNum,
            totalPageNum: totalPageNum,
        };

        return res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

module.exports = productController;
