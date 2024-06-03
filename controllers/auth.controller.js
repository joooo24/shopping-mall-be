const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {};

// 로그인 - 이메일
authController.loginWithEmail = async (req, res) => {
    try {
        // email로 유저 정보 가져오기
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {

            // 프론트에서 입력받은 비밀번호와 DB에 저장된 비밀번호(해시 값)와 비교
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // 토큰 발생
                const token = user.generateToken();

                // 응답: 유저 정보 + 토큰 정보
                return res.status(200).json({ status: "success", user, token });
            }
        }

        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다");

    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
}

// 토큰 검증: 토큰으로 유저의 _id 가져오기
authController.authenticate = async (req, res, next) => {
    try {

        // api 헤더에 저장된 토큰 문자열 가져오기
        const tokenString = req.headers.authorization

        // 토큰 값 체크
        if (!tokenString) {
            return res.status(401).json({ status: "fail", message: "토큰이 없습니다." });
        }

        // 토큰에서 'Bearer ' 문자열을 제거하고 실제 토큰 값을 추출
        const token = tokenString.split(' ')[1];
        // const token = tokenString.replace("Bearer ", "");

        // 토큰 디코딩
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
            if (error) {
                throw new Error("### invalid token: " + error.message);
            }

            // 디코딩 한 값: payload
            return payload
        });

        // 디코딩된 토큰에서 유저의 _id를 추출
        const userId = decodedToken._id;

        // req에 userId 항목 추가
        req.userId = userId

        next();

    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
}

// 어드민 체크
authController.checkAdminPermission = async (req, res, next) => {
    try {
        // req에 userId 항목 가져오기
        const { userId } = req;

        // id로 유저 정보 찾기
        const user = await User.findById(userId)

        // 어드민이 아닐 경우
        if (user.level !== "admin") {
            throw new Error("페이지 권한이 없는 사용자입니다.")
        }

        // 어드민이 맞으면?
        next();

    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
}

module.exports = authController;