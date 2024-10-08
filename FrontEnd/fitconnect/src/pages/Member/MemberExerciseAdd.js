import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, Button, Row, Col, Dropdown, DropdownButton, InputGroup, Form, Table, Modal, Alert } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"

function MemberExerciseAdd() {
  const { exercise_category, exercise_id } = useParams();

  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
    
  const today = new Date()
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const initialDateStr = queryParams.get("date") ? queryParams.get("date") : localDate
  const initialDate = new Date(initialDateStr)
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [exerciseCategory, setExerciseCategory] = useState("all");
  const [exerciseData, setExerciseData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectExercise, setSelectExercise] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [showDetailsOption, setShowDetailsOption] = useState(false);

  const token = localStorage.getItem('token')

  const [m_calendar_id, setMCalendarId] = useState(null);
  const [m_calendar_id_max, setMCalendarIdMax] = useState(null);

  const [member_num1, setMemberNum] = useState(null);

  useEffect(() => {
    const category = exerciseCategory === "all" ? `` : `/${exerciseCategory}`;

    axios.get(`/exerciselist` + category)
      .then((res) => {
        const validExerciseData = Array.isArray(res.data.exerList) 
          ? res.data.exerList.filter(item => item.exercise_name)
          : [];
        setExerciseData(validExerciseData)
      })
      .catch((error) => { console.error("운동목록 불러오기 실패", error) });
  }, [token, exerciseCategory]);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    axios.get('/membercalendar')
      .then(res => {
        const getMaxCalendarId = (data) => {
          if (!data || data.length === 0) {
            return null;
          }
          return Math.max(...data.map(event => event.m_calendar_id));
        };
              
        const maxCalendarId = getMaxCalendarId(res.data) + 1;
        setMCalendarIdMax(maxCalendarId);
        setMCalendarId(res.data.m_calendar_id)
      })
      .catch(error => console.log(error));

    axios.get(`/membercalendar`)
      .then(res => {
        const formattedSelectedDate = selectedDate.toISOString().split("T")[0];
        const temp_member_num = res.data[0]?.member_num || null;
        setMemberNum(temp_member_num)
        const filteredData = res.data.filter(item => {
          return item.regdate.split(" ")[0] === formattedSelectedDate && item.memo === "운동";
        });
        const mCalendarIds = filteredData.map(item => item.m_calendar_id);
        let mergedData = [];
        mCalendarIds.forEach(m_calendar_id => {
          axios.get(`/exercisejournal/${m_calendar_id}`)
            .then(res => {
              mergedData = mergedData.concat(res.data.exerJournalList || []);
              setSelectExercise([...mergedData]);
            })
            .catch(error => {
              console.error(`exercise Journal API 요청 실패 (m_calendar_id: ${m_calendar_id}):`, error);
            });
        })
      })
      .catch(error => console.log(error));
  }, [selectedDate])

  const exerciseSearch = Array.isArray(exerciseData) 
    ? exerciseData.filter((data) =>
        (data.exercise_name || "").toLowerCase().includes((search || "").toLowerCase())
      )
    : [];

  const handleExerciseDetail = (exercise_id) => {
    axios.get(`/exerciselist/${exercise_id}`)
      .then(res => {
        setModalData(res.data);
        setShowModal(true);
      })  
      .catch(error => console.log(error))
  }

  const handleCardClick = (exercise) => {
    if (!selectExercise.find(item => item.exercise_id === exercise.exercise_id)) {
      setSelectExercise([...selectExercise, { ...exercise, e_journal_id: `ej_${exercise.exercise_id}_${new Date().getTime()}` }]);
    }
  }

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectExercise);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectExercise(items);
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  const handleInputChange = (e, id, field) => {
    setSelectExercise((prevExercises) =>
      prevExercises.map((exercise) =>
        exercise.e_journal_id === id ? { ...exercise, [field]: e.target.value } : exercise
      )
    )
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    const formattedDate = date.toISOString().split("T")[0]
    navigate(`/member/exerciseadd?date=${formattedDate}`, { replace: true });
    window.location.reload();
  }

  const handleSubmit = () => {
    const requestData = selectExercise.map(exercise => {
      return {
        m_calendar_id: m_calendar_id_max,
        exercise_name: exercise.name,
        exercise_id: parseInt(exercise.exercise_id, 10),
        exercise_set: parseInt(exercise.exercise_set, 10),
        exercise_count: parseInt(exercise.exercise_count, 10),
        exercise_order: exercise.exercise_order !== undefined ? parseInt(exercise.exercise_order, 10) : 0,
        exercise_weight: parseFloat(exercise.exercise_weight, 10),
      };
    });

    const exercise_add_to_calendar = {
      member_num: member_num1,
      m_calendar_id: m_calendar_id_max,
      memo: "운동",
      regdate: selectedDate.toISOString().split("T")[0],
    };

    axios.post('/membercalendar', exercise_add_to_calendar)
      .then((res) => {
        console.log("calend", res)
      })
      .catch(error => {
        console.log(error);
        alert("저장 에러");
      });
                
    axios.post("/exercisejournal", requestData, {})
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess) {
          console.log("운동 추가 및 수정 완료");
        } else {
          console.error("응답 실패:", res.data);
          alert("저장에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("에러 발생:", error);
        if (error.response) {
          console.error("응답 데이터:", error.response.data);
          console.error("응답 상태 코드:", error.response.status);
          console.error("응답 헤더:", error.response.headers);
          alert(`에러 발생: ${JSON.stringify(error.response.data)}`);
        } else {
          console.error("에러 메시지:", error.message);
          alert(`에러 발생: ${error.message}`);
        }
      });
  };  

  return (
    <>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h6" className="border-bottom p-3 mb-0">
              <h2>{selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}의 운동 추가</h2>
              <div style={{ marginBottom: "20px" }}>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy년 MM월 dd일"
                  placeholderText="날짜를 선택하세요"
                />
              </div>
            </Card.Header>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={5}>
          <Card>
            <Card.Header as="h6" className="border-bottom p-3 mb-0">
              운동 추가하기
            </Card.Header>
            <Card.Body>
              <InputGroup className="mb-3">
                <DropdownButton variant="outline-secondary" title={exerciseCategory} id="input-group-dropdown-1">
                  <Dropdown.Item onClick={() => setExerciseCategory("all")}>전체</Dropdown.Item>
                  <Dropdown.Item onClick={() => setExerciseCategory("back")}>등</Dropdown.Item>
                  <Dropdown.Item onClick={() => setExerciseCategory("chest")}>가슴</Dropdown.Item>
                  <Dropdown.Item onClick={() => setExerciseCategory("shoulger")}>어깨</Dropdown.Item>
                  <Dropdown.Item onClick={() => setExerciseCategory("lower")}>하체</Dropdown.Item>
                  <Dropdown.Item onClick={() => setExerciseCategory("core")}>코어</Dropdown.Item>
                  <Dropdown.Item onClick={() => setExerciseCategory("arm")}>팔</Dropdown.Item>
                  <Dropdown.Item onClick={() => setExerciseCategory("aerobic")}>유산소</Dropdown.Item>
                </DropdownButton>
                <Form.Control onChange={handleChange} placeholder="운동목록 검색" type="text"/>
              </InputGroup>
        
              <Form.Group controlId="showDetailsCheckbox" className="mb-3">
                <Form.Check type="checkbox" label="운동 상세 보기" checked={showDetailsOption} onChange={(e) => setShowDetailsOption(e.target.checked)}/>
              </Form.Group>

              <Row>
                {exerciseSearch.map((data) => (
                  <Col key={data.exercise_id} xs={12} sm={6} md={4} lg={4} className="mb-3">
                    <Card onClick={() => handleCardClick(data)} style={{ cursor: "pointer" }}
                      className={`h-100 ${selectExercise.find((item) => item.exercise_id === data.exercise_id) ? "border-primary" : ""}`}>
                      <Card.Img variant="top" src={`http://52.78.38.12:8080/upload/${data.exercise_image}`} alt={data.exercise_name} style={{ height: "150px", objectFit: "cover" }}/>
                      <Card.Body className="d-flex justify-content-center align-items-center p-2">
                        <Card.Text className="text-center">{data.exercise_name}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={7} lg={6}>
          <Card>
            <Card.Header as="h6" className="border-bottom p-3 mb-0">
              선택한 운동목록
            </Card.Header>
            <Card.Body>
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="exerciseList">
                  {(provided) => (
                    <Table bordered {...provided.droppableProps} ref={provided.innerRef}>
                      <thead className="text-center">
                        <tr>
                          <th style={{ width: "30%" }}>운동명</th>
                          <th style={{ width: "15%" }}>무게</th>
                          <th style={{ width: "15%" }}>횟수</th>
                          <th style={{ width: "15%" }}>세트</th>
                          <th style={{ width: "10%" }}>순서</th>
                          <th style={{ width: "15%" }}>삭제 여부</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {selectExercise.map((data, index) => (
                          <Draggable key={data.e_journal_id} draggableId={data.e_journal_id} index={index}>
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  backgroundColor: snapshot.isDragging ? "#f0f8ff" : "white",
                                }}
                              >
                                <td>{data.exercise_name}</td>
                                <td>
                                  <Form.Control name="exercise_weight" type="number" value={data.exercise_weight || ""} placeholder="무게"
                                    onChange={(e) => handleInputChange(e, data.e_journal_id, "exercise_weight")}/>
                                </td>
                                <td>
                                  <Form.Control name="exercise_count" type="number" value={data.exercise_count || ""} placeholder="횟수"
                                    onChange={(e) => handleInputChange(e, data.e_journal_id, "exercise_count")}/>
                                </td>
                                <td>
                                  <Form.Control name="exercise_set" type="number" value={data.exercise_set || ""} placeholder="세트"
                                    onChange={(e) => handleInputChange(e, data.e_journal_id, "exercise_set")}/>
                                </td>
                                <td>{index + 1}</td>
                                <td>
                                  <Button variant="danger" size="sm"
                                    onClick={() => setSelectExercise(selectExercise.filter((item) => item.e_journal_id !== data.e_journal_id))}>
                                    삭제
                                  </Button>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    </Table>
                  )}
                </Droppable>
              </DragDropContext>
              <Button onClick={handleSubmit}>저장</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalData?.exercise_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={modalData?.saveImage} alt={modalData?.exercise_name} style={{ width: "100%", height: "auto", marginBottom: "15px" }}/>
          <p>{modalData?.exercise_info || "운동에 대한 상세 정보가 없습니다."}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MemberExerciseAdd;