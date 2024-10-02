import React, { useEffect, useState } from "react";
import { Button, Form, Container, Card, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const token = localStorage.getItem("token");

const MemberSignUp = () => {

  const [formData, setFormData] = useState({
    member_num: 0,
    trainer_num: 0,
    member_height: "",
    member_weight: "",
    member_gender: "",
    plan: "",
    weeklyplan: ""
  });

  const navigate = useNavigate();

  const location = useLocation();
  const { member_num } = location.state;    

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      member_num: member_num
    }))
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isNaN(formData.member_height) || isNaN(formData.member_weight)) {
      console.error("키와 몸무게는 숫자여야 합니다.");
      return;
    }

    axios
      .post(`/member`, formData)
      .then((response) => {
        console.log(response.data);
        navigate(`/mem/starter`); //회원정보등록까지 마치면 member의 메인페이지로 바꾸기
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          console.error(
            "서버 응답 오류:",
            error.response.data.message || error.message
          );
        }
      });
  };

  return (
    <Container>
    <Row>
      <Col>
         <Card>
          <Card.Header as="h6" className="border-bottom p-3 mb-0">
            <h4> 회원 기본 설정 </h4>
          </Card.Header>
          <Card.Body className="">
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>키</Form.Label>
              <Form.Control
                type="text"
                name="member_height"
                placeholder="키를 입력해 주세요"
                value={formData.member_height}
                onChange={handleChange}
              />
              <small>키는 숫자로만 입력해 주세요</small>
            </Form.Group>
            <Form.Group>
              <Form.Label>몸무게</Form.Label>
              <Form.Control
                type="text"
                name="member_weight"
                placeholder="몸무게를 입력해 주세요"
                value={formData.member_weight}
                onChange={handleChange}
                
              />
              <small>몸무게는 숫자로만 입력해 주세요</small>
            </Form.Group>
            <Form.Group>
              <Form.Label>성별</Form.Label>
              <Form.Control
                as="select"
                name="member_gender"
                value={formData.member_gender}
                onChange={handleChange}
          
              >
                <option value="">성별 선택</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>개인 목표</Form.Label>
              <Form.Control
                as="textarea"
                name="plan"
                placeholder="개인목표를 입력해 주세요"
                rows={4}
                value={formData.plan}
                onChange={handleChange}
              
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>주간 목표</Form.Label>
              <Form.Control
                as="textarea"
                name="weeklyplan"
                placeholder="주간목표를 입력해 주세요"
                rows={4}
                value={formData.weeklyplan}
                onChange={handleChange}
              
              />
            </Form.Group>
            <Button
              variant="dark"
              type="submit"
            >
              완료
            </Button>
          </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>     
    </Container>
  );
};

export default MemberSignUp;
