import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import mqtt from 'mqtt';
import { Modal, Button } from 'react-bootstrap';
import ChatMessage from './ChatMessage';

const MessageModal = ({ showModal, setShowModal, topic }) => {
  const [message, setMessage] = useState({
<<<<<<< HEAD
    send_type: "TRAINER",  // 기본값 설정
=======
    send_type: "user",  // 기본값 설정
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3
    content: "",        // 메시지 내용
    topic: topic || ""  // props에서 받은 topic 값
  });
  const [messages, setMessages] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false); // 삭제 모드 상태 추가
  const messagesEndRef = useRef(null);
  const decoder = new TextDecoder('utf-8');

<<<<<<< HEAD
  const client = mqtt.connect('ws://52.78.38.12:9002'); // mqtt 연결 설정 코드

  const [isReady, setIsReady] = useState(false);
  const [areReady, setAreReady] = useState(false);

=======
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3
  // 메시지 목록을 새로고침하는 함수
  const refresh = () => {
    setMessages([]); // 기존 메시지 초기화
    if (topic) {
      axios.get(`/messenger/detail/${topic}`)
        .then(res => {
          setMessages(res.data.msgAll); // 서버에서 받은 메시지 데이터로 상태 업데이트
        })
        .catch(error => {
          console.log("Error fetching messages:", error);
        });
    }
  };

  useEffect(() => {
    refresh();
  }, [topic]);

  useEffect(() => {
    if (topic) {
<<<<<<< HEAD
      client.subscribe(topic); 
=======
      client.subscribe(topic); // topic에 대한 구독
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3
      client.on('message', (topic, message) => {
        const decodedMessage = JSON.parse(decoder.decode(new Uint8Array(message)));
        setMessages(prevMessages => [...prevMessages, decodedMessage]); // 새로운 메시지를 추가
      });

      return () => {
        client.end(); // 컴포넌트 언마운트 시 MQTT 연결 해제
      };
    }
  }, [topic]);

  // `topic`이 변경될 때마다 message.topic을 업데이트
  useEffect(() => {
    setMessage(prevMessage => ({
      ...prevMessage,
      topic: topic // topic을 업데이트
    }));
  }, [topic]);

<<<<<<< HEAD

=======
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3
  // 양식 제출이 일어났을 때 실행되는 핸들러
  const sendMessageHandle = (e) => {
    e.preventDefault();

    // 메시지를 전송하기 전에 필드 상태 확인
    console.log("Sending message:", message);

    // 모든 필드가 채워져 있는지 확인
<<<<<<< HEAD

=======
    if (message.content !== "" && message.topic !== "" && message.send_type !== "") {
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3
      // MQTT로 메시지 전송
      client.publish(topic, JSON.stringify(message), { qos: 0, retain: false });

      // 서버로 메시지 저장 요청
<<<<<<< HEAD
      setIsReady({...isReady, ready:true});

      // 메시지 필드 초기화
      setMessage({
        send_type: "TRAINER",  // send_type 유지
        content: "",        // 전송 후 content만 초기화
        topic: topic        // topic 유지
      });
  };


  useEffect(()=>{
    if(message.content !== "" && isReady.topic !== "" && isReady.ready){
      console.log(message)
      axios.post("/messenger/detail", message, {
        headers: {
          'Content-Type': 'multipart/form-data'
=======
      axios.post("/messenger/detail", message, {
        headers: {
          'Content-Type': 'application/json'  // 헤더에 Content-Type을 명시적으로 설정
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3
        }
      })
        .then(res => {
          console.log("Message sent successfully:", res.data);
          refresh(); // 메시지 전송 후 새로고침
        })
        .catch(error => {
          console.error("Error sending message:", error);
          if (error.response) {
            console.error("Server Response:", error.response.data);
            console.error("Status Code:", error.response.status);
            console.error("Headers:", error.response.headers);
          } else if (error.request) {
            console.error("No response from server:", error.request);
          } else {
            console.error("Error setting up the request:", error.message);
          }
        });
<<<<<<< HEAD
        setIsReady(false);
=======


      // 메시지 필드 초기화
      setMessage({
        send_type: "user",  // send_type 유지
        content: "",        // 전송 후 content만 초기화
        topic: topic        // topic 유지
      });
    } else {
      console.log("모든 필드를 입력해야 합니다.");
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3
    }
  }, [message.content, message.topic , isReady])


  // 특정 메시지를 삭제하는 함수
  const deleteMessage = (message_id) => {
    axios.delete(`/messenger/detail/${message_id}`)
      .then(res => {
        refresh(); // 삭제 후 메시지 목록 새로고침
      })
      .catch(err => console.log(err));
  };

<<<<<<< HEAD
  // 삭제 모달을 키는 함수
  const toggleDeleteMode = () => {
    setDeleteMode(prevState => !prevState); 
  };

  const handleContent = (e) =>{
    setMessage({ ...message, content: e.target.value })
  }
=======
  // 특정 메시지를 삭제하는 함수
  const deleteMessage = (message_id) => {
    axios.delete(`/messenger/detail/${message_id}`)
      .then(res => {
        console.log(`Message with id ${message_id} deleted successfully.`);
        refresh(); // 삭제 후 메시지 목록 새로고침
      })
      .catch(error => {
        console.error(`Error deleting message with id ${message_id}:`, error);
      });
  };

  // 삭제 모드를 토글하는 함수
  const toggleDeleteMode = () => {
    setDeleteMode(prevState => !prevState); // 삭제 모드를 토글
  };
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3

  return (
    <Modal show={showModal} onHide={() => {
      setMessages([]);
      setShowModal(false);
    }}>
      <Modal.Header closeButton>
        <Modal.Title>{topic}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
          {messages.map((msg, index) => (
            <div key={msg.message_id}>
              <ChatMessage message={msg.content} isOwnMessage={msg.send_type === message.send_type} />
              {/* 삭제 모드일 때만 삭제 버튼을 보여줌 */}
              {deleteMode && (
                <Button 
                  variant="danger" 
                  onClick={() => deleteMessage(msg.message_id)} 
                  style={{ fontSize: '12px',  }}>
                  X
                </Button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 삭제 모드 토글 버튼 */}
        <Button 
          variant={deleteMode ? "secondary" : "warning"} 
          onClick={toggleDeleteMode} 
          style={{marginTop: '5px' ,marginBottom: '5px', padding:'10px'}}>
          {deleteMode ? "삭제 취소" : "메세지 삭제"}
        </Button>

        <form onSubmit={sendMessageHandle} style={{ display: 'flex', marginTop: '10px' }}>
          <input
            type="text"
            value={message.content}
<<<<<<< HEAD
            onChange={handleContent}

=======
            onChange={(e) => setMessage({ ...message, content: e.target.value })}
>>>>>>> af86f934149f75b6ce17b56d57aa1447563a3ba3
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <Button type="submit" style={{ padding: '10px', borderRadius: '5px', marginLeft: '10px' }}>Send</Button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
          setMessages([]);
          setShowModal(false);
        }}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MessageModal;
