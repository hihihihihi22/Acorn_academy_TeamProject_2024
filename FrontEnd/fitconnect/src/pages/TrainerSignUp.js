import React, { useEffect, useState } from 'react';
import { Button, Form, Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../css/TrainerSignUp.module.css'; 
import classNames from 'classnames/bind';


//cx함수 만들기
const cx=classNames.bind(styles);


const TrainerSignUp = () => {
  const [formData, setFormData] = useState({
    trainer_num: "",
    trainer_insta: "",
    trainer_intro: "",
    gym_name: "",
    gym_link: ""
  });

  const navigate = useNavigate();


  const location = useLocation();
useEffect(() => {
  if (location.state && location.state.trainer_num) {
    setFormData(prevData => ({
      ...prevData,
      trainer_num: location.state.trainer_num
    }));
  }
}, [location]);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value,
  });
};

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`/trainer`, formData)
      .then(response => {
        console.log(response.data);
        navigate(`/`);  //트레이너 메인페이지로 이동하게끔 통합되면 수정
      })
      .catch(error => {
        if (error.response && error.response.data) {
          console.error("서버 응답 오류:", error.response?.data?.message || error.message); 
        }
      });
  };

  return (
    <Container className={cx('centerContainer')}>
      <div className={cx('signupForm')}>
        <h4 className={cx('textCenter')}> 트레이너 기본 설정 </h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>인스타그램</Form.Label>
          <Form.Control
            type="text"
            name="trainer_insta"
            placeholder="개인 SNS 링크를 첨부해 주세요"
            value={formData.trainer_insta}
            onChange={handleChange}
            className={cx("formControl")}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>자기소개</Form.Label>
          <Form.Control
            as="textarea"
            name="trainer_intro"
            placeholder="자기소개를 입력해 주세요"
            rows={5}
            value={formData.trainer_intro}
            onChange={handleChange}
            className={cx("formControl")}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>체육관 이름</Form.Label>
          <Form.Control
            type="text"
            name="gym_name"
             placeholder="체육관 이름을 입력해 주세요"
            value={formData.gym_name}
            onChange={handleChange}
            className={cx("formControl")}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>체육관 링크</Form.Label>
          <Form.Control
            type="text"
            name="gym_link"
             placeholder="체육관 링크를 첨부해 주세요"
            value={formData.gym_link}
            onChange={handleChange}
            className={cx("formControl")}
          />
        </Form.Group>
        <Button variant="dark" type="submit" className={cx('w100', 'mt3')} onClick={handleSubmit}>
        완료</Button>
      </Form>
      </div>
    </Container>
  );
};

export default TrainerSignUp;
