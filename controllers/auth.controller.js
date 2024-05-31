const User = require('../models/user');
const bcrypt = require('bcryptjs');
const authController = {};

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

module.exports = authController;