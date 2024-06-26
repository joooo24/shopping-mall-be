const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {}

// 유저생성
userController.createUser = async (req, res) => {
    try {
        let { email, password, name, level } = req.body;

        // 이메일 중복 검사
        const user = await User.findOne({ email })
        if (user) {
            throw new Error("이미 가입이 된 유저입니다")
        }

        // 비밀번호 암호화
        const salt = bcrypt.genSaltSync(10);
        password = await bcrypt.hashSync(password, salt);

        // 유저 정보 객체에 담아 저장
        const newUser = new User({ email, password, name, level: level ? level : "customer" })
        await newUser.save()

        return res.status(200).json({ status: "success" })
    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
}

// 유정 정보 받아오기
userController.getUser = async (req, res) => {
    try {
        // req에서 userId 값 받아오기
        const { userId } = req

        // userId로 유저 정보 찾기
        const user = await User.findById(userId)

        // 유저가 있다면? 유저 값 넘겨주기
        if (user) {
            return res.status(200).json({ status: "success", user })
        }

        // 유저가 없다면? 에러
        throw new Error("Invalid token")

    } catch (err) {
        res.status(500).json({ status: "fail", error: err, message: err.message });
    }
}

module.exports = userController;