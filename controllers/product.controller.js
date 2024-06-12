const { response } = require("express");
const Product = require("../models/Product");

const PAGE_SIZE = 5;
const productController = {};

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

        // 쿼리를 생성: condition에 따라 상품을 조회 함
        let query = Product.find(condition);

        // 페이지네이션 로직
        // '(현재 페이지 - 한 페이지에 보여주고싶은 개수) * 한 페이지에 보여주고싶은 개수'만큼 제외하고,
        // 현재 페이지에 보여주고싶은 개수만큼만 보여주겠다
        if (page && page > 0) {
            query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
        }

        // 전체 데이터 개수 -> 응답 데이터 추가
        const totalItemNum = await Product.find(condition).count();
        // response.totalItemNum = totalItemNum;

        // 전체 페이지 개수 -> 응답 데이터 추가
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

        // condition 찾을 때까지 기다렸다가 실행 -> 응답 데이터 추가
        const productList = await query.exec(condition);

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

// 상품 상세 조회
productController.getProductDetail = async (req, res) => {
    try {
        // URL 파라미터로부터 상품 ID 가져오기 (:id 값)
        const productId = req.params.id;

        // 상품 ID에 해당하는 상품을 데이터베이스에서 조회
        const product = await Product.findById(productId);

        // 상품이 존재하지 않는 경우
        if (!product) {
            throw new Error("상품이 존재하지 않습니다.");
        }
        
        // 상품이 존재하는 경우 상세 정보를 클라이언트로 응답
        return res.status(200).json({ status: "success", data: product });
    } catch (err) {
        // 에러 발생 시 에러 메시지와 함께 500 상태 코드로 응답
        res.status(500).json({ status: "fail", error: err.message });
    }
};

// 상품 수정
productController.updateProduct = async (req, res) => {
    try {
        // URL 파라미터로부터 상품 ID 가져오기 (:id 값)
        const productId = req.params.id;

        // body에서 상품 데이터 가져오기
        const { sku, name, image, category, description, price, stock, status, isDelete } = req.body;

        // 상품 ID에 해당하는 상품을 찾아서 업데이트
        const product = await Product.findByIdAndUpdate(
            { _id: productId }, // 조건: 상품 ID
            { sku, name, image, category, description, price, stock, status, isDelete }, // 업데이트할 데이터
            { new: true } // 업데이트된 데이터를 반환하도록 설정
        );

        // 상품이 존재하지 않는 경우
        if (!product) throw new Error("상품이 존재하지 않습니다.");

        return res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

// 상품 삭제
productController.deleteProduct = async (req, res) => {
    try {
        // URL 파라미터로부터 상품 ID 가져오기 (:id 값)
        const productId = req.params.id;

        // 상품 ID에 해당하는 상품을 찾아서 isDelete 값을 true로 변경 (논리 삭제)
        const product = await Product.updateOne(
            { _id: productId }, // 조건: 상품 ID
            { $set: { isDelete: true } } // 업데이트할 데이터: isDelete 값만 true로 설정
        );

        // 상품이 존재하지 않는 경우
        if (product.nModified === 0) {
            throw new Error("상품이 존재하지 않습니다.");
        }

        return res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

// 아이템 재고 확인
productController.checkStock = async (item) => {
    try {
        // 주문할 아이템 재고 정보 들고오기 (상품_id로 상품 정보 조회)
        const product = await Product.findById(item.productId);

        // 내가 사려는 아이템 수량과 재고 비교
        if (product.stock[item.option] < item.qty) {
            // 재고가 불충분하다면 불충분 메시지와 함께 데이터 반환
            return {
                isVerify: false, // 재고 부족 여부 표시
                message: `${product.name}의 ${item.option} 재고가 부족합니다`,
            };
        }

        // 충분하다면 재고에서 주문 수량만큼 차감
        const newStock = { ...product.stock }; // 현재 재고 복사
        newStock[item.option] -= item.qty; // 구매 수량만큼 재고 차감
        product.stock = newStock; // 업데이트된 재고 설정

        // 변경된 재고 저장
        await product.save();

        // 충분하다면 true 반환
        return { isVerify: true };
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

// 아이템 리스트 재고 확인 (createOrder에서 itemList(주문정보) 받아옴)
productController.checkItemListStock = async (itemList) => {
    try {
        // 재고가 불충분한 아이템 저장할 변수
        const insufficientStockItems = [];

        // 각 아이템의 재고 확인
        await Promise.all(
            itemList.map(async (item) => {
                const stockCheck = await productController.checkStock(item); // 각 아이템의 재고 확인
                if (!stockCheck.isVerify) {
                    // 재고가 불충분한 경우 리스트에 추가
                    insufficientStockItems.push({
                        item, // 재고가 불충분한 아이템
                        message: stockCheck.message, // 불충분 메시지
                    });
                }
                return stockCheck;
            })
        );

        // 불충분한 아이템 리스트 반환
        return insufficientStockItems;
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
};

module.exports = productController;
