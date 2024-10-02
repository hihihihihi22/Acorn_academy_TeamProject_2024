import React, { useEffect, useState } from "react";
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import { decodeToken } from "jsontokens";

const UserLogin = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setErrorMessage("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    axios
      .post("/auth", { userName, password })
      .then((response) => {
        const token = response.data;
        if (token) {
          localStorage.setItem("token", token);

          // 토큰에서 payload 정보 얻어오기
          const { payload } = decodeToken(token.substring(7));
          console.log("토큰 안의 payload 확인:", payload); 

          const userRole = payload?.userRole;
          const decodedUserName = payload?.userName; 

          if (userRole && decodedUserName) {
            localStorage.setItem("role", userRole);
            localStorage.setItem("userName", decodedUserName);

            // 로그인 성공 알림
            alert(`${decodedUserName} 님 로그인 되었습니다.`);

            // 역할에 따라 페이지 이동
            navigateByRole(userRole);
          } else {
            setErrorMessage("로그인 실패: 아이디 또는 비밀번호가 틀렸습니다.");
          }
        }
      })

      .catch((error) => {
        // 에러 메시지 처리
        const errorMsg =
          error.response?.data?.message ||
          "로그인 실패: 아이디 또는 비밀번호가 틀렸습니다.";
        setErrorMessage(errorMsg);
        console.error("로그인 실패:", errorMsg);
      });
  };

  // 역할에 따라 페이지 이동하기
  const navigateByRole = (role) => {
    if (role === "TRAINER") {
      navigate("/tr/home");
    } else if (role === "MEMBER") {
      navigate("/mem/starter");
    } else if (role === "ADMIN") {
      navigate("/"); //관리자메인으로 이동, 나중에 수정
    } else {
      console.error("올바르지 않은 역할:", role);
    }
  };

  return (
    <Container fluid>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 5, offset: 3 }}>
          <Card>
            <Card.Header as="h6" className="border-bottom p-3 mb-0">
              <div>
                <h1>로그인</h1>
                <p>로그인하여 Fit Connect를 이용해보세요</p>
              </div>
            </Card.Header>

            <Card.Body className="">
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>아이디</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="아이디를 입력해 주세요"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="비밀번호를 입력해 주세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                <Button variant="dark" type="submit">
                  로그인
                </Button>
                <div>또는</div>
                <Button
                  variant="outline-dark"
                  as={Link}
                  to="http://52.78.38.12:8080/login/oauth2/code/google"
                >
                  Google로 시작하기
                </Button>
                <div>
                  <Link to="/signup">회원가입</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserLogin;
