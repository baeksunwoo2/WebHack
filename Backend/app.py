from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# 사용자 정보를 저장할 파일 경로 설정
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.txt')

# 파일에서 유저 정보 로드
def load_user_data():
    user = {}
    try:
        with open(USERS_FILE, "r", encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    username, password = line.split(",", 1)
                    user[username] = password
    except FileNotFoundError:
        print(f"'{USERS_FILE}' 파일이 존재하지 않아 초기 사용자 데이터를 생성합니다.")
        save_user_data(user)
    return user

# 유저 정보 저장
def save_user_data(user_data):
    with open(USERS_FILE, "w", encoding='utf-8') as f:
        for username, password in user_data.items():
            f.write("%s,%s\n" % (username, password))

# ---------- Flask 연동 ----------

# 회원가입
@app.route('/signup', methods=['POST'])
def signup_route():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user_data = load_user_data()
    if username in user_data:
        return jsonify({"message": "이미 존재하는 아이디입니다."}), 409
    
    user_data[username] = password
    save_user_data(user_data)
    print(f"회원가입 완료: {username}")
    return jsonify({"message": "회원가입이 성공적으로 완료되었습니다!"}), 201

# 로그인
@app.route('/login', methods=['POST'])
def login_route():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user_data = load_user_data()
    if username in user_data and user_data[username] == password:
        print(f"로그인 성공: {username}")
        return jsonify({"message": "로그인 성공!"}), 200
    else:
        print(f"로그인 실패: {username}")
        return jsonify({"message": "아이디 또는 비밀번호가 틀렸습니다."}), 401

# 회원 탈퇴
@app.route('/delete_user', methods=['POST'])
def delete_user_route():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user_data = load_user_data()
    if username in user_data and user_data[username] == password:
        del user_data[username]
        save_user_data(user_data)
        print(f"회원 탈퇴 완료: {username}")
        return jsonify({"message": "회원 탈퇴 완료!"}), 200
    else:
        print(f"회원 탈퇴 실패: {username}")
        return jsonify({"message": "아이디 또는 비밀번호가 틀렸습니다."}), 401


@app.route('/get_byte_counts', methods=['POST'])
def get_byte_counts():
    data = request.get_json()
    text = data.get('text', '')

    try:
        
        utf8_bytes = len(text.encode('utf-8'))
        euc_kr_bytes = len(text.encode('euc-kr'))

        return jsonify({
            "utf8_bytes": utf8_bytes,
            "euc_kr_bytes": euc_kr_bytes
        }), 200
    except UnicodeEncodeError as e:
        return jsonify({"message": f"인코딩 오류: EUC-KR로 표현할 수 없는 문자가 포함되어 있습니다. {e}"}), 400
    except Exception as e:
        return jsonify({"message": f"바이트 수 계산 중 오류 발생: {e}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)